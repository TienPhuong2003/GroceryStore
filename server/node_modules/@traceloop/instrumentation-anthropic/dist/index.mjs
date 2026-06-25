import { __awaiter, __asyncGenerator, __asyncValues, __await } from 'tslib';
import { trace, context, SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { InstrumentationBase, InstrumentationNodeModuleDefinition, safeExecuteInTheMiddle } from '@opentelemetry/instrumentation';
import { SpanAttributes, CONTEXT_KEY_ALLOW_TRACE_CONTENT } from '@traceloop/ai-semantic-conventions';

var version = "0.20.0";

class AnthropicInstrumentation extends InstrumentationBase {
    constructor(config = {}) {
        super("@traceloop/instrumentation-anthropic", version, config);
    }
    setConfig(config = {}) {
        super.setConfig(config);
    }
    manuallyInstrument(module) {
        this._diag.debug(`Patching @anthropic-ai/sdk manually`);
        this._wrap(module.Anthropic.Completions.prototype, "create", this.patchAnthropic("completion", module));
        this._wrap(module.Anthropic.Messages.prototype, "create", this.patchAnthropic("chat", module));
        this._wrap(module.Anthropic.Beta.Messages.prototype, "create", this.patchAnthropic("chat", module));
    }
    init() {
        const module = new InstrumentationNodeModuleDefinition("@anthropic-ai/sdk", [">=0.9.1"], this.patch.bind(this), this.unpatch.bind(this));
        return module;
    }
    patch(moduleExports, moduleVersion) {
        this._diag.debug(`Patching @anthropic-ai/sdk@${moduleVersion}`);
        this._wrap(moduleExports.Anthropic.Completions.prototype, "create", this.patchAnthropic("completion", moduleExports));
        this._wrap(moduleExports.Anthropic.Messages.prototype, "create", this.patchAnthropic("chat", moduleExports));
        this._wrap(moduleExports.Anthropic.Beta.Messages.prototype, "create", this.patchAnthropic("chat", moduleExports));
        return moduleExports;
    }
    unpatch(moduleExports, moduleVersion) {
        this._diag.debug(`Unpatching @anthropic-ai/sdk@${moduleVersion}`);
        this._unwrap(moduleExports.Anthropic.Completions.prototype, "create");
        this._unwrap(moduleExports.Anthropic.Messages.prototype, "create");
        this._unwrap(moduleExports.Anthropic.Beta.Messages.prototype, "create");
    }
    patchAnthropic(type, moduleExports) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const plugin = this;
        // eslint-disable-next-line
        return (original) => {
            return function method(...args) {
                const span = type === "chat"
                    ? plugin.startSpan({
                        type,
                        params: args[0],
                    })
                    : plugin.startSpan({
                        type,
                        params: args[0],
                    });
                const execContext = trace.setSpan(context.active(), span);
                const execPromise = safeExecuteInTheMiddle(() => {
                    return context.with(execContext, () => {
                        var _a;
                        if ((_a = args === null || args === void 0 ? void 0 : args[0]) === null || _a === void 0 ? void 0 : _a.extraAttributes) {
                            delete args[0].extraAttributes;
                        }
                        return original.apply(this, args);
                    });
                }, (e) => {
                    if (e) {
                        plugin._diag.error("Error in Anthropic instrumentation", e);
                    }
                });
                if (args[0].stream) {
                    return context.bind(execContext, plugin._streamingWrapPromise(this._client, moduleExports, {
                        span,
                        type,
                        promise: execPromise,
                    }));
                }
                const wrappedPromise = plugin._wrapPromise(type, span, execPromise);
                return context.bind(execContext, wrappedPromise);
            };
        };
    }
    startSpan({ type, params, }) {
        var _a, _b;
        const attributes = {
            [SpanAttributes.LLM_SYSTEM]: "Anthropic",
            [SpanAttributes.LLM_REQUEST_TYPE]: type,
        };
        try {
            attributes[SpanAttributes.LLM_REQUEST_MODEL] = params.model;
            attributes[SpanAttributes.LLM_REQUEST_TEMPERATURE] = params.temperature;
            attributes[SpanAttributes.LLM_REQUEST_TOP_P] = params.top_p;
            attributes[SpanAttributes.LLM_TOP_K] = params.top_k;
            // Handle thinking parameters (for beta messages)
            const betaParams = params;
            if (betaParams.thinking && betaParams.thinking.type === "enabled") {
                attributes["llm.request.thinking.type"] = betaParams.thinking.type;
                attributes["llm.request.thinking.budget_tokens"] =
                    betaParams.thinking.budget_tokens;
            }
            if (type === "completion") {
                attributes[SpanAttributes.LLM_REQUEST_MAX_TOKENS] =
                    params.max_tokens_to_sample;
            }
            else {
                attributes[SpanAttributes.LLM_REQUEST_MAX_TOKENS] = params.max_tokens;
            }
            if (params.extraAttributes !== undefined &&
                typeof params.extraAttributes === "object") {
                Object.keys(params.extraAttributes).forEach((key) => {
                    attributes[key] = params.extraAttributes[key];
                });
            }
            if (this._shouldSendPrompts()) {
                if (type === "chat") {
                    let promptIndex = 0;
                    // If a system prompt is provided, it should always be first
                    if ("system" in params && params.system !== undefined) {
                        attributes[`${SpanAttributes.LLM_PROMPTS}.0.role`] = "system";
                        attributes[`${SpanAttributes.LLM_PROMPTS}.0.content`] =
                            typeof params.system === "string"
                                ? params.system
                                : JSON.stringify(params.system);
                        promptIndex += 1;
                    }
                    params.messages.forEach((message, index) => {
                        const currentIndex = index + promptIndex;
                        attributes[`${SpanAttributes.LLM_PROMPTS}.${currentIndex}.role`] =
                            message.role;
                        if (typeof message.content === "string") {
                            attributes[`${SpanAttributes.LLM_PROMPTS}.${currentIndex}.content`] = message.content || "";
                        }
                        else {
                            attributes[`${SpanAttributes.LLM_PROMPTS}.${currentIndex}.content`] = JSON.stringify(message.content);
                        }
                    });
                }
                else {
                    attributes[`${SpanAttributes.LLM_PROMPTS}.0.role`] = "user";
                    attributes[`${SpanAttributes.LLM_PROMPTS}.0.content`] = params.prompt;
                }
            }
        }
        catch (e) {
            this._diag.debug(e);
            (_b = (_a = this._config).exceptionLogger) === null || _b === void 0 ? void 0 : _b.call(_a, e);
        }
        return this.tracer.startSpan(`anthropic.${type}`, {
            kind: SpanKind.CLIENT,
            attributes,
        });
    }
    _streamingWrapPromise(client, moduleExports, { span, type, promise, }) {
        function iterateStream(stream) {
            return __asyncGenerator(this, arguments, function* iterateStream_1() {
                var _a, e_1, _b, _c, _d, e_2, _e, _f;
                var _g, _h, _j, _k;
                try {
                    if (type === "chat") {
                        const result = {
                            id: "0",
                            type: "message",
                            model: "",
                            role: "assistant",
                            stop_reason: null,
                            stop_sequence: null,
                            usage: {
                                input_tokens: 0,
                                output_tokens: 0,
                                cache_creation_input_tokens: 0,
                                cache_read_input_tokens: 0,
                                server_tool_use: null,
                                service_tier: null,
                            },
                            content: [],
                        };
                        try {
                            for (var _l = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = yield __await(stream_1.next()), _a = stream_1_1.done, !_a; _l = true) {
                                _c = stream_1_1.value;
                                _l = false;
                                const chunk = _c;
                                yield yield __await(chunk);
                                try {
                                    switch (chunk.type) {
                                        case "message_start":
                                            result.id = chunk.message.id;
                                            result.model = chunk.message.model;
                                            Object.assign(result.usage, chunk.message.usage);
                                            break;
                                        case "message_delta":
                                            if (chunk.usage) {
                                                Object.assign(result.usage, chunk.usage);
                                            }
                                            break;
                                        case "content_block_start":
                                            if (result.content.length <= chunk.index) {
                                                result.content.push(Object.assign({}, chunk.content_block));
                                            }
                                            break;
                                        case "content_block_delta":
                                            if (chunk.index < result.content.length) {
                                                const current = result.content[chunk.index];
                                                if (current.type === "text" &&
                                                    chunk.delta.type === "text_delta") {
                                                    result.content[chunk.index] = {
                                                        type: "text",
                                                        text: current.text + chunk.delta.text,
                                                        citations: current.citations,
                                                    };
                                                }
                                            }
                                            break;
                                    }
                                }
                                catch (e) {
                                    this._diag.debug(e);
                                    (_h = (_g = this._config).exceptionLogger) === null || _h === void 0 ? void 0 : _h.call(_g, e);
                                }
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (!_l && !_a && (_b = stream_1.return)) yield __await(_b.call(stream_1));
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        this._endSpan({ span, type, result });
                    }
                    else {
                        const result = {
                            id: "0",
                            type: "completion",
                            model: "",
                            completion: "",
                            stop_reason: null,
                        };
                        try {
                            for (var _m = true, _o = __asyncValues(stream), _p; _p = yield __await(_o.next()), _d = _p.done, !_d; _m = true) {
                                _f = _p.value;
                                _m = false;
                                const chunk = _f;
                                yield yield __await(chunk);
                                try {
                                    result.id = chunk.id;
                                    result.model = chunk.model;
                                    if (chunk.stop_reason) {
                                        result.stop_reason = chunk.stop_reason;
                                    }
                                    if (chunk.model) {
                                        result.model = chunk.model;
                                    }
                                    if (chunk.completion) {
                                        result.completion += chunk.completion;
                                    }
                                }
                                catch (e) {
                                    this._diag.debug(e);
                                    (_k = (_j = this._config).exceptionLogger) === null || _k === void 0 ? void 0 : _k.call(_j, e);
                                }
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (!_m && !_d && (_e = _o.return)) yield __await(_e.call(_o));
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                        this._endSpan({ span, type, result });
                    }
                }
                catch (error) {
                    span.setStatus({
                        code: SpanStatusCode.ERROR,
                        message: error.message,
                    });
                    span.recordException(error);
                    span.end();
                    throw error;
                }
            });
        }
        return new moduleExports.APIPromise(client, promise.responsePromise, (client, props) => __awaiter(this, void 0, void 0, function* () {
            const realStream = yield promise.parseResponse(client, props);
            // take the incoming stream, iterate it using our instrumented function, and wrap it in a new stream to keep the rich object type the same
            return new realStream.constructor(() => iterateStream.call(this, realStream), realStream.controller);
        }));
    }
    _wrapPromise(type, span, promise) {
        return promise
            .then((result) => {
            if (type === "chat") {
                this._endSpan({
                    type,
                    span,
                    result: result,
                });
            }
            else {
                this._endSpan({
                    type,
                    span,
                    result: result,
                });
            }
            return result;
        })
            .catch((error) => {
            span.setStatus({
                code: SpanStatusCode.ERROR,
                message: error.message,
            });
            span.recordException(error);
            span.end();
            throw error;
        });
    }
    _endSpan({ span, type, result, }) {
        var _a, _b, _c, _d, _e, _f;
        try {
            span.setAttribute(SpanAttributes.LLM_RESPONSE_MODEL, result.model);
            if (type === "chat" && result.usage) {
                span.setAttribute(SpanAttributes.LLM_USAGE_TOTAL_TOKENS, ((_a = result.usage) === null || _a === void 0 ? void 0 : _a.input_tokens) + ((_b = result.usage) === null || _b === void 0 ? void 0 : _b.output_tokens));
                span.setAttribute(SpanAttributes.LLM_USAGE_COMPLETION_TOKENS, (_c = result.usage) === null || _c === void 0 ? void 0 : _c.output_tokens);
                span.setAttribute(SpanAttributes.LLM_USAGE_PROMPT_TOKENS, (_d = result.usage) === null || _d === void 0 ? void 0 : _d.input_tokens);
            }
            if (result.stop_reason) {
                span.setAttribute(`${SpanAttributes.LLM_COMPLETIONS}.0.finish_reason`, result.stop_reason);
            }
            if (this._shouldSendPrompts()) {
                if (type === "chat") {
                    span.setAttribute(`${SpanAttributes.LLM_COMPLETIONS}.0.role`, "assistant");
                    span.setAttribute(`${SpanAttributes.LLM_COMPLETIONS}.0.content`, JSON.stringify(result.content));
                }
                else {
                    span.setAttribute(`${SpanAttributes.LLM_COMPLETIONS}.0.role`, "assistant");
                    span.setAttribute(`${SpanAttributes.LLM_COMPLETIONS}.0.content`, result.completion);
                }
            }
        }
        catch (e) {
            this._diag.debug(e);
            (_f = (_e = this._config).exceptionLogger) === null || _f === void 0 ? void 0 : _f.call(_e, e);
        }
        span.end();
    }
    _shouldSendPrompts() {
        const contextShouldSendPrompts = context
            .active()
            .getValue(CONTEXT_KEY_ALLOW_TRACE_CONTENT);
        if (contextShouldSendPrompts !== undefined) {
            return contextShouldSendPrompts;
        }
        return this._config.traceContent !== undefined
            ? this._config.traceContent
            : true;
    }
}

export { AnthropicInstrumentation };
//# sourceMappingURL=index.mjs.map

const require_types = require('./types.cjs');

//#region src/helpers/log.ts
const loggedKeys = /* @__PURE__ */ new Set();
/**
* Log a message exactly once per process lifetime.
* Subsequent calls with the same `key` are no-ops.
*/
function logOnce(logger, level, key, ...args) {
	if (loggedKeys.has(key)) return;
	loggedKeys.add(key);
	logger[level](...args);
}
/**
* Log a warning exactly once per process lifetime.
* Subsequent calls with the same `key` are no-ops.
*/
function warnOnce(logger, key, ...args) {
	logOnce(logger, "warn", key, ...args);
}
/**
* Wraps a string-first logger (e.g. Winston) so it accepts Pino-style
* object-first calls like `logger.info({ requestId: "abc" }, "message")`
*
* @example
* const inngest = new Inngest({
*   id: "my-app",
*   logger: wrapStringFirstLogger(winstonLogger),
* })
*/
function wrapStringFirstLogger(logger) {
	function wrap(method) {
		return (...args) => {
			if (args.length > 1 && require_types.isRecord(args[0]) && typeof args[1] === "string") {
				const [fields, message, ...rest] = args;
				logger[method](message, fields, ...rest);
			} else logger[method](...args);
		};
	}
	return {
		info: wrap("info"),
		warn: wrap("warn"),
		error: wrap("error"),
		debug: wrap("debug")
	};
}
function formatLogMessage(opts) {
	return [
		opts.message,
		opts.explanation,
		opts.action && `To fix: ${opts.action}`,
		opts.docs && `See: ${opts.docs}`,
		opts.code && `[${opts.code}]`
	].filter(Boolean).join(" ");
}

//#endregion
exports.formatLogMessage = formatLogMessage;
exports.logOnce = logOnce;
exports.warnOnce = warnOnce;
exports.wrapStringFirstLogger = wrapStringFirstLogger;
//# sourceMappingURL=log.cjs.map
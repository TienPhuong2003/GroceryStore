import { MaybePromise } from "../helpers/types.js";
import { Middleware } from "../components/middleware/middleware.js";
import { SendEventBaseOutput } from "../types.js";
import { Inngest } from "../components/Inngest.js";

//#region src/middleware/dependencyInjection.d.ts
/**
 * Adds properties to the function input for every function created using this
 * app.
 */
declare const dependencyInjectionMiddleware: <TCtx extends Record<string, any>>(
/**
 * The context to inject into the function input.
 */
ctx: TCtx) => {
  new ({
    client
  }: {
    client: Inngest.Any;
  }): {
    readonly id: "inngest:dependency-injection";
    transformFunctionInput(arg: Middleware.TransformFunctionInputArgs): Middleware.TransformFunctionInputArgs & {
      ctx: TCtx;
    };
    readonly client: Inngest.Any;
    functionOutputTransform: Middleware.DefaultStaticTransform;
    stepOutputTransform: Middleware.DefaultStaticTransform;
    onMemoizationEnd?(arg: Middleware.OnMemoizationEndArgs): MaybePromise<void>;
    onRunComplete?(arg: Middleware.OnRunCompleteArgs): MaybePromise<void>;
    onRunError?(arg: Middleware.OnRunErrorArgs): MaybePromise<void>;
    onRunStart?(arg: Middleware.OnRunStartArgs): MaybePromise<void>;
    onStepComplete?(arg: Middleware.OnStepCompleteArgs): MaybePromise<void>;
    onStepError?(arg: Middleware.OnStepErrorArgs): MaybePromise<void>;
    onStepStart?(arg: Middleware.OnStepStartArgs): MaybePromise<void>;
    transformSendEvent?(arg: Middleware.TransformSendEventArgs): MaybePromise<Middleware.TransformSendEventArgs>;
    transformStepInput?(arg: Middleware.TransformStepInputArgs): MaybePromise<Middleware.TransformStepInputArgs>;
    wrapFunctionHandler?(args: Middleware.WrapFunctionHandlerArgs): Promise<unknown>;
    wrapRequest?(args: Middleware.WrapRequestArgs): Promise<Middleware.Response>;
    wrapSendEvent?(args: Middleware.WrapSendEventArgs): Promise<SendEventBaseOutput>;
    wrapStep?(args: Middleware.WrapStepArgs): Promise<unknown>;
    wrapStepHandler?(args: Middleware.WrapStepHandlerArgs): Promise<unknown>;
  };
  onRegister?(args: Middleware.OnRegisterArgs): void;
};
//#endregion
export { dependencyInjectionMiddleware };
//# sourceMappingURL=dependencyInjection.d.ts.map
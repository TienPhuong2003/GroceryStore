import { InngestEndpointAdapter } from "./components/InngestEndpointAdapter.js";
import { SupportedFrameworkName } from "./types.js";
import { ServeHandlerOptions, SyncHandlerOptions } from "./components/InngestCommHandler.js";
import { NextRequest } from "next/server";

//#region src/next.d.ts

/**
 * The name of the framework, used to identify the framework in Inngest
 * dashboards and during testing.
 */
declare const frameworkName: SupportedFrameworkName;
/**
 * The shape of a request handler, supporting Next.js 12+.
 *
 * We are intentionally abstract with the arguments here, as Next.js's type
 * checking when building varies wildly between major versions; specifying
 * different types (even optional types) here can cause issues with the build.
 *
 * This change was initially made for Next.js 15, which specifies the second
 * argument as `RouteContext`, whereas Next.js 13 and 14 omit it and Next.js 12
 * provides a `NextApiResponse`, which is varies based on the execution
 * environment used (edge vs serverless).
 */
type RequestHandler = (expectedReq: NextRequest, res: unknown) => Promise<Response>;
/**
 * In Next.js, serve and register any declared functions with Inngest, making
 * them available to be triggered by events.
 *
 * Supports Next.js 12+, both serverless and edge.
 *
 * @example Next.js <=12 or the pages router can export the handler directly
 * ```ts
 * export default serve({ client: inngest, functions: [fn1, fn2] });
 * ```
 *
 * @example Next.js >=13 with the `app` dir must export individual methods
 * ```ts
 * export const { GET, POST, PUT } = serve({
 *            client: inngest,
 *            functions: [fn1, fn2],
 * });
 * ```
 *
 * @public
 */
declare const serve: (options: ServeHandlerOptions) => RequestHandler & {
  GET: RequestHandler;
  POST: RequestHandler;
  PUT: RequestHandler;
};
/**
 * In Next.js, create a function that can wrap any endpoint to be able to use
 * steps seamlessly within that API.
 *
 * Supports Next.js 12+, both serverless and edge.
 *
 * @example Next.js >=13 with the `app` dir
 * ```ts
 * // app/api/my-endpoint/route.ts
 * import { Inngest, step } from "inngest";
 * import { endpointAdapter } from "inngest/next";
 *
 * const inngest = new Inngest({
 *   id: "my-app",
 *   endpointAdapter,
 * });
 *
 * export const GET = inngest.endpoint(async (req) => {
 *   const foo = await step.run("my-step", () => ({ foo: "bar" }));
 *
 *   return new Response(`Result: ${JSON.stringify(foo)}`);
 * });
 * ```
 */
declare const endpointAdapter: ((options: SyncHandlerOptions) => (handler: (expectedReq: NextRequest, res: unknown) => Promise<Response>) => (expectedReq: NextRequest, res: unknown) => Promise<Response>) & (InngestEndpointAdapter.Like & (object | {
  createProxyHandler: InngestEndpointAdapter.ProxyFn;
}));
//#endregion
export { RequestHandler, endpointAdapter, frameworkName, serve };
//# sourceMappingURL=next.d.ts.map
import { Inngest } from "./Inngest.js";
import { SyncAdapterOptions, SyncHandlerOptions } from "./InngestCommHandler.js";

//#region src/components/InngestEndpointAdapter.d.ts
declare namespace InngestEndpointAdapter {
  const Tag: "Inngest.EndpointAdapter";
  /**
   * Options passed to the durable endpoint proxy handler factory.
   */
  interface ProxyHandlerOptions {
    /**
     * The Inngest client to use for API requests and middleware.
     */
    client: Inngest.Like;
  }
  type Fn = (options: SyncHandlerOptions) => any;
  type ProxyFn = (options: ProxyHandlerOptions) => any;
  interface Like extends Fn {
    readonly [Symbol.toStringTag]: typeof Tag;
    withOptions: (options: SyncAdapterOptions) => Like;
    /**
     * Creates a proxy handler for fetching durable endpoint results from Inngest.
     *
     * This is used by `inngest.endpointProxy()` to create framework-specific
     * handlers that can poll for and decrypt results.
     */
    createProxyHandler?: ProxyFn;
  }
  const create: <TFn extends Fn, TProxyFn extends ProxyFn | undefined>(rawFn: TFn, proxyFn?: TProxyFn) => TFn & Like & (TProxyFn extends ProxyFn ? {
    createProxyHandler: TProxyFn;
  } : object);
}
//#endregion
export { InngestEndpointAdapter };
//# sourceMappingURL=InngestEndpointAdapter.d.ts.map
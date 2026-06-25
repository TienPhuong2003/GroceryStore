const require_consts = require('./consts.cjs');

//#region src/helpers/url.ts
/**
* Resolves the API base URL based on the provided configuration.
*
* The resolution logic follows this order of precedence:
* 1. If an explicit `apiBaseUrl` is provided, use it directly
* 2. If in dev mode AND that mode was inferred (not explicitly set), check if
*    the dev server is available and use it if so
* 3. Fall back to the production API URL
*
* This function is used by both `InngestApi` and `ConnectionCore` to ensure
* consistent URL resolution logic across the SDK.
*/
function resolveApiBaseUrl(opts) {
	if (opts.apiBaseUrl !== void 0) return opts.apiBaseUrl;
	if (opts.mode === "dev") return require_consts.defaultDevServerHost;
	return require_consts.defaultInngestApiBaseUrl;
}

//#endregion
exports.resolveApiBaseUrl = resolveApiBaseUrl;
//# sourceMappingURL=url.cjs.map
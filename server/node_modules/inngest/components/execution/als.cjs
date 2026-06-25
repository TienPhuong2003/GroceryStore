
//#region src/components/execution/als.ts
/**
* A local-only symbol used as a key in global state to store the async local
* storage instance.
*/
const alsSymbol = Symbol.for("inngest:als");
const getCache = () => {
	const g = globalThis;
	if (!g[alsSymbol]) g[alsSymbol] = createCache();
	return g[alsSymbol];
};
const createCache = () => {
	const cache = {};
	cache.promise = initializeALS(cache);
	return cache;
};
const initializeALS = async (cache) => {
	try {
		const { AsyncLocalStorage } = await import("node:async_hooks");
		const als = new AsyncLocalStorage();
		cache.resolved = als;
		cache.isFallback = false;
		return als;
	} catch {
		const fallback = {
			getStore: () => void 0,
			run: (_, fn) => fn()
		};
		cache.resolved = fallback;
		cache.isFallback = true;
		console.warn("node:async_hooks is not supported in this runtime. Async context is disabled.");
		return fallback;
	}
};
/**
* Check if AsyncLocalStorage is unavailable and we're using the fallback.
* Returns `undefined` if ALS hasn't been initialized yet.
*/
const isALSFallback = () => {
	return getCache().isFallback;
};
/**
* Retrieve the async context for the current execution.
*/
const getAsyncCtx = async () => {
	return getAsyncLocalStorage().then((als) => als.getStore());
};
/**
* Retrieve the async context for the current execution synchronously.
* Returns undefined if ALS hasn't been initialized yet.
*/
const getAsyncCtxSync = () => {
	return getCache().resolved?.getStore();
};
/**
* Get a singleton instance of `AsyncLocalStorage` used to store and retrieve
* async context for the current execution.
*/
const getAsyncLocalStorage = async () => {
	return getCache().promise;
};

//#endregion
exports.getAsyncCtx = getAsyncCtx;
exports.getAsyncCtxSync = getAsyncCtxSync;
exports.getAsyncLocalStorage = getAsyncLocalStorage;
exports.isALSFallback = isALSFallback;
//# sourceMappingURL=als.cjs.map
import { SameThreadStrategy } from "./sameThread/index.js";

//#region src/components/connect/strategies/index.ts
/**
* Creates a connection strategy based on the provided options.
*
* By default, uses WorkerThreadStrategy when worker_threads is available.
* When `isolateExecution: false` is specified, uses SameThreadStrategy instead.
*/
async function createStrategy(config, options) {
	if (options.isolateExecution === false) return new SameThreadStrategy(config);
	try {
		const { WorkerThreadStrategy } = await import("./workerThread/index.js");
		return new WorkerThreadStrategy(config);
	} catch (err) {
		throw new Error("Failed to load worker thread strategy", { cause: err });
	}
}

//#endregion
export { createStrategy };
//# sourceMappingURL=index.js.map
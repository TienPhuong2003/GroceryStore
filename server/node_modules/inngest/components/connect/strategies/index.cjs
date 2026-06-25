const require_index = require('./sameThread/index.cjs');

//#region src/components/connect/strategies/index.ts
/**
* Creates a connection strategy based on the provided options.
*
* By default, uses WorkerThreadStrategy when worker_threads is available.
* When `isolateExecution: false` is specified, uses SameThreadStrategy instead.
*/
async function createStrategy(config, options) {
	if (options.isolateExecution === false) return new require_index.SameThreadStrategy(config);
	try {
		const { WorkerThreadStrategy } = await Promise.resolve().then(() => require("./workerThread/index.cjs"));
		return new WorkerThreadStrategy(config);
	} catch (err) {
		throw new Error("Failed to load worker thread strategy", { cause: err });
	}
}

//#endregion
exports.createStrategy = createStrategy;
//# sourceMappingURL=index.cjs.map
import { __export } from "../../_virtual/rolldown_runtime.js";
import { ExecutionVersion, debugPrefix } from "../../helpers/consts.js";
import Debug from "debug";

//#region src/components/execution/InngestExecution.ts
var InngestExecution_exports = /* @__PURE__ */ __export({
	ExecutionVersion: () => ExecutionVersion,
	InngestExecution: () => InngestExecution,
	PREFERRED_ASYNC_EXECUTION_VERSION: () => PREFERRED_ASYNC_EXECUTION_VERSION
});
/**
* The preferred execution version that will be used by the SDK when handling
* brand new runs where the Executor is allowing us to choose.
*
* Changing this should not ever be a breaking change, as this will only change
* new runs, not existing ones.
*/
const PREFERRED_ASYNC_EXECUTION_VERSION = ExecutionVersion.V2;
var InngestExecution = class {
	devDebug;
	constructor(options) {
		this.options = options;
		this.devDebug = Debug(`${debugPrefix}:${this.options.runId}`);
	}
};

//#endregion
export { InngestExecution, InngestExecution_exports, PREFERRED_ASYNC_EXECUTION_VERSION };
//# sourceMappingURL=InngestExecution.js.map
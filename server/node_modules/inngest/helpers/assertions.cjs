const require_consts = require('./consts.cjs');
const require_InngestFunction = require('../components/InngestFunction.cjs');
const require_Inngest = require('../components/Inngest.cjs');

//#region src/helpers/assertions.ts
/**
* While developers can often use `instanceof` to check if an object is a class
* instance, this is not always reliable, especially when dealing with objects
* that may have been created in different execution contexts or across
* different versions of the library.
*
* This module provides a set of type guards that use `*.Like` interfaces to
* recognize the objects instead of any other typing.
*
* These can be used internally and externally.
*
* @module
*/
/**
* Asserts that the given `input` is an `Inngest` object.
*/
const isInngest = (input) => {
	return input[Symbol.toStringTag] === require_Inngest.Inngest.Tag;
};
/**
* Asserts that the given `input` is an `InngestFunction` object.
*/
const isInngestFunction = (input) => {
	return input[Symbol.toStringTag] === require_InngestFunction.InngestFunction.Tag;
};
/**
* Asserts that the given `input` is a request originating from Inngest.
*/
const isInngestRequest = (input) => {
	try {
		const runId = input.headers.get(require_consts.headerKeys.InngestRunId);
		const signature = input.headers.get(require_consts.headerKeys.Signature);
		return Boolean(runId && typeof signature === "string");
	} catch {
		return false;
	}
};

//#endregion
exports.isInngest = isInngest;
exports.isInngestFunction = isInngestFunction;
exports.isInngestRequest = isInngestRequest;
//# sourceMappingURL=assertions.cjs.map
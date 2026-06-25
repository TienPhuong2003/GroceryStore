
//#region src/components/triggers/typeHelpers.ts
/**
* Type guard to check if an object has a `validate` method. The use case is for
* safely validating an event payload that might have a `validate` method
*/
function isValidatable(value) {
	if (typeof value !== "object" || value === null) return false;
	if (!("validate" in value)) return false;
	return typeof value.validate === "function";
}

//#endregion
exports.isValidatable = isValidatable;
//# sourceMappingURL=typeHelpers.cjs.map
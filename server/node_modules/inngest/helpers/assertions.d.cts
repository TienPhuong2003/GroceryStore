import { InngestFunction } from "../components/InngestFunction.cjs";
import { Inngest } from "../components/Inngest.cjs";

//#region src/helpers/assertions.d.ts

/**
 * Asserts that the given `input` is an `Inngest` object.
 */
declare const isInngest: (
/**
 * The input to check.
 */
input: unknown) => input is Inngest.Any;
/**
 * Asserts that the given `input` is an `InngestFunction` object.
 */
declare const isInngestFunction: (
/**
 * The input to check.
 */
input: unknown) => input is InngestFunction.Any;
/**
 * Asserts that the given `input` is a request originating from Inngest.
 */
declare const isInngestRequest: (
/**
 * The input to check.
 */
input: unknown) => boolean;
//#endregion
export { isInngest, isInngestFunction, isInngestRequest };
//# sourceMappingURL=assertions.d.cts.map
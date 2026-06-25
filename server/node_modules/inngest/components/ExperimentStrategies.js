import { getAsyncCtxSync } from "./execution/als.js";
import hashjs from "hash.js";

//#region src/components/ExperimentStrategies.ts
const { sha256 } = hashjs;
/**
* Hash a string to a float in [0, 1) using SHA-256.
*/
const hashToFloat = (str) => {
	const hex = sha256().update(str).digest("hex").slice(0, 8);
	return Number.parseInt(hex, 16) / 4294967296;
};
/**
* Given a float in [0, 1) and a weights map, select the variant whose bucket
* the float falls into. Entries are sorted alphabetically for determinism.
*/
const selectByWeight = (hash01, weights) => {
	const entries = Object.entries(weights).sort(([a], [b]) => a.localeCompare(b));
	const total = entries.reduce((sum, [, w]) => sum + w, 0);
	let cursor = 0;
	for (const [name, weight] of entries) {
		cursor += weight / total;
		if (hash01 < cursor) return name;
	}
	return entries[entries.length - 1][0];
};
/**
* Build equal weights from variant names: `{ a: 1, b: 1, ... }`.
*/
const equalWeights = (variantNames) => {
	return Object.fromEntries(variantNames.map((name) => [name, 1]));
};
/**
* Throw if all weights are zero.
*/
const validateWeights = (weights) => {
	for (const [name, w] of Object.entries(weights)) {
		if (!Number.isFinite(w)) throw new Error(`experiment.weighted(): weight for "${name}" is not a finite number (${w}); weights must be finite numbers >= 0`);
		if (w < 0) throw new Error(`experiment.weighted(): weight for "${name}" is negative (${w}); weights must be >= 0`);
	}
	if (Object.values(weights).reduce((sum, w) => sum + w, 0) <= 0) throw new Error("experiment.weighted(): all weights are zero; at least one weight must be positive");
};
/**
* Attach `__experimentConfig` to a select function, producing an
* `ExperimentSelectFn`.
*/
const createSelectFn = (fn, config) => {
	return Object.assign(fn, { __experimentConfig: config });
};
/**
* Factory functions for creating experiment selection strategies.
*
* Each factory returns an `ExperimentSelectFn` — a callable function with an
* `__experimentConfig` property carrying strategy metadata.
*
* @example
* ```ts
* import { experiment, group, step } from "inngest";
*
* const result = await group.experiment("checkout-flow", {
*   variants: {
*     control: () => step.run("old", () => oldCheckout()),
*     new_flow: () => step.run("new", () => newCheckout()),
*   },
*   select: experiment.weighted({ control: 80, new_flow: 20 }),
* });
* ```
*
* @public
*/
const experiment = {
	fixed(variantName) {
		return createSelectFn(() => variantName, { strategy: "fixed" });
	},
	weighted(weights) {
		validateWeights(weights);
		const frozen = { ...weights };
		return createSelectFn(() => {
			return selectByWeight(hashToFloat(getAsyncCtxSync()?.execution?.ctx.runId ?? crypto.randomUUID()), frozen);
		}, {
			strategy: "weighted",
			weights: frozen
		});
	},
	bucket(value, options) {
		if (options?.weights) validateWeights(options.weights);
		const str = value == null ? "" : String(value);
		return createSelectFn((variantNames) => {
			const weights = options?.weights ?? (variantNames ? equalWeights(variantNames) : void 0);
			if (!weights) throw new Error("experiment.bucket() requires either explicit weights or variant names from group.experiment()");
			return selectByWeight(hashToFloat(str), weights);
		}, {
			strategy: "bucket",
			weights: options?.weights,
			...value == null && { nullishBucket: true }
		});
	},
	custom(fn) {
		return createSelectFn(fn, { strategy: "custom" });
	}
};

//#endregion
export { experiment };
//# sourceMappingURL=ExperimentStrategies.js.map
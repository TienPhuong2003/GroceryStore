import { ExperimentSelectFn } from "./InngestGroupTools.cjs";

//#region src/components/ExperimentStrategies.d.ts

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
declare const experiment: {
  /**
   * Always selects the specified variant.
   *
   * @example
   * ```ts
   * select: experiment.fixed("control")
   * ```
   */
  fixed(variantName: string): ExperimentSelectFn;
  /**
   * Weighted random selection, seeded with the current run ID for
   * determinism — the same run always gets the same variant.
   *
   * @example
   * ```ts
   * select: experiment.weighted({ gpt4: 50, claude: 50 })
   * ```
   *
   * @throws If all weights are zero (validated at creation time).
   */
  weighted(weights: Record<string, number>): ExperimentSelectFn;
  /**
   * Consistent hashing — the same value always maps to the same variant.
   *
   * When `value` is `null` or `undefined`, an empty string is hashed instead.
   *
   * @example
   * ```ts
   * select: experiment.bucket(userId)
   * select: experiment.bucket(userId, { weights: { a: 70, b: 30 } })
   * ```
   */
  bucket(value: unknown, options?: {
    weights?: Record<string, number>;
  }): ExperimentSelectFn;
  /**
   * User-provided selection function. The function is called inside the
   * memoized step, so it only runs once per run.
   *
   * @example
   * ```ts
   * select: experiment.custom(async () => {
   *   const flag = await getFeatureFlag("checkout-variant");
   *   return flag;
   * })
   * ```
   */
  custom(fn: () => Promise<string> | string): ExperimentSelectFn;
};
//#endregion
export { experiment };
//# sourceMappingURL=ExperimentStrategies.d.cts.map
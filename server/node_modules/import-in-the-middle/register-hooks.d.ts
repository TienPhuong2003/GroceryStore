/**
 * Options for {@link register}. `include`/`exclude` accept bare specifiers,
 * `file:` URLs or regular expressions, matched against the module being
 * resolved.
 */
export type RegisterHooksOptions = {
  include?: Array<string | RegExp>
  exclude?: Array<string | RegExp>
}

/**
 * Registers `import-in-the-middle` as a *synchronous*, in-thread loader hook via
 * [`module.registerHooks()`](https://nodejs.org/api/module.html#moduleregisterhooksoptions).
 *
 * Unlike `module.register('import-in-the-middle/hook.mjs', ...)`, which runs the
 * loader on a separate thread and pays an IPC round-trip per resolved module,
 * synchronous hooks run on the application thread, so `Hook()` registrations are
 * visible to the loader directly and no acknowledgement step is required.
 *
 * Requires a Node.js version with `module.registerHooks()` (>= 22.15.0 / >= 24).
 *
 * ```ts
 * import { register } from 'import-in-the-middle/register-hooks.mjs'
 * import { Hook } from 'import-in-the-middle'
 *
 * register({ include: ['package-i-want-to-include'] })
 *
 * Hook(['package-i-want-to-include'], (exported, name, baseDir) => {
 *   // Instrument the module
 * })
 * ```
 *
 * @throws If `module.registerHooks()` is unavailable in the running Node.js.
 */
export declare function register(options?: RegisterHooksOptions): void

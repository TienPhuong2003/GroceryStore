# import-in-the-middle

**`import-in-the-middle`** is a module loading interceptor inspired by
[`require-in-the-middle`](https://npm.im/require-in-the-middle), but
specifically for ESM modules. In fact, it can even modify modules after loading
time.

## Usage

The API for
`require-in-the-middle` is followed as closely as possible as the default
export. There are lower-level `addHook` and `removeHook` exports available which
don't do any filtering of modules, and present the full file URL as a parameter
to the hook. See the Typescript definition file for detailed API docs.

You can modify anything exported from any given ESM or CJS module that's
imported in ESM files, regardless of whether they're imported statically or
dynamically.

```js
import { Hook } from 'import-in-the-middle'
import { foo } from 'package-i-want-to-modify'

console.log(foo) // whatever that module exported

Hook(['package-i-want-to-modify'], (exported, name, baseDir) => {
  // `exported` is effectively `import * as exported from ${url}`
  exported.foo += 1
})

console.log(foo) // 1 more than whatever that module exported
```

This requires the use of an ESM loader hook, which can be added with the following
command-line option.

```shell
node --loader=import-in-the-middle/hook.mjs my-app.mjs
```

Since `--loader` has been deprecated you can also register the loader hook programmatically via the Node
[`module.register()`](https://nodejs.org/api/module.html#moduleregisterspecifier-parenturl-options)
API. However, for this to be able to hook non-dynamic imports, it needs to be
registered before your app code is evaluated via the `--import` command-line option.

`my-loader.mjs`

```js
import * as module from 'module'

module.register('import-in-the-middle/hook.mjs', import.meta.url)
```

```shell
node --import=./my-loader.mjs ./my-code.mjs
```

When registering the loader hook programmatically, it's possible to pass a list
of modules, file URLs or regular expressions to either `exclude` or specifically
`include` which modules are intercepted. This is useful if a module is not
compatible with the loader hook.

> **Note:** This feature is incompatible with the `{internals: true}` Hook option

```js
import * as module from 'module'

// Exclude intercepting a specific module by name
module.register('import-in-the-middle/hook.mjs', import.meta.url, {
  data: { exclude: ['package-i-want-to-exclude'] }
})

// Only intercept a specific module by name
module.register('import-in-the-middle/hook.mjs', import.meta.url, {
  data: { include: ['package-i-want-to-include'] }
})
```

### Only Intercepting Hooked modules

> **Note:** This feature is experimental and is incompatible with the `{internals: true}` Hook option

If you are `Hook`'ing all modules before they are imported, for example in a
module loaded via the Node.js `--import` CLI argument, you can configure the
loader to intercept only modules that were specifically hooked.

`instrument.mjs`

```js
import { register } from 'module'
import { Hook, createAddHookMessageChannel } from 'import-in-the-middle'

const { registerOptions, waitForAllMessagesAcknowledged } = createAddHookMessageChannel()

register('import-in-the-middle/hook.mjs', import.meta.url, registerOptions)

Hook(['fs'], (exported, name, baseDir) => {
  // Instrument the fs module
})

// Ensure that the loader has acknowledged all the modules
// before we allow execution to continue
await waitForAllMessagesAcknowledged()
```

`my-app.mjs`

```js
import * as fs from 'fs'
// fs will be instrumented!
fs.readFileSync('file.txt')
```

```shell
node --import=./instrument.mjs ./my-app.mjs
```

## Synchronous loader hooks

On Node.js versions that provide
[`module.registerHooks()`](https://nodejs.org/api/module.html#moduleregisterhooksoptions)
(>= 22.15.0 / >= 24.0.0) the loader can run *synchronously*, on the application
thread, instead of on the separate thread that `module.register()` uses. Running
in-thread removes the message channel: `Hook()` registrations are visible to the
loader directly, so the `createAddHookMessageChannel` /
`waitForAllMessagesAcknowledged` step shown above is unnecessary.

`instrument.mjs`

```js
import { register } from 'import-in-the-middle/register-hooks.mjs'
import { Hook } from 'import-in-the-middle'

register({ include: ['package-i-want-to-include'] })

Hook(['package-i-want-to-include'], (exported, name, baseDir) => {
  // Instrument the module
})
```

```shell
node --import=./instrument.mjs ./my-app.mjs
```

`register()` accepts the same `include` / `exclude` options as the asynchronous
loader and throws on a Node.js version without `module.registerHooks()`.

### Custom matching with `shouldInclude`

Instead of `include` / `exclude` lists, you can pass a `shouldInclude(url, specifier)`
predicate to decide which modules are intercepted. It is called for every resolved
module with the resolved URL and the import specifier; return a truthy value to
intercept the module. When a predicate is provided it takes over the decision and
the `include` / `exclude` options are ignored.

This is useful when matching doesn't map cleanly onto bare specifiers, file URLs and
regular expressions — for example a matcher built from your own configuration, or a
decision that depends on more than the specifier.

```js
import { register } from 'import-in-the-middle/register-hooks.mjs'

register({
  shouldInclude (url, specifier) {
    return specifier === 'package-i-want-to-include' ||
      url.includes('/node_modules/some-scope/')
  }
})
```

The predicate receives only the URL and the specifier, never a resolved file path.
Because `module.register()` transfers its `data` to the loader thread by structured
clone — which cannot carry a function — `shouldInclude` is supported for synchronous
registration (`register-hooks.mjs`, shown above) and for predicates constructed on
the loader thread; it is not accepted through the `data` option of the asynchronous
`module.register('import-in-the-middle/hook.mjs', ...)`.

## Limitations

* You cannot add new exports to a module. You can only modify existing ones.
* While bindings to module exports end up being "re-bound" when modified in a
  hook, dynamically imported modules cannot be altered after they're loaded.
* Modules loaded via `require` are not affected at all.

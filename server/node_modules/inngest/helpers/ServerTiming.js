import { __export } from "../_virtual/rolldown_runtime.js";
import { runAsPromise } from "./promises.js";

//#region src/helpers/ServerTiming.ts
var ServerTiming_exports = /* @__PURE__ */ __export({ ServerTiming: () => ServerTiming });
/**
* A class to manage timing functions and arbitrary periods of time before
* generating a `Server-Timing` header for use in HTTP responses.
*
* This is a very simple implementation that does not support nested timings or
* fractions of a millisecond.
*/
var ServerTiming = class {
	timings = {};
	logger;
	constructor(logger) {
		this.logger = logger;
	}
	/**
	* Start a timing. Returns a function that, when called, will stop the timing
	* and add it to the header.
	*/
	start(name, description) {
		if (!this.timings[name]) this.timings[name] = {
			description: description ?? "",
			timers: []
		};
		const index = this.timings[name].timers.push({ start: Date.now() }) - 1;
		return () => {
			const target = this.timings[name];
			if (!target) return this.logger.warn({ timing: name }, "Timing does not exist");
			const timer = target.timers[index];
			if (!timer) return this.logger.warn({
				timing: name,
				index
			}, "Timer does not exist");
			timer.end = Date.now();
		};
	}
	/**
	* Add a piece of arbitrary, untimed information to the header. Common use
	* cases would be cache misses.
	*
	* @example
	* ```
	* timer.append("cache", "miss");
	* ```
	*/
	append(key, value) {
		this.timings[key] = {
			description: value,
			timers: []
		};
	}
	/**
	* Wrap a function in a timing. The timing will be stopped and added to the
	* header when the function resolves or rejects.
	*
	* The return value of the function will be returned from this function.
	*/
	async wrap(name, fn, description) {
		const stop = this.start(name, description);
		try {
			return await runAsPromise(fn);
		} finally {
			stop();
		}
	}
	/**
	* Generate the `Server-Timing` header.
	*/
	getHeader() {
		return Object.entries(this.timings).reduce((acc, [name, { description, timers }]) => {
			if (!timers.some((timer) => timer.end)) return acc;
			const dur = timers.reduce((acc$1, { start, end }) => {
				if (!start || !end) return acc$1;
				return acc$1 + (end - start);
			}, 0);
			const entry = [
				name,
				description ? `desc="${description}"` : "",
				dur ? `dur=${dur}` : ""
			].filter(Boolean).join(";");
			return [...acc, entry];
		}, []).join(", ");
	}
};

//#endregion
export { ServerTiming, ServerTiming_exports };
//# sourceMappingURL=ServerTiming.js.map
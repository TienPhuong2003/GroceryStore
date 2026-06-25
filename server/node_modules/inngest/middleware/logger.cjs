const require_types = require('../helpers/types.cjs');
const require_promises = require('../helpers/promises.cjs');

//#region src/middleware/logger.ts
/**
* Numeric ranking for log levels. Higher = more severe.
* Used to determine if a message should be logged based on configured level.
*/
const LOG_LEVEL_RANK = {
	debug: 0,
	info: 1,
	warn: 2,
	error: 3
};
/**
* Console-based logger. Not for production use.
*/
var ConsoleLogger = class {
	level;
	constructor(opts = {}) {
		this.level = opts.level ?? "info";
	}
	info(...args) {
		if (this.shouldLog("info")) this.logFormatted(console.info, args);
	}
	warn(...args) {
		if (this.shouldLog("warn")) this.logFormatted(console.warn, args);
	}
	error(...args) {
		if (this.shouldLog("error")) this.logFormatted(console.error, args);
	}
	debug(...args) {
		if (this.shouldLog("debug")) this.logFormatted(console.debug, args);
	}
	/**
	* Detect Pino-style `(object, string, ...rest)` calls and reformat for
	* console readability: message first, then structured fields.
	*/
	logFormatted(fn, args) {
		if (args.length > 1 && require_types.isRecord(args[0]) && typeof args[1] === "string") {
			const fields = args[0];
			const nonErrFields = Object.fromEntries(Object.entries(fields).filter(([key]) => {
				return key !== "err";
			}));
			const [, message, ...rest] = args;
			fn(message);
			if (fields.err) fn(fields.err);
			if (Object.keys(nonErrFields).length > 0) fn(nonErrFields);
			if (rest.length > 0) fn(...rest);
			return;
		}
		fn(...args);
	}
	shouldLog(level) {
		if (this.level === "silent") return false;
		let effectiveLevel = "info";
		if (this.level === "fatal") effectiveLevel = "error";
		else if (this.level in LOG_LEVEL_RANK) effectiveLevel = this.level;
		return LOG_LEVEL_RANK[level] >= LOG_LEVEL_RANK[effectiveLevel];
	}
};
/**
* ProxyLogger aims to provide a thin wrapper on user's provided logger.
* It's expected to be turned on and off based on the function execution
* context, so it doesn't result in duplicated logging.
*
* And also attempt to allow enough time for the logger to flush all logs.
*
* @public
*/
var ProxyLogger = class {
	logger;
	enabled = false;
	constructor(logger) {
		this.logger = logger;
		return new Proxy(this, { get(target, prop, receiver) {
			if (prop in target) return Reflect.get(target, prop, receiver);
			return Reflect.get(target.logger, prop, receiver);
		} });
	}
	info(...args) {
		if (!this.enabled) return;
		this.logger.info(...args);
	}
	warn(...args) {
		if (!this.enabled) return;
		this.logger.warn(...args);
	}
	error(...args) {
		if (!this.enabled) return;
		this.logger.error(...args);
	}
	debug(...args) {
		if (!this.enabled || !(typeof this.logger.debug === "function")) return;
		this.logger.debug(...args);
	}
	enable() {
		this.enabled = true;
	}
	disable() {
		this.enabled = false;
	}
	async flush() {
		if (this.logger.constructor.name == ConsoleLogger.name) return;
		const logger = this.logger;
		if (typeof logger.flush === "function") {
			await logger.flush();
			return;
		}
		await require_promises.resolveNextTick();
	}
};

//#endregion
exports.ConsoleLogger = ConsoleLogger;
exports.ProxyLogger = ProxyLogger;
//# sourceMappingURL=logger.cjs.map
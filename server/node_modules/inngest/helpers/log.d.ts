import { Logger } from "../middleware/logger.js";

//#region src/helpers/log.d.ts

/**
 * Wraps a string-first logger (e.g. Winston) so it accepts Pino-style
 * object-first calls like `logger.info({ requestId: "abc" }, "message")`
 *
 * @example
 * const inngest = new Inngest({
 *   id: "my-app",
 *   logger: wrapStringFirstLogger(winstonLogger),
 * })
 */
declare function wrapStringFirstLogger(logger: Logger): Logger;
//#endregion
export { wrapStringFirstLogger };
//# sourceMappingURL=log.d.ts.map
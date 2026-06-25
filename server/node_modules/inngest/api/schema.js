import { jsonErrorSchema } from "../types.js";
import { z } from "zod/v3";

//#region src/api/schema.ts
const errorSchema = z.object({
	error: z.string(),
	status: z.number()
});
const stepSchema = z.record(z.object({
	type: z.literal("data").optional().default("data"),
	data: z.any().refine((v) => typeof v !== "undefined", { message: "Data in steps must be defined" })
}).strict().or(z.object({
	type: z.literal("error").optional().default("error"),
	error: jsonErrorSchema
}).strict()).or(z.object({
	type: z.literal("input").optional().default("input"),
	input: z.any().refine((v) => typeof v !== "undefined", { message: "If input is present it must not be `undefined`" })
}).strict()).or(z.any().transform((v) => ({
	type: "data",
	data: v
})))).default({});
const batchSchema = z.array(z.record(z.any()).transform((v) => v));

//#endregion
export { batchSchema, errorSchema, stepSchema };
//# sourceMappingURL=schema.js.map
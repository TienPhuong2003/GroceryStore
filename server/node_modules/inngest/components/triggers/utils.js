import { internalEvents } from "../../helpers/consts.js";
import { NonRetriableError } from "../NonRetriableError.js";
import { EventType } from "./triggers.js";

//#region src/components/triggers/utils.ts
var EventValidationError = class EventValidationError extends NonRetriableError {
	constructor(message) {
		super(message);
		this.name = this.constructor.name;
	}
	static fromIssues(issues) {
		if (issues.length === 0) return new EventValidationError("Validation failed");
		return new EventValidationError(issues.map((issue) => {
			let path = "value";
			if (issue.path && issue.path.length > 0) path = issue.path.join(".");
			return `${path}: ${issue.message}`;
		}).join(", "));
	}
};
/**
* Validates data against a single schema, throwing an EventValidationError if
* validation fails.
*/
async function validateAgainstSchema(schema, data) {
	const result = await schema["~standard"].validate(data);
	if (result.issues) throw EventValidationError.fromIssues(result.issues);
}
/**
* Finds all validators that match an event name via wildcard patterns.
*
* A wildcard trigger like "user/*" matches any event starting with "user/".  An
* event like "user/foo/bar" can match multiple wildcards (e.g. "user/*" and
* "user/foo/*").
*
* @returns Array of validators for matching wildcard triggers. Includes `null`
*          entries for wildcards without schemas (meaning "no validation
*          needed").
*/
function findWildcardValidators(eventName, validators) {
	const matchingValidators = [];
	for (const [triggerName, validator] of Object.entries(validators)) {
		if (!triggerName.endsWith("*")) continue;
		const wildcardPrefix = triggerName.slice(0, -1);
		if (eventName.startsWith(wildcardPrefix)) matchingValidators.push(validator);
	}
	return matchingValidators;
}
/**
* Creates a combined validator that runs all provided validators and succeeds
* if at least one passes (i.e. union validation).
*/
function createUnionValidator(validators) {
	const nonNullValidators = validators.filter(isNotNull);
	if (nonNullValidators.length === 0) return null;
	return async (data) => {
		await throwIfAllRejected(nonNullValidators.map((validator) => {
			return validator(data);
		}));
	};
}
/**
* Validates a tuple of events against a tuple of triggers. Throws an error if
* there's at least 1 event fails validation.
*
* Some special behaviors:
* - If no invoke trigger is present, invoke events are validated against all
*   event schemas.
* - If 1 or more invoke triggers is present, invoke events are only validated
*   against the invoke trigger schemas.
*/
async function validateEvents(events, triggers) {
	const validatorsByTrigger = createValidatorsByTrigger(createSchemasByTrigger(triggers));
	const validationPromises = [];
	for (const event of events) {
		const validator = getValidatorForEvent(event.name, validatorsByTrigger);
		if (validator === null) continue;
		validationPromises.push(validator(event.data));
	}
	await Promise.all(validationPromises);
}
/**
* Gets the appropriate validator for an event, handling both direct matches
* and wildcard pattern matching.
*
* @throws EventValidationError if the event doesn't match any triggers
*/
function getValidatorForEvent(eventName, validatorsByEvent) {
	const directValidator = validatorsByEvent[eventName];
	if (directValidator !== void 0) return directValidator;
	const wildcardValidators = findWildcardValidators(eventName, validatorsByEvent);
	if (wildcardValidators.length > 0) return createUnionValidator(wildcardValidators);
	throw new EventValidationError(`Event not found in triggers: ${eventName}`);
}
/**
* Parses a trigger to extract its event name and optional schema.
*
* Triggers can be specified in several forms:
* - Direct EventType: `eventType("my-event")`
* - Nested EventType: `{ event: eventType("my-event") }`
* - String event name: `{ event: "my-event" }`
* - Cron trigger: `cron("0 0 * * *")`
*
* @returns The event name and schema (null if no schema is attached)
* @throws EventValidationError if the trigger format is invalid
*/
function parseTrigger(trigger) {
	if (trigger instanceof EventType) return {
		eventName: trigger.name,
		schema: trigger.schema
	};
	if (trigger.event instanceof EventType) return {
		eventName: trigger.event.name,
		schema: trigger.event.schema
	};
	if (typeof trigger.event === "string") return {
		eventName: trigger.event,
		schema: null
	};
	if (trigger.cron) return {
		eventName: internalEvents.ScheduledTimer,
		schema: null
	};
	throw new EventValidationError("Invalid trigger");
}
/**
* Create a map of trigger names to their schemas.
*/
function createSchemasByTrigger(triggers) {
	const schemasByEvent = {};
	for (const trigger of triggers) {
		const { eventName, schema } = parseTrigger(trigger);
		if (schema) schemasByEvent[eventName] = [...schemasByEvent[eventName] ?? [], schema];
		else schemasByEvent[eventName] = schemasByEvent[eventName] ?? [];
	}
	return schemasByEvent;
}
/**
* Creates a validator that validates data against multiple schemas, succeeding
* if at least one schema passes (union validation).
*/
function createSchemaUnionValidator(schemas) {
	if (schemas.length === 0) return null;
	return async (data) => {
		await throwIfAllRejected(schemas.map((schema) => validateAgainstSchema(schema, data)));
	};
}
/**
* Create a map of trigger names to their validators.
*
* If no invoke schemas are specified, the invoke schema is implicitly a union
* of all event schemas.
*/
function createValidatorsByTrigger(schemasByTrigger) {
	const validatorsByTrigger = {};
	for (const [triggerName, schemas] of Object.entries(schemasByTrigger)) validatorsByTrigger[triggerName] = createSchemaUnionValidator(schemas);
	if (!(validatorsByTrigger[internalEvents.FunctionInvoked] !== void 0)) {
		const allSchemas = Object.values(schemasByTrigger).flat();
		validatorsByTrigger[internalEvents.FunctionInvoked] = createSchemaUnionValidator(allSchemas);
	}
	return validatorsByTrigger;
}
/**
* Only throw if all promises are rejected.
*/
async function throwIfAllRejected(promises) {
	const settled = await Promise.allSettled(promises);
	let error;
	for (const result of settled) {
		if (result.status === "rejected") error = result.reason;
		if (result.status === "fulfilled") return;
	}
	if (error) throw error;
}
function isNotNull(value) {
	return value !== null;
}

//#endregion
export { validateEvents };
//# sourceMappingURL=utils.js.map
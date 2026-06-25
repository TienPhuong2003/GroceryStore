//#region src/components/InngestDurableEndpointProxy.ts
/**
* Default CORS headers for durable endpoint proxy responses.
*/
const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type"
};
/**
* Helper to create a JSON response with CORS headers.
*/
const jsonResponse = (status, body) => ({
	status,
	headers: {
		"Content-Type": "application/json",
		...corsHeaders
	},
	body: typeof body === "string" ? body : JSON.stringify(body)
});
/**
* Helper to create an error response.
*/
const errorResponse = (status, message) => jsonResponse(status, { error: message });
/**
* Core durable endpoint proxy logic - framework-agnostic.
*
* This function handles the common logic for durable endpoint proxy handlers:
* - CORS preflight handling
* - Parameter validation
* - Fetching results from Inngest API
* - Decrypting results via middleware (if configured)
*
* Framework adapters wrap this with their specific Request/Response types.
*
* @param client - The Inngest client to use for API requests and decryption
* @param ctx - The request context containing runId, token, and method
* @returns A DurableEndpointProxyResult with status, headers, and body
*/
async function handleDurableEndpointProxyRequest(client, ctx) {
	if (ctx.method === "OPTIONS") return {
		status: 204,
		headers: {
			...corsHeaders,
			"Access-Control-Max-Age": "86400"
		},
		body: ""
	};
	const { runId, token } = ctx;
	if (!runId || !token) return errorResponse(400, "Missing runId or token query parameter");
	try {
		const response = await client["inngestApi"].getRunOutput(runId, token);
		if (!response.ok) return jsonResponse(response.status, await response.text());
		let body = await response.json();
		body = await client["decryptProxyResult"](body);
		return jsonResponse(200, body);
	} catch (error) {
		return errorResponse(500, error instanceof Error ? error.message : "Failed to fetch run output");
	}
}

//#endregion
export { handleDurableEndpointProxyRequest };
//# sourceMappingURL=InngestDurableEndpointProxy.js.map
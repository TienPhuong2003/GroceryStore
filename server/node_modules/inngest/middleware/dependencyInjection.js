import { Middleware } from "../components/middleware/middleware.js";

//#region src/middleware/dependencyInjection.ts
/**
* Adds properties to the function input for every function created using this
* app.
*/
const dependencyInjectionMiddleware = (ctx) => {
	class DependencyInjectionMiddleware extends Middleware.BaseMiddleware {
		id = "inngest:dependency-injection";
		transformFunctionInput(arg) {
			return {
				...arg,
				ctx: {
					...arg.ctx,
					...ctx
				}
			};
		}
	}
	return DependencyInjectionMiddleware;
};

//#endregion
export { dependencyInjectionMiddleware };
//# sourceMappingURL=dependencyInjection.js.map
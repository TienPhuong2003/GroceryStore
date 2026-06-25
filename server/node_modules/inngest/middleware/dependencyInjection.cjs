const require_middleware = require('../components/middleware/middleware.cjs');

//#region src/middleware/dependencyInjection.ts
/**
* Adds properties to the function input for every function created using this
* app.
*/
const dependencyInjectionMiddleware = (ctx) => {
	class DependencyInjectionMiddleware extends require_middleware.Middleware.BaseMiddleware {
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
exports.dependencyInjectionMiddleware = dependencyInjectionMiddleware;
//# sourceMappingURL=dependencyInjection.cjs.map
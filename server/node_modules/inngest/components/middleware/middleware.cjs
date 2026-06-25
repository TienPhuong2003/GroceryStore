
//#region src/components/middleware/middleware.ts
let Middleware;
(function(_Middleware) {
	class BaseMiddleware {
		client;
		constructor({ client }) {
			this.client = client;
		}
	}
	_Middleware.BaseMiddleware = BaseMiddleware;
})(Middleware || (Middleware = {}));

//#endregion
Object.defineProperty(exports, 'Middleware', {
  enumerable: true,
  get: function () {
    return Middleware;
  }
});
//# sourceMappingURL=middleware.cjs.map
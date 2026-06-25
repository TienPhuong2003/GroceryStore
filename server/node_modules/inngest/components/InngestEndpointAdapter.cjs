
//#region src/components/InngestEndpointAdapter.ts
let InngestEndpointAdapter;
(function(_InngestEndpointAdapter) {
	const Tag = _InngestEndpointAdapter.Tag = "Inngest.EndpointAdapter";
	_InngestEndpointAdapter.create = (rawFn, proxyFn) => {
		const scopedOptions = {};
		const fn = (options) => rawFn({
			...scopedOptions,
			...options
		});
		const properties = {
			[Symbol.toStringTag]: { value: Tag },
			withOptions: { value: (options) => {
				Object.assign(scopedOptions, options);
				return fn;
			} }
		};
		if (proxyFn) properties["createProxyHandler"] = { value: proxyFn };
		return Object.defineProperties(fn, properties);
	};
})(InngestEndpointAdapter || (InngestEndpointAdapter = {}));

//#endregion
Object.defineProperty(exports, 'InngestEndpointAdapter', {
  enumerable: true,
  get: function () {
    return InngestEndpointAdapter;
  }
});
//# sourceMappingURL=InngestEndpointAdapter.cjs.map
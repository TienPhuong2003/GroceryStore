//#region src/components/middleware/types.d.ts
/**
 * Turn into an "open string union". This is a string union that allows for
 * additional strings to be added to the union. This means adding a new union
 * member won't be a breaking change, but it'll still include autocompletion for
 * the union members
 */
type OpenStringUnion<T> = T | (string & {});
//#endregion
export { OpenStringUnion };
//# sourceMappingURL=types.d.ts.map
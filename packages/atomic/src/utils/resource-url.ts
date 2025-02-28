/// <reference types="../types/custom-env" />
// TODO: get rid of the mock once no longer running stencil tests

// import.meta is an ESM only feature and cannot be used in CJS.
// To avoid errors such as "SyntaxError: Cannot use 'import.meta' outside a module error" when running stencil tests, we need to mock this function in the tests.
export const getResourceUrl = () => import.meta.env?.RESOURCE_URL;

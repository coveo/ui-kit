import {vi} from 'vitest';

export const fetch = vi.fn();
export const Headers = globalThis.Headers;
export const Request = globalThis.Request;
export const Response = globalThis.Response;

export default fetch;

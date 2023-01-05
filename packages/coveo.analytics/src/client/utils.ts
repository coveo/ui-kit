// Object.keys returns `string[]` this adds types
// see https://github.com/microsoft/TypeScript/pull/12253#issuecomment-393954723
export const keysOf = Object.keys as <T>(o: T) => Extract<keyof T, string>[];
export function isObject(o: any): boolean {
    return o !== null && typeof o === 'object' && !Array.isArray(o);
}

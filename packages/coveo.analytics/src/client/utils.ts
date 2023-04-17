// Object.keys returns `string[]` this adds types
// see https://github.com/microsoft/TypeScript/pull/12253#issuecomment-393954723
export const keysOf = Object.keys as <T>(o: T) => Extract<keyof T, string>[];
export function isObject(o: any): boolean {
    return o !== null && typeof o === 'object' && !Array.isArray(o);
}

/**
 * Attempt to coerce strings to number values.
 * Any non-number characters will fail parsing, in which case the input string is returned.
 *
 * @param input The input to possibly coerce to a number, if it is a string and parses to a number.
 * @returns The input, possibly coerced to a number.
 */
export function coerceToNumber(input: any): any {
    return typeof input === 'string' && input != '' && !Number.isNaN(+input) ? +input : input;
}

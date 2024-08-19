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

/**
 * Can be used to both check if the first bit is set (for any utf-8 multibyte part),
 * and to detect "following bytes" (which start with `10xx_xxxx`)
 */
const UTF8_HIGH_BIT = 0b1000_0000;
/** Header for a 2-byte code point: `110x_xxxx`. Can also be used as bit-mask to check for "following bytes". */
const UTF8_HEADER_2 = 0b1100_0000;
/** Header for a 3-byte code point: `1110_xxxx`. Can also be used as bit-mask to check for "header 2". */
const UTF8_HEADER_3 = 0b1110_0000;
/** Header for a 4-byte code point: `1111_0xxx`. Can also be used as bit-mask to check for "header 3". */
const UTF8_HEADER_4 = 0b1111_0000;

function utf8ByteCountFromFirstByte(firstByte: number): number {
    if ((firstByte & 0b1111_1000) === UTF8_HEADER_4) {
        return 4;
    }
    if ((firstByte & UTF8_HEADER_4) === UTF8_HEADER_3) {
        return 3;
    }
    if ((firstByte & UTF8_HEADER_3) === UTF8_HEADER_2) {
        return 2;
    }
    return 1;
}

/**
 * Truncate a URL to an arbitrary length, taking care to not break inside a percent escape or UTF-8 multibyte sequence.
 *
 * @param input The input to truncate to the specified limit.
 * @param limit The limit to apply; if negative, no truncation is applied.
 * @returns The URL, possibly truncated to a length near limit (at most 11 characters less than limit).
 */
export function truncateUrl(input: string, limit: number): string {
    if (limit < 0 || input.length <= limit) {
        return input;
    }
    // A valid escape sequence is a percent followed by 2 hexadecimal characters; check if we split one up.
    let end = input.indexOf('%', limit - 2);
    if (end < 0 || end > limit) {
        end = limit;
    } else {
        limit = end;
    }
    // Check that truncating at end won't break up an UTF-8 multibyte sequence half-way,
    // by peeking backwards to find the first byte of an UTF-8 sequence (if present).
    while (end > 2 && input.charAt(end - 3) == '%') {
        const peekByte = Number.parseInt(input.substring(end - 2, end), 16);
        // Note: if parsing fails, NaN gets coerced to 0 by the bitwise and.
        if ((peekByte & UTF8_HIGH_BIT) != UTF8_HIGH_BIT) {
            break;
        }
        end -= 3;
        // Check if we reached the first byte by checking it is not a "follow byte": 10xx_xxxx.
        if ((peekByte & UTF8_HEADER_2) != UTF8_HIGH_BIT) {
            // If the full code point is there, keep it.
            if (limit - end >= utf8ByteCountFromFirstByte(peekByte) * 3) {
                end = limit;
            }
            // Otherwise, end is already set at the correct point to truncate at (the start of the multibyte sequence).
            break;
        }
    }
    return input.substring(0, end);
}

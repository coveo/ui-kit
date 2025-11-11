import {Directive, directive} from 'lit/directive.js';
import {classMap} from 'lit/directives/class-map.js';

export const tw = <T extends {[x: string]: boolean}>(
  rec: NoDuplicateWords<T>
) => rec;

/**
 * A utility type that splits a string `Word` into an array of substrings based on a specified `Separator`.
 * The splitting process is recursive and stops when the recursion `Limit` is reached.
 *
 * ### Parameters:
 * - `Word`: The string to be split.
 * - `Separator`: The character used to split the string (for example, `' '` for spaces).
 * - `Limit`: The maximum number of splits allowed to avoid a deep recursion (default is 30).
 * - `Count`: An internal parameter used to track the recursion depth (default is an empty array).
 *
 * ### Behavior:
 * - If the recursion depth (`Count['length']`) reaches the `Limit`, the type stops splitting.
 * - If the `Word` contains the `Separator`, it recursively splits the string into substrings.
 * - If the `Word` does not contain the `Separator`, it returns the `Word` as a single-element array.
 *
 * ### Example Usage:
 * ```typescript
 * type Result1 = Split<'a b c d', ' '>;
 * // Result1: ['a', 'b', 'c', 'd']
 *
 * type Result2 = Split<'a b c d e f g h i j', ' ', 5>;
 * // Result2: ['a', 'b', 'c', 'd', 'e', 'Recursion limit reached. Ensure the input string is not too long.', 'f g h i j']
 *
 * type Result3 = Split<'singleword', ' '>;
 * // Result3: ['singleword']
 * ```
 *
 * ### Notes:
 * - The `Limit` parameter ensures that the type does not exceed TypeScript's recursion depth limit.
 * - If the recursion limit is reached, a warning message is included in the result to indicate the issue.
 */
type Split<
  Word extends string,
  Separator extends string,
  Limit extends number = 30,
  Count extends unknown[] = [],
> = Count['length'] extends Limit
  ? ['$$recursion_limit_reached_flag$$']
  : Word extends `${infer PreviousWord}${Separator}${infer NextWord}`
    ? [PreviousWord, ...Split<NextWord, Separator, Limit, [unknown, ...Count]>]
    : [Word];

/**
 * Maps each key in the record `T` to its individual words (split by spaces).
 *
 * ### Parameters:
 * - `T`: A record where keys are strings (potentially containing multiple space-separated words) and values are booleans.
 *
 * ### Behavior:
 * - For each key in `T`, the key is split into individual words using the `Split` type.
 * - The result is a mapped type where each key in `T` corresponds to the individual words in that key.
 *
 * ### Example Usage:
 * ```typescript
 * type Example = WordMap<{
 *   'foo bar': true;
 *   'bar baz': false;
 * }>;
 * // Example: {
 * //   'foo bar': 'foo' | 'bar';
 * //   'bar baz': 'bar' | 'baz';
 * // }
 * ```
 */
type WordMap<T extends Record<string, boolean>> = {
  [K in keyof T]: Extract<
    Split<K & string, ' '>[number],
    '$$recursion_limit_reached_flag$$'
  > extends never
    ? Split<K & string, ' '>[number]
    : '$$recursion_limit_reached_flag$$';
};

/**
 * Identifies duplicate words across the keys of the record `T`.
 *
 * ### Parameters:
 * - `T`: A record where keys are strings (potentially containing multiple space-separated words) and values are booleans.
 *
 * ### Behavior:
 * - The result is a union of all duplicate words across the keys of `T`.
 *
 * ### Example Usage:
 * ```typescript
 * type Example = DuplicateWords<{
 *   'foo bar': true;
 *   'bar baz': false;
 * }>;
 * // Example: 'bar'
 * ```
 */
type DuplicateWords<T extends Record<string, boolean>> = {
  [K in keyof T]: WordMap<T>[K] extends '$$recursion_limit_reached_flag$$'
    ? false
    : Extract<WordMap<T>[K], WordMap<T>[Exclude<keyof T, K>]>;
}[keyof T];

/**
 * Ensures that no duplicate words exist in the keys of the record `T`.
 * Throws a static error if duplicates are found, if the recursion limit is reached, or if any other issue is detected.
 */
type NoDuplicateWords<T extends Record<string, boolean>> =
  string extends keyof T // Check if runtime values are being used
    ? T // Allow runtime values without static checks
    : DuplicateWords<T> extends never
      ? T
      : DuplicateWords<T> extends false
        ? 'Recursion limit reached in class map. Ensure the class list is not too long.'
        : 'Duplicate class detected in class map. Ensure that no class appears in more than one key.';

class MultiClassMapDirective extends Directive {
  /**
   * A Lit directive that dynamically applies CSS classes to an element.
   *
   * This directive extends the functionality of the Lit [`classMap`](https://lit.dev/docs/templates/directives/#classmap)
   * by allowing multiple space-separated class names in a single key.
   *
   * ### Behavior:
   * - If a key contains multiple classes (for example, `'foo bar'`), all classes in the key are applied if the value is `true`.
   * - If a class appears in multiple keys, the `true` value takes precedence over `false`.
   *
   * ### Example:
   * ```typescript
   * const classMap = {
   *   'foo bar': true,
   *   'bar fiz': false,
   * };
   *
   * html`<div class=${multiClassMap(classMap)}></div>`;
   * ```
   * **Output:**
   * ```html
   * <div class="foo bar"></div>
   * ```
   *
   * ### Notes:
   * - Avoid defining multiple keys with overlapping class names, as it can lead to unintended behavior.
   * - Limit the classes to a reasonable number to prevent performance issues.
   * - The directive ensures that the final class list is deduplicated and respects precedence rules.
   */
  render(classInfo: Record<string, boolean>) {
    const processedClassMap: Record<string, boolean> = {};

    for (const [key, value] of Object.entries(classInfo)) {
      if (value) {
        key.split(/\s+/).forEach((cls) => {
          processedClassMap[cls] = true;
        });
      }
    }

    return classMap(processedClassMap);
  }
}

export function multiClassMap<T extends Record<string, boolean>>(
  record: NoDuplicateWords<T>
) {
  return directive(MultiClassMapDirective)(record as Record<string, boolean>);
}

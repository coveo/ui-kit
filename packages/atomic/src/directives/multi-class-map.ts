import {directive, Directive} from 'lit/directive.js';
import {classMap} from 'lit/directives/class-map.js';

export const tw = (rec: Record<string, boolean>) => rec;

type Split<
  S extends string,
  D extends string,
  Limit extends number = 30,
  Count extends unknown[] = [],
> = Count['length'] extends Limit
  ? [S]
  : S extends `${infer T}${D}${infer U}`
    ? [T, ...Split<U, D, Limit, [unknown, ...Count]>]
    : [S];

type WordMap<T extends Record<string, boolean>> = {
  [K in keyof T]: Split<K & string, ' '>[number];
};

type DuplicateWords<T extends Record<string, boolean>> = {
  [K in keyof T]: Extract<WordMap<T>[K], WordMap<T>[Exclude<keyof T, K>]>;
}[keyof T];

type NoDuplicateWords<T extends Record<string, boolean>> =
  DuplicateWords<T> extends never
    ? T
    : 'Duplicate class detected in class map. Ensure that no class appears in more than one key.';

class MultiClassMapDirective extends Directive {
  /**
   * A Lit directive that dynamically applies CSS classes to an element.
   *
   * This directive extends the functionality of the Lit [`classMap`](https://lit.dev/docs/templates/directives/#classmap)
   * by allowing multiple space-separated class names in a single key.
   *
   * ### Behavior:
   * - If a key contains multiple classes (e.g., `'foo bar'`), all classes in the key are applied if the value is `true`.
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

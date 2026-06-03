import type {ComplexAttributeConverter} from 'lit';

type DeprecationWarningFn = (rawValue: string) => void;

/**
 * Creates a converter that handles both JSON arrays (new format) and comma-separated strings (legacy format).
 *
 * The legacy comma-separated format is deprecated and will be removed in Atomic v4.
 *
 * @param onDeprecatedFormat - Optional callback invoked when a comma-separated string is detected.
 *                              Use this to log deprecation warnings.
 * @returns A Lit attribute converter for string arrays.
 *
 * @example
 * ```typescript
 * @property({
 *   converter: createLegacyArrayStringConverter((value) => {
 *     console.warn(`Comma-separated value "${value}" is deprecated. Use JSON array format.`);
 *   }),
 * })
 * fields: string[] = [];
 * ```
 * // TODO V4 (KIT-5306): Remove converter and use arrayConverter directly.
 */
export function createLegacyArrayStringConverter(
  onDeprecatedFormat?: DeprecationWarningFn
): ComplexAttributeConverter<string[]> {
  return {
    fromAttribute: (value: string | null): string[] => {
      if (!value) {
        return [];
      }

      const trimmedValue = value.trim();
      if (!trimmedValue) {
        return [];
      }

      // Try parsing as JSON array first (new format)
      if (trimmedValue.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmedValue);
          if (Array.isArray(parsed)) {
            return parsed.map((item) =>
              typeof item === 'string' ? item : String(item)
            );
          }
        } catch {
          // Fall through to comma-separated parsing
        }
      }

      // Legacy comma-separated format
      onDeprecatedFormat?.(value);
      return trimmedValue
        .split(',')
        .map((field) => field.trim())
        .filter((field) => field.length > 0);
    },
    toAttribute: (value: string[]) => JSON.stringify(value),
  };
}

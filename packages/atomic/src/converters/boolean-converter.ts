import type {ComplexAttributeConverter} from 'lit';

const NON_COMPLIANT_FALSE_WARNING =
  'Using `value="false"` for a boolean attribute is not compliant with HTML standards (see https://html.spec.whatwg.org/#boolean-attributes). ' +
  'This behavior will not be supported in Atomic v4.';

interface BooleanConverterOptions {
  /**
   * Whether `"false"` still converts to `true`, for attributes where turning the option off must be an explicit
   * opt-in through the replacement attribute.
   */
  ignoreFalse?: boolean;
  /**
   * Whether to skip the console warning, for components that log a deprecation warning through the engine logger with
   * `DeprecatedPropertyWarnings` instead.
   */
  silent?: boolean;
}

/**
 * Creates a converter for a boolean attribute that also accepts the non-standard `="false"` value, and warns when it
 * is used.
 *
 * @param replacementAttribute - The attribute to use instead of setting this one to `"false"`, for boolean attributes
 * that default to `true`. The warning names it.
 * @param options - The converter options.
 */
export const createBooleanConverter = (
  replacementAttribute?: string,
  {ignoreFalse = false, silent = false}: BooleanConverterOptions = {}
): ComplexAttributeConverter<boolean> => ({
  fromAttribute: (value: string) => {
    if (value !== 'false') {
      return true;
    }

    if (!silent) {
      console.warn(
        ignoreFalse
          ? `${NON_COMPLIANT_FALSE_WARNING} The \`"false"\` value is ignored. Use the \`${replacementAttribute}\` attribute instead.`
          : replacementAttribute
            ? `${NON_COMPLIANT_FALSE_WARNING} Use the \`${replacementAttribute}\` attribute instead.`
            : `${NON_COMPLIANT_FALSE_WARNING} To set a boolean attribute to false, omit the attribute instead.`
      );
    }
    return ignoreFalse;
  },
});

export const booleanConverter: ComplexAttributeConverter<boolean> = createBooleanConverter();

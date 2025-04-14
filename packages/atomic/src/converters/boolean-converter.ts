import type {ComplexAttributeConverter} from 'lit';

export const booleanConverter: ComplexAttributeConverter<boolean> = {
  fromAttribute: (value: string) => {
    if (value === 'false') {
      console.warn(
        'Using `value="false"` for a boolean attribute is not compliant with HTML standards (see https://html.spec.whatwg.org/#boolean-attributes). ' +
          'This behavior will not be supported in Atomic v4. To set a boolean attribute to false, omit the attribute instead.'
      );
      return false;
    }
    return true;
  },
};

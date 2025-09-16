import {FieldValueIsNaNError} from '@/src/components/commerce/product-template-component-utils/error';

export const computeNumberOfStars = (
  value: unknown,
  field: string
): number | null => {
  if (value === null) {
    return null;
  }
  const valueAsNumber = parseFloat(`${value}`);
  if (Number.isNaN(valueAsNumber)) {
    throw new FieldValueIsNaNError(field, value);
  }
  return valueAsNumber;
};

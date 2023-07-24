import {isNullOrUndefined} from '@coveo/bueno';
import {ProductRecommendation} from '../../product-listing.index';
import {isArray} from '../../utils/utils';
import {ProductRecommendationTemplateCondition} from './product-recommendations-templates';

/**
 * Extracts a property from a product recommendation object.
 * @param productRecommendation (ProductRecommendation) The target product recommendation.
 * @param property (string) The property to extract.
 * @returns (unknown) The value of the specified property in the specified product recommendation, or null if the property does not exist.
 */
export const getProductRecommendationProperty = (
  productRecommendation: ProductRecommendation,
  property: keyof ProductRecommendation
) =>
  isNullOrUndefined(productRecommendation[property])
    ? null
    : productRecommendation[property];

/**
 * Creates a condition that verifies if the specified fields are defined.
 * @param fieldNames (string[]) A list of fields that must be defined.
 * @returns (ProductRecommendationTemplateCondition) A function that takes a product recommendation and checks if every field in the specified list is defined.
 */
export const fieldsMustBeDefined = (
  fieldNames: (keyof ProductRecommendation)[]
): ProductRecommendationTemplateCondition => {
  return (productRecommendation: ProductRecommendation) => {
    return fieldNames.every(
      (fieldName) =>
        !isNullOrUndefined(
          getProductRecommendationProperty(productRecommendation, fieldName)
        )
    );
  };
};

/**
 * Creates a condition that verifies if the specified fields are not defined.
 * @param fieldNames (string[]) A list of fields that must not be defined.
 * @returns (ProductRecommendationTemplateCondition) A function that takes a product recommendation and checks if every field in the specified list is not defined.
 */
export const fieldsMustNotBeDefined = (
  fieldNames: (keyof ProductRecommendation)[]
): ProductRecommendationTemplateCondition => {
  return (productRecommendation: ProductRecommendation) => {
    return fieldNames.every((fieldName) =>
      isNullOrUndefined(
        getProductRecommendationProperty(productRecommendation, fieldName)
      )
    );
  };
};

/**
 * Creates a condition that verifies if a field's value contains any of the specified values.
 * @param fieldName (string) The name of the field to check.
 * @param valuesToMatch (string[]) A list of possible values to match.
 * @returns (ProductRecommendationTemplateCondition) A function that takes a product recommendation and checks if the value for the specified field matches any value in the specified list.
 */
export const fieldMustMatch = (
  fieldName: keyof ProductRecommendation,
  valuesToMatch: string[]
): ProductRecommendationTemplateCondition => {
  return (result: ProductRecommendation) => {
    const fieldValues = getFieldValuesFromResult(fieldName, result);
    return valuesToMatch.some((valueToMatch) =>
      fieldValues.some(
        (fieldValue) =>
          `${fieldValue}`.toLowerCase() === valueToMatch.toLowerCase()
      )
    );
  };
};

/**
 * Creates a condition that verifies that a field's value does not contain any of the specified values.
 * @param fieldName (string) The name of the field to check.
 * @param blacklistedValues (string[]) A list of all disallowed values.
 * @returns (ProductRecommendationTemplateCondition) A function that takes a product recommendation and checks that the value for the specified field does not match any value in the given list.
 */
export const fieldMustNotMatch = (
  fieldName: keyof ProductRecommendation,
  blacklistedValues: string[]
): ProductRecommendationTemplateCondition => {
  return (productRecommendation: ProductRecommendation) => {
    const fieldValues = getFieldValuesFromResult(
      fieldName,
      productRecommendation
    );
    return blacklistedValues.every((blacklistedValue) =>
      fieldValues.every(
        (fieldValue) =>
          `${fieldValue}`.toLowerCase() !== blacklistedValue.toLowerCase()
      )
    );
  };
};

const getFieldValuesFromResult = (
  fieldName: keyof ProductRecommendation,
  productRecommendation: ProductRecommendation
) => {
  const rawValue = getProductRecommendationProperty(
    productRecommendation,
    fieldName
  );
  // drat
  return isArray(rawValue) ? rawValue : [rawValue];
};

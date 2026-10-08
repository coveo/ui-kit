import {isArray, isNullOrUndefined} from '@coveo/bueno';
import type {SpotlightContent} from '../../../api/commerce/common/result.js';
import type {SpotlightContentTemplateCondition} from './spotlight-content-templates-manager.js';

/**
 * Extracts a property from a spotlight content object.
 * @param spotlightContent (SpotlightContent) - The target spotlight content.
 * @param property (string) - The property to extract.
 * @returns (unknown) The value of the specified property in the specified spotlight content, or null if the property does not exist.
 */
const getSpotlightContentProperty = (spotlightContent: SpotlightContent, property: string) => {
  const value = (spotlightContent as unknown as Record<string, unknown>)[property];
  return isNullOrUndefined(value) ? null : value;
};

/**
 * Creates a condition that verifies if the specified fields are defined.
 * @param fieldNames (string[]) - A list of fields that must be defined.
 * @returns (SpotlightContentTemplateCondition) A function that takes a spotlight content and checks if every field in the specified list is defined.
 */
const fieldsMustBeDefined = (fieldNames: string[]): SpotlightContentTemplateCondition => {
  return (spotlightContent: SpotlightContent) =>
    fieldNames.every(
      (fieldName) => !isNullOrUndefined(getSpotlightContentProperty(spotlightContent, fieldName))
    );
};

/**
 * Creates a condition that verifies if the specified fields are not defined.
 * @param fieldNames (string[]) - A list of fields that must not be defined.
 * @returns (SpotlightContentTemplateCondition) A function that takes a spotlight content and checks if every field in the specified list is not defined.
 */
const fieldsMustNotBeDefined = (fieldNames: string[]): SpotlightContentTemplateCondition => {
  return (spotlightContent: SpotlightContent) =>
    fieldNames.every((fieldName) =>
      isNullOrUndefined(getSpotlightContentProperty(spotlightContent, fieldName))
    );
};

/**
 * Creates a condition that verifies whether the value of a field is equal to any of the specified values (case insensitive).
 * @param fieldName (string) - The name of the field to evaluate the condition against.
 * @param valuesToMatch (string[]) - The list of values that the field value can be equal to in order for the condition to evaluate to "true" (case insensitive).
 * @returns (SpotlightContentTemplateCondition) A function that takes a spotlight content and returns "true" if the value for the specified field is equal to any of the values in the specified list (case insensitive), and "false" otherwise.
 */
const fieldMustMatch = (
  fieldName: string,
  valuesToMatch: string[]
): SpotlightContentTemplateCondition => {
  return (spotlightContent: SpotlightContent) => {
    const fieldValues = getFieldValues(fieldName, spotlightContent);
    return valuesToMatch.some((valueToMatch) =>
      fieldValues.some((fieldValue) => `${fieldValue}`.toLowerCase() === valueToMatch.toLowerCase())
    );
  };
};

/**
 * Creates a condition that verifies whether the value of a field is not equal to any of the specified values (case insensitive).
 * @param fieldName (string) - The name of the field to evaluate the condition against.
 * @param disallowedValues (string[]) - The list of values that the field value must not be equal to in order for the condition to evaluate to "true" (case insensitive).
 * @returns (SpotlightContentTemplateCondition) A function that takes a spotlight content and returns "true" if the value for the specified field is not equal to any of the values in the given list (case insensitive), or "false" otherwise.
 */
const fieldMustNotMatch = (
  fieldName: string,
  disallowedValues: string[]
): SpotlightContentTemplateCondition => {
  return (spotlightContent: SpotlightContent) => {
    const fieldValues = getFieldValues(fieldName, spotlightContent);
    return disallowedValues.every((disallowedValue) =>
      fieldValues.every(
        (fieldValue) => `${fieldValue}`.toLowerCase() !== disallowedValue.toLowerCase()
      )
    );
  };
};

const getFieldValues = (fieldName: string, spotlightContent: SpotlightContent) => {
  const rawValue = getSpotlightContentProperty(spotlightContent, fieldName);
  return isArray(rawValue) ? rawValue : [rawValue];
};

export const SpotlightContentTemplatesHelpers = {
  getSpotlightContentProperty,
  fieldsMustBeDefined,
  fieldsMustNotBeDefined,
  fieldMustMatch,
  fieldMustNotMatch,
};

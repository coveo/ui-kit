import {ResultTemplateCondition} from './result-templates';
import {isArray} from '../../utils/utils';
import {Result} from '../../api/search/search/result';

/**
 * Extracts a property from a result object.
 * @param result The target result.
 * @param property The property to extract.
 * @returns The value of the specified property in the specified result, or null if the property does not exist.
 * @docsection Result Templates Helpers
 */
export const getResultProperty = (result: Result, property: string) => {
  if (property in result) {
    return (result as Record<string, unknown>)[property];
  }

  if (property in result.raw) {
    return result.raw[property];
  }

  return null;
};

/**
 * Creates a condition that verifies if the specified fields are defined.
 * @param fieldNames A list of fields that must be defined.
 * @returns A function that takes a result and checks if every field in the specified list is defined.
 * @docsection Result Templates Helpers
 */
export const fieldsMustBeDefined = (
  fieldNames: string[]
): ResultTemplateCondition => {
  return (result: Result) => {
    return fieldNames.every((fieldName) => result.raw[fieldName] !== undefined);
  };
};

/**
 * Creates a condition that verifies if the specified fields are not defined.
 * @param fieldNames A list of fields that must not be defined.
 * @returns A function that takes a result and checks if every field in the specified list is not defined.
 * @docsection Result Templates Helpers
 */
export const fieldsMustNotBeDefined = (
  fieldNames: string[]
): ResultTemplateCondition => {
  return (result: Result) => {
    return fieldNames.every((fieldName) => result.raw[fieldName] === undefined);
  };
};

/**
 * Creates a condition that verifies if a field's value contains any of the specified values.
 * @param fieldName The name of the field to check.
 * @param valuesToMatch A list of possible values to match.
 * @returns A function that takes a result and checks if the value for the specified field matches any value in the specified list.
 * @docsection Result Templates Helpers
 */
export const fieldMustMatch = (
  fieldName: string,
  valuesToMatch: string[]
): ResultTemplateCondition => {
  return (result: Result) => {
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
 * @param fieldName The name of the field to check.
 * @param blacklistedValues A list of all disallowed values.
 * @returns A function that takes a result and checks that the value for the specified field does not match any value in the given list.
 * @docsection Result Templates Helpers
 */
export const fieldMustNotMatch = (
  fieldName: string,
  blacklistedValues: string[]
): ResultTemplateCondition => {
  return (result: Result) => {
    const fieldValues = getFieldValuesFromResult(fieldName, result);
    return blacklistedValues.every((blacklistedValue) =>
      fieldValues.every(
        (fieldValue) =>
          `${fieldValue}`.toLowerCase() !== blacklistedValue.toLowerCase()
      )
    );
  };
};

const getFieldValuesFromResult = (fieldName: string, result: Result) => {
  const rawValue = result.raw[fieldName];
  return isArray(rawValue) ? rawValue : [rawValue];
};

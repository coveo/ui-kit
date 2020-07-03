import {ResultTemplateMatch} from './result-templates';
import {isArray} from '../../utils/utils';
import {Result} from '../../api/search/search/result';

/**
 * Condition that verifies if a field value contains any of the specified values.
 * @param fieldName Name of the field to match against.
 * @param valuesToMatch List of possible values to match.
 */
export const fieldMustMatch = (
  fieldName: string,
  valuesToMatch: string[]
): ResultTemplateMatch => {
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
 * Condition that verifies that a field value does not contains any of the specified values.
 * @param fieldName Name of the field to verify against.
 * @param blacklistedValues List of all values to blacklist.
 */
export const fieldMustNotMatch = (
  fieldName: string,
  blacklistedValues: string[]
): ResultTemplateMatch => {
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

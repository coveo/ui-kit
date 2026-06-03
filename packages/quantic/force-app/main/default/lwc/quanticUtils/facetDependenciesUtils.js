/**
 * @typedef {Object} DependsOn
 * @property {string} parentFacetId - The unique identifier for the parent facet this facet depends on.
 * @property {string} expectedValue - The expected value that the parent facet must have for this facet to be displayed.
 */

/**
 * @typedef {Object} SimpleFacetValue
 * @property {string} value - The value of the facet.
 * @property {string} state - The state of the facet (for example, "selected").
 */

/**
 * @typedef {Object} CategoryFacetValue
 * @property {string} value - The value of the facet.
 * @property {string} state - The state of the facet (for example, "selected").
 * @property {SimpleFacetValue[]} children - An array of SimpleFacetValue representing child categories.
 */

/**
 * @typedef {Object} GenericCondition
 * @property {string} parentFacetId - The ID of the parent facet that this condition depends on.
 * @property {(parentValues: (SimpleFacetValue | CategoryFacetValue)[]) => boolean} condition - A function to evaluate if the condition is met.
 */

/**
 * Generates dependency conditions based on the specified facet dependencies.
 *
 * This function interprets a single dependency mapping between a facet and its required
 * parent facet. It takes a `facetDependencies` object that maps a parent facet ID
 * to the expected value needed for this facet to be displayed.
 *
 * Example:
 * Given a `facetDependencies` object like `{ colorFacet: 'blue' }`,
 * the resulting condition will evaluate to `true` only if `colorFacet` has 'blue' as a selected value.
 *
 * Note: This function currently supports a single parent facet dependency. If multiple dependencies
 * are specified, an error is thrown.
 *
 * @param {Record<string, string>} dependsOn - A mapping of parent facet IDs to required values.
 * @returns {GenericCondition[]} An array of conditions to evaluate for the facet's display logic.
 * @throws {Error} Throws an error if multiple dependencies are specified.
 */
export function generateFacetDependencyConditions(dependsOn) {
  if (Object.keys(dependsOn).length > 1) {
    throw new Error("Depending on multiple facets isn't supported");
  }

  return Object.entries(dependsOn).map(([parentFacetId, expectedValue]) => {
    return {
      parentFacetId,
      condition: (values) => {
        return values.some((value) => {
          if (isCategoryFacetValue(value)) {
            const selectedValue = getSelectedCategoryFacetValueRequest(value);
            if (!selectedValue) {
              return false;
            }
            if (!expectedValue) {
              return true;
            }
            return selectedValue.value === expectedValue;
          }
          if (isSimpleFacetValue(value)) {
            if (value.state !== 'selected') {
              return false;
            }
            if (!expectedValue) {
              return true;
            }
            return value.value === expectedValue;
          }
          return false;
        });
      },
    };
  });
}

/**
 * Type guard to check if the provided value is a CategoryFacetValue.
 * @returns {boolean} True if the value is a CategoryFacetValue.
 */
function isCategoryFacetValue(value) {
  return (
    value?.children &&
    Array.isArray(value.children) &&
    value?.state &&
    typeof value.state === 'string'
  );
}

/**
 * Recursive function to find a selected CategoryFacetValue, if one exists.
 * @returns {CategoryFacetValue|null} The selected CategoryFacetValue, or null if none is found.
 */
function getSelectedCategoryFacetValueRequest(value) {
  if (!isCategoryFacetValue(value)) {
    return null;
  }
  if (value.state === 'selected') {
    return value;
  }
  for (const child of value.children) {
    const selectedValue = getSelectedCategoryFacetValueRequest(child);
    if (selectedValue !== null) {
      return selectedValue;
    }
  }
  return null;
}

/**
 * Type guard to check if the provided value is a SimpleFacetValue.
 * @returns {boolean} True if the value is a SimpleFacetValue.
 */
function isSimpleFacetValue(facetValue) {
  return (
    'value' in facetValue &&
    typeof facetValue.value === 'string' &&
    !('children' in facetValue)
  );
}

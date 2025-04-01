type GenericCondition<AnyFacetValueRequest> = {
  parentFacetId: string;
  condition(parentValues: AnyFacetValueRequest[]): boolean;
};

interface SimpleFacetValue {
  value: string;
  state: string;
}

interface CategoryFacetValue extends SimpleFacetValue {
  children: SimpleFacetValue[];
}

export function parseDependsOn<
  FacetValue extends SimpleFacetValue | CategoryFacetValue,
>(dependsOn: Record<string, string>): GenericCondition<FacetValue>[] {
  if (Object.keys(dependsOn).length > 1) {
    throw "Depending on multiple facets isn't supported";
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

function isCategoryFacetValue(request: unknown): request is CategoryFacetValue {
  const requestAsRecord = request as Record<string, unknown>;
  return (
    (requestAsRecord?.children &&
      Array.isArray(requestAsRecord.children) &&
      requestAsRecord?.state &&
      typeof requestAsRecord.state === 'string') === true
  );
}

function getSelectedCategoryFacetValueRequest(
  value: unknown
): CategoryFacetValue | null {
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

function isSimpleFacetValue(value: unknown): value is SimpleFacetValue {
  const asRecord = value as Record<string, unknown>;
  return (
    'value' in asRecord &&
    typeof asRecord.value === 'string' &&
    !('children' in asRecord)
  );
}

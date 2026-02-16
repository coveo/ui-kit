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

  const entries = Object.entries(dependsOn);
  return entries.map(([parentFacetId, expectedValue]) => ({
    parentFacetId,
    condition: buildDependsOnCondition<FacetValue>(expectedValue),
  }));
}

function buildDependsOnCondition<
  FacetValue extends SimpleFacetValue | CategoryFacetValue,
>(expectedValue: string): (values: FacetValue[]) => boolean {
  return (values: FacetValue[]) =>
    values.some((value) => {
      if (isCategoryFacetValue(value)) {
        return matchesCategoryFacetValue(
          value as CategoryFacetValue,
          expectedValue
        );
      }
      if (isSimpleFacetValue(value)) {
        return matchesSimpleFacetValue(
          value as SimpleFacetValue,
          expectedValue
        );
      }
      return false;
    });
}

function matchesCategoryFacetValue<FacetValue extends CategoryFacetValue>(
  value: FacetValue,
  expectedValue: string
): boolean {
  const selectedValue = getSelectedCategoryFacetValueRequest(value);
  if (!selectedValue) {
    return false;
  }
  return !expectedValue || selectedValue.value === expectedValue;
}

function matchesSimpleFacetValue(
  value: SimpleFacetValue,
  expectedValue: string
): boolean {
  if (value.state !== 'selected') {
    return false;
  }
  return !expectedValue || value.value === expectedValue;
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

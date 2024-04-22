type GenericCondition<AnyRequest> = {
  parentFacetId: string;
  condition(parentValues: AnyRequest[]): boolean;
};

interface SimpleFacet {
  value: string;
  state: string;
}

interface CategoryFacet extends SimpleFacet {
  children: SimpleFacet[];
}

export function parseDependsOn<Facet extends SimpleFacet | CategoryFacet>(
  dependsOn: Record<string, string>
): GenericCondition<Facet>[] {
  if (Object.keys(dependsOn).length > 1) {
    throw "Depending on multiple facets isn't supported";
  }

  return Object.entries(dependsOn).map(([parentFacetId, expectedValue]) => {
    return {
      parentFacetId,
      condition: (values) => {
        return values.some((value) => {
          if (isCategoryFacet(value)) {
            const selectedValue = getSelectedCategoryFacetValueRequest(value);
            if (!selectedValue) {
              return false;
            }
            if (!expectedValue) {
              return true;
            }
            return selectedValue.value === expectedValue;
          }
          if (isSimpleFacet(value)) {
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

function isCategoryFacet(request: unknown): request is CategoryFacet {
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
): CategoryFacet | null {
  if (!isCategoryFacet(value)) {
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

function isSimpleFacet(value: unknown): value is SimpleFacet {
  const asRecord = value as Record<string, unknown>;
  return (
    'value' in asRecord &&
    typeof asRecord.value === 'string' &&
    !('children' in asRecord)
  );
}

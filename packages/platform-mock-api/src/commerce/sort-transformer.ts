interface SortField {
  field: string;
  direction?: string;
  displayName?: string | null;
}

interface SortOption {
  sortCriteria: string;
  fields?: SortField[];
}

interface SortRequest {
  sort?: SortOption;
}

interface WithSort {
  sort: {
    appliedSort: SortOption;
    availableSorts: SortOption[];
  };
}

/**
 * Request transformer for commerce endpoints that reproduces how the Commerce API
 * answers a sort: `sort.appliedSort` is the requested sort, as listed in
 * `sort.availableSorts`. A sort the response doesn't list is echoed with a `null`
 * `displayName` on each field.
 *
 * Without this transformer, a mock always answers with the base response's applied
 * sort, so Headless reverts a sort selection as soon as the response arrives.
 */
export function commerceSortTransformer<T extends WithSort>(body: unknown, response: T): T {
  const requestedSort = (body as SortRequest | null)?.sort;
  if (!requestedSort || !response.sort) {
    return response;
  }

  return {
    ...response,
    sort: {
      ...response.sort,
      appliedSort:
        response.sort.availableSorts.find((availableSort) =>
          isSameSort(availableSort, requestedSort)
        ) ?? toUnlistedSort(requestedSort),
    },
  };
}

function isSameSort(first: SortOption, second: SortOption) {
  const firstFields = first.fields ?? [];
  const secondFields = second.fields ?? [];
  return (
    first.sortCriteria === second.sortCriteria &&
    firstFields.length === secondFields.length &&
    firstFields.every(
      ({field, direction}, index) =>
        field === secondFields[index].field && direction === secondFields[index].direction
    )
  );
}

function toUnlistedSort({sortCriteria, fields}: SortOption): SortOption {
  return {
    sortCriteria,
    ...(fields && {
      fields: fields.map(({field, direction}) => ({field, direction, displayName: null})),
    }),
  };
}

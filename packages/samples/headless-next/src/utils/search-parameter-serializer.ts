import {SearchParameters} from '@coveo/headless';
import {AnySearchParams, NextServerSideSearchParams} from './types';

function parseFacetKey(key: string) {
  const match = /^f-(?<facetId>.*)$/.exec(key);
  if (!match) {
    return null;
  }
  return {key, facetId: match.groups!.facetId};
}

function isNotNullOrUndefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export class SearchParameterSerializer {
  static fromURLSearchParams(searchParams: AnySearchParams) {
    const parameters: SearchParameters = {};
    if (searchParams.has('q')) {
      parameters.q = searchParams.get('q')!;
    }
    const facets = Array.from(new Set(searchParams.keys()))
      .map(parseFacetKey)
      .filter(isNotNullOrUndefined);
    for (const {key, facetId} of facets) {
      (parameters.f ??= {})[facetId] = searchParams.getAll(key);
    }
    return new SearchParameterSerializer(parameters);
  }

  static fromNextSearchParams(searchParams: NextServerSideSearchParams) {
    return SearchParameterSerializer.fromURLSearchParams(
      new URLSearchParams(
        Object.entries(searchParams).flatMap(([key, value]) =>
          Array.isArray(value)
            ? value.map((subValue) => [key, subValue])
            : [[key, value]]
        )
      )
    );
  }

  constructor(public readonly parameters: SearchParameters) {}

  public mapURLSearchParams(originalSearchParams: AnySearchParams) {
    const {parameters} = this;
    const newSearchParams = new URLSearchParams(
      Array.from(originalSearchParams.entries()).filter(
        ([key]) => key !== 'q' && !parseFacetKey(key)
      )
    );
    if (parameters.q !== undefined) {
      newSearchParams.set('q', parameters.q);
    }
    for (const [facetId, facetValues] of Object.entries(parameters.f ?? {})) {
      const key = `f-${facetId}`;
      for (const facetValue of facetValues) {
        newSearchParams.append(key, facetValue);
      }
    }
    return newSearchParams;
  }
}

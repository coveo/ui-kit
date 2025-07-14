import type {FacetValue, SpecificFacetSearchResult} from '@coveo/headless/ssr';
import FacetSearchCommon from './facet-search';

interface FacetProps {
  title: string;
  values: FacetValue[];
  facetSearchQuery: string;
  facetSearchResults: SpecificFacetSearchResult[];
  isLoading: boolean;
  onToggleValue?(value: FacetValue): void;
  onToggleSearchResult?(facetSearchResult: SpecificFacetSearchResult): void;
  onUpdateSearchQuery?(query: string): void;
  onSubmitSearch?(): void;
}

export default function FacetCommon({
  title,
  values,
  facetSearchQuery,
  facetSearchResults,
  isLoading,
  onToggleValue,
  onToggleSearchResult,
  onUpdateSearchQuery,
  onSubmitSearch,
}: FacetProps) {
  return (
    <fieldset>
      <legend>{title} facet</legend>
      <FacetSearchCommon
        query={facetSearchQuery}
        facetSearchResults={facetSearchResults}
        isLoading={isLoading}
        onUpdateQuery={onUpdateSearchQuery}
        onSubmit={onSubmitSearch}
        onToggle={onToggleSearchResult}
      />
      <ul className="facet-values">
        {values.map((value) => (
          <li key={value.value}>
            <input
              type="checkbox"
              checked={value.state === 'selected'}
              onChange={() => onToggleValue?.(value)}
              disabled={isLoading}
            />
            {value.value} ({value.numberOfResults} results)
          </li>
        ))}
      </ul>
    </fieldset>
  );
}

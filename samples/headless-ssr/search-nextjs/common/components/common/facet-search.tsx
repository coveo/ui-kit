import type {SpecificFacetSearchResult} from '@coveo/headless/ssr';

interface FacetSearchProps {
  query: string;
  facetSearchResults: SpecificFacetSearchResult[];
  isLoading: boolean;
  onUpdateQuery?(query: string): void;
  onSubmit?(): void;
  onToggle?(facetSearchResult: SpecificFacetSearchResult): void;
}

export default function FacetSearchCommon({
  query,
  facetSearchResults,
  isLoading,
  onUpdateQuery,
  onSubmit,
  onToggle,
}: FacetSearchProps) {
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit?.();
        }}
      >
        <input
          value={query}
          onChange={(e) => onUpdateQuery?.(e.target.value)}
        />
      </form>
      <ul>
        {facetSearchResults.map((value) => (
          <li key={value.rawValue}>
            <button
              type="button"
              onClick={() => onToggle?.(value)}
              disabled={isLoading}
            >
              {value.displayValue} ({value.count} results)
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

import type {Facet, FacetState} from '@coveo/headless/ssr-next';

interface FacetCommonProps {
  title: string;
  state: FacetState;
  methods?: Omit<Facet, 'state' | 'subscribe'>;
}

export default function FacetCommon({title, state, methods}: FacetCommonProps) {
  if (!state.enabled) {
    return null;
  }

  return (
    <fieldset>
      <legend>{title} facet</legend>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          methods?.facetSearch.search();
        }}
      >
        <input
          value={state.facetSearch.query}
          onChange={(e) => methods?.facetSearch.updateText(e.target.value)}
        />
      </form>
      <ul>
        {state.facetSearch.values.map((value) => (
          <li key={value.rawValue}>
            <button
              type="button"
              onClick={() => methods?.facetSearch.select(value)}
              disabled={state.isLoading}
            >
              {value.displayValue} ({value.count} results)
            </button>
          </li>
        ))}
      </ul>
      <ul className="facet-values">
        {state.values.map((value) => (
          <li key={value.value}>
            <input
              type="checkbox"
              checked={value.state === 'selected'}
              onChange={() => methods?.toggleSelect(value)}
              disabled={state.isLoading}
            />
            {value.value} ({value.numberOfResults} results)
          </li>
        ))}
      </ul>
    </fieldset>
  );
}

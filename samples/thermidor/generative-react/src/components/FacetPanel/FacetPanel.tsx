import {useState, useEffect, useRef, useCallback} from 'react';
import {
  buildBackendFacetController,
  type BackendFacetController,
  type BackendFacetControllerState,
  type BackendFacetSearchState,
} from '@coveo/thermidor';
import {
  converseController,
  generativeInterface,
} from '../../generative-setup.js';
import styles from './FacetPanel.module.css';

interface FacetData {
  facetId: string;
  field: string;
  displayName: string;
  type: string;
  values: Array<{
    value: string;
    state: 'idle' | 'selected' | 'excluded';
    numberOfResults: number;
  }>;
  moreValuesAvailable: boolean;
}

interface FacetPanelProps {
  interfaceId: string;
  facets: FacetData[];
}

export function FacetPanel({interfaceId, facets}: FacetPanelProps) {
  if (!facets.length) return null;

  return (
    <div className={styles.container}>
      {facets.map((facet) => (
        <FacetGroup
          key={facet.facetId}
          interfaceId={interfaceId}
          facetId={facet.facetId}
        />
      ))}
    </div>
  );
}

interface FacetGroupProps {
  interfaceId: string;
  facetId: string;
}

function FacetGroup({interfaceId, facetId}: FacetGroupProps) {
  const [state, setState] = useState<BackendFacetControllerState>({
    facetId,
    field: '',
    displayName: '',
    values: [],
    hasActiveValues: false,
    moreValuesAvailable: false,
  });
  const [searchState, setSearchState] = useState<BackendFacetSearchState>({
    query: '',
    values: [],
    moreValuesAvailable: false,
  });
  const [searchInput, setSearchInput] = useState('');
  const controllerRef = useRef<BackendFacetController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const controller = buildBackendFacetController({
      interface: generativeInterface,
      converseController,
      interfaceId,
      facetId,
    });

    controllerRef.current = controller;
    setState(controller.state);
    setSearchState(controller.facetSearch.state);

    const unsub1 = controller.subscribe(() => setState(controller.state));
    const unsub2 = controller.facetSearch.subscribe(() =>
      setSearchState(controller.facetSearch.state)
    );

    return () => {
      unsub1();
      unsub2();
    };
  }, [interfaceId, facetId]);

  const handleSearchInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchInput(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (!value) {
        controllerRef.current?.facetSearch.clear();
        setSearchState({query: '', values: [], moreValuesAvailable: false});
        return;
      }

      debounceRef.current = setTimeout(() => {
        controllerRef.current?.facetSearch.updateText(value);
        controllerRef.current?.facetSearch.search();
      }, 100);
    },
    []
  );

  if (!state.values.length) return null;

  const showSearchResults =
    searchInput.length > 0 && searchState.values.length > 0;

  return (
    <div className={styles.facet}>
      <div className={styles.facetHeader}>
        <h4 className={styles.facetTitle}>{state.displayName || facetId}</h4>
        {state.hasActiveValues && (
          <button
            className={styles.clearButton}
            onClick={() => controllerRef.current?.deselectAll()}
          >
            Clear
          </button>
        )}
      </div>
      {state.moreValuesAvailable && (
        <input
          type="text"
          className={styles.searchInput}
          placeholder={`Search ${state.displayName || facetId}...`}
          value={searchInput}
          onChange={handleSearchInput}
        />
      )}
      {showSearchResults ? (
        <ul className={styles.valueList}>
          {searchState.values.map((searchValue) => (
            <li
              key={searchValue.rawValue}
              className={styles.valueItem}
              onClick={() => {
                controllerRef.current?.facetSearch.select(searchValue);
                setSearchInput('');
                setSearchState({
                  query: '',
                  values: [],
                  moreValuesAvailable: false,
                });
              }}
            >
              <span className={styles.valueLabel}>
                {searchValue.displayValue}
              </span>
              <span className={styles.valueCount}>{searchValue.count}</span>
            </li>
          ))}
        </ul>
      ) : (
        <ul className={styles.valueList}>
          {state.values.map((facetValue) => (
            <li key={facetValue.value} className={styles.valueItem}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={facetValue.state === 'selected'}
                onChange={() =>
                  controllerRef.current?.toggleSelect(facetValue.value)
                }
              />
              <span className={styles.valueLabel}>{facetValue.value}</span>
              <span className={styles.valueCount}>
                {facetValue.numberOfResults}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

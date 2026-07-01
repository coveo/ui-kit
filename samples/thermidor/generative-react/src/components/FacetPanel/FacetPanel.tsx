import {useState, useEffect, useRef} from 'react';
import {
  buildBackendFacetController,
  type BackendFacetController,
  type BackendFacetControllerState,
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
  const controllerRef = useRef<BackendFacetController | null>(null);

  useEffect(() => {
    const controller = buildBackendFacetController({
      interface: generativeInterface,
      converseController,
      interfaceId,
      facetId,
    });

    controllerRef.current = controller;
    setState(controller.state);

    return controller.subscribe(() => setState(controller.state));
  }, [interfaceId, facetId]);

  if (!state.values.length) return null;

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
    </div>
  );
}

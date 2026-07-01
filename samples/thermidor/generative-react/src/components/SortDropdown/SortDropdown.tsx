import {useState, useEffect, useRef} from 'react';
import {
  buildBackendSortController,
  type BackendSortController,
  type BackendSortControllerState,
  type BackendSortCriterion,
} from '@coveo/thermidor';
import {
  converseController,
  generativeInterface,
} from '../../generative-setup.js';
import styles from './SortDropdown.module.css';

interface SortDropdownProps {
  interfaceId: string;
}

function getSortLabel(sort: BackendSortCriterion): string {
  if (sort.sortCriteria === 'relevance') return 'Relevance';
  if (sort.fields?.length) {
    const field = sort.fields[0];
    const name = field.field.replace(/^ec_/, '').replace(/_/g, ' ');
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
    const direction = field.direction === 'asc' ? '↑' : '↓';
    return `${capitalizedName} ${direction}`;
  }
  return sort.sortCriteria;
}

function serializeSort(sort: BackendSortCriterion): string {
  if (sort.sortCriteria === 'relevance') return 'relevance';
  if (sort.fields?.length) {
    return `${sort.sortCriteria}:${sort.fields.map((f) => `${f.field}:${f.direction}`).join(',')}`;
  }
  return sort.sortCriteria;
}

export function SortDropdown({interfaceId}: SortDropdownProps) {
  const [state, setState] = useState<BackendSortControllerState>({
    appliedSort: undefined,
    availableSorts: [],
  });
  const controllerRef = useRef<BackendSortController | null>(null);

  useEffect(() => {
    const controller = buildBackendSortController({
      interface: generativeInterface,
      converseController,
      interfaceId,
    });

    controllerRef.current = controller;
    setState(controller.state);

    return controller.subscribe(() => setState(controller.state));
  }, [interfaceId]);

  if (state.availableSorts.length <= 1) return null;

  const currentValue = state.appliedSort
    ? serializeSort(state.appliedSort)
    : '';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = state.availableSorts.find(
      (s) => serializeSort(s) === e.target.value
    );
    if (selected) {
      controllerRef.current?.sortBy(selected);
    }
  };

  return (
    <div className={styles.container}>
      <span className={styles.label}>Sort by:</span>
      <select
        className={styles.select}
        value={currentValue}
        onChange={handleChange}
      >
        {state.availableSorts.map((sort) => (
          <option key={serializeSort(sort)} value={serializeSort(sort)}>
            {getSortLabel(sort)}
          </option>
        ))}
      </select>
    </div>
  );
}

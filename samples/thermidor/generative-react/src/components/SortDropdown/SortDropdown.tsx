import {useState, useEffect, useRef} from 'react';
import {Select} from '@mantine/core';
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

interface SortDropdownProps {
  surfaceId: string;
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

export function SortDropdown({surfaceId}: SortDropdownProps) {
  const [state, setState] = useState<BackendSortControllerState>({
    appliedSort: undefined,
    availableSorts: [],
  });
  const controllerRef = useRef<BackendSortController | null>(null);

  useEffect(() => {
    const controller = buildBackendSortController({
      interface: generativeInterface,
      converseController,
      surfaceId,
    });

    controllerRef.current = controller;
    setState(controller.state);

    return controller.subscribe(() => setState(controller.state));
  }, [surfaceId]);

  if (state.availableSorts.length <= 1) return null;

  const currentValue = state.appliedSort
    ? serializeSort(state.appliedSort)
    : '';

  const data = state.availableSorts.map((sort) => ({
    value: serializeSort(sort),
    label: getSortLabel(sort),
  }));

  const handleChange = (value: string | null) => {
    if (!value) return;
    const selected = state.availableSorts.find(
      (s) => serializeSort(s) === value
    );
    if (selected) {
      controllerRef.current?.sortBy(selected);
    }
  };

  return (
    <Select
      size="xs"
      w={140}
      data={data}
      value={currentValue}
      onChange={handleChange}
      allowDeselect={false}
    />
  );
}

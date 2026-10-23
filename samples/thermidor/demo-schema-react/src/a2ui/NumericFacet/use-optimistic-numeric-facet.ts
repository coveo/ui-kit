import {useOptimistic, useState} from 'react';
import type {NumericFacetAction, NumericFacetProps} from '@coveo/thermidor-schema/zod3';
import {useGesture} from '../session-request.js';

type NumericFacetValues = NonNullable<NumericFacetProps['values']>;

function clampToDomain(value: number, domain?: {min?: number; max?: number}): number {
  let clamped = value;
  if (domain?.min !== undefined) {
    clamped = Math.max(clamped, domain.min);
  }
  if (domain?.max !== undefined) {
    clamped = Math.min(clamped, domain.max);
  }
  return clamped;
}

export interface OptimisticNumericFacet {
  values: NumericFacetValues;
  hasActiveValues: boolean;
  customStart: string;
  customEnd: string;
  setCustomStart: (next: string) => void;
  setCustomEnd: (next: string) => void;
  applyCustomRange: () => void;
  toggleSingleSelect: (start: number, end: number) => void;
  clear: () => void;
}

/** Custom-range input text lives here, though not optimistic, because toggle and clear empty it. */
export function useOptimisticNumericFacet(
  props: NumericFacetProps,
  dispatch: (action: NumericFacetAction) => void
): OptimisticNumericFacet {
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [values, addOptimisticValues] = useOptimistic<NumericFacetValues>(props.values ?? []);
  const startGesture = useGesture();

  const resetCustomInputs = () => {
    setCustomStart('');
    setCustomEnd('');
  };

  const toggleSingleSelect = (start: number, end: number) => {
    resetCustomInputs();
    const wasSelected = values.some(
      (value) => value.start === start && value.end === end && value.state === 'selected'
    );
    startGesture(
      () =>
        addOptimisticValues(
          values.map((value) => ({
            ...value,
            state: !wasSelected && value.start === start && value.end === end ? 'selected' : 'idle',
          }))
        ),
      () => dispatch({event: {name: 'toggleSingleSelect', context: {start, end}}})
    );
  };

  const clear = () => {
    resetCustomInputs();
    startGesture(
      () => addOptimisticValues(values.map((value) => ({...value, state: 'idle'}))),
      () => dispatch({event: {name: 'clearAllActiveValues', context: {}}})
    );
  };

  const applyCustomRange = () => {
    const parsedStart = Number(customStart);
    const parsedEnd = Number(customEnd);
    if (
      customStart === '' ||
      customEnd === '' ||
      !Number.isFinite(parsedStart) ||
      !Number.isFinite(parsedEnd)
    ) {
      return;
    }
    const start = clampToDomain(Math.min(parsedStart, parsedEnd), props.domain);
    const end = clampToDomain(Math.max(parsedStart, parsedEnd), props.domain);
    resetCustomInputs();
    // Doesn't place the range: replaying the backend's sort here would silently drift.
    startGesture(
      () => addOptimisticValues(values.map((value) => ({...value, state: 'idle'}))),
      () => dispatch({event: {name: 'applyCustomRange', context: {start, end}}})
    );
  };

  const hasActiveValues = values.some((value) => value.state === 'selected');

  return {
    values,
    hasActiveValues,
    customStart,
    customEnd,
    setCustomStart,
    setCustomEnd,
    applyCustomRange,
    toggleSingleSelect,
    clear,
  };
}

import {useState} from 'react';
import type {NumericFacetAction, NumericFacetProps} from '@coveo/thermidor-schema/zod3';
import {useOptimisticValue} from '../use-optimistic-value.js';

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
  isApplyingCustomRange: boolean;
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
  const [applyInFlight, setApplyInFlight] = useState(false);
  const backendValues: NumericFacetValues = props.values ?? [];
  const {value: values, pending, dispatchOptimistic} = useOptimisticValue(backendValues, dispatch);

  // Nothing pending means the producer answered, so a toggle/clear never leaves inputs dimmed.
  const isApplyingCustomRange = applyInFlight && pending;
  if (applyInFlight && !pending) {
    setApplyInFlight(false);
  }

  const resetCustomInputs = () => {
    setCustomStart('');
    setCustomEnd('');
  };

  const toggleSingleSelect = (start: number, end: number) => {
    resetCustomInputs();
    const wasSelected = values.some(
      (value) => value.start === start && value.end === end && value.state === 'selected'
    );
    dispatchOptimistic({
      action: {event: {name: 'toggleSingleSelect', context: {start, end}}},
      next: (current) =>
        current.map((value) => ({
          ...value,
          state: !wasSelected && value.start === start && value.end === end ? 'selected' : 'idle',
        })),
    });
  };

  const clear = () => {
    resetCustomInputs();
    dispatchOptimistic({
      action: {event: {name: 'clearAllActiveValues', context: {}}},
      next: (current) => current.map((value) => ({...value, state: 'idle'})),
    });
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
    setApplyInFlight(true);
    // Doesn't place the range: replaying the backend's sort here would silently drift.
    dispatchOptimistic({
      action: {event: {name: 'applyCustomRange', context: {start, end}}},
      next: (current) => current.map((value) => ({...value, state: 'idle'})),
    });
  };

  const hasActiveValues = values.some((value) => value.state === 'selected');

  return {
    values,
    hasActiveValues,
    isApplyingCustomRange,
    customStart,
    customEnd,
    setCustomStart,
    setCustomEnd,
    applyCustomRange,
    toggleSingleSelect,
    clear,
  };
}

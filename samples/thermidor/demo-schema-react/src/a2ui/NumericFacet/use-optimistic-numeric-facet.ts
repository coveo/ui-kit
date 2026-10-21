import {useState} from 'react';
import type {NumericFacetAction, NumericFacetProps} from '@coveo/thermidor-schema/zod3';
import {useOptimisticValue} from '../use-optimistic-value.js';

type NumericFacetValues = NonNullable<NumericFacetProps['values']>;

/** Compares ranges only, ignoring state. */
const sameRanges = (left: NumericFacetValues, right: NumericFacetValues): boolean =>
  left.length === right.length &&
  left.every(
    (range, index) => range.start === right[index]?.start && range.end === right[index]?.end
  );

const stateOf = (ranges: NumericFacetValues, start: number, end: number) =>
  ranges.find((range) => range.start === start && range.end === end)?.state;

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
  const {
    value: values,
    pending,
    landingValue,
    dispatchOptimistic,
  } = useOptimisticValue(backendValues, dispatch);

  // Nothing pending means the producer answered, so a toggle/clear never leaves inputs dimmed.
  const isApplyingCustomRange = applyInFlight && pending;
  if (applyInFlight && !pending) {
    setApplyInFlight(false);
  }

  const resetCustomInputs = () => {
    setCustomStart('');
    setCustomEnd('');
  };

  // Every action rewrites every range, so the queue can only matter via which ranges exist or the
  // target's prior state (a flip). An unknown landing is not permission to drop.
  const canSupersedeToggle = (start: number, end: number) => {
    const landing = landingValue();
    return (
      landing !== undefined &&
      sameRanges(landing, values) &&
      stateOf(landing, start, end) === stateOf(values, start, end)
    );
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
      coalesce: canSupersedeToggle(start, end) ? 'absolute' : 'dependent',
      invalidates: ['results'],
    });
  };

  const clear = () => {
    resetCustomInputs();
    const landing = landingValue();
    dispatchOptimistic({
      action: {event: {name: 'clearAllActiveValues', context: {}}},
      next: (current) => current.map((value) => ({...value, state: 'idle'})),
      // Only safe to replace the queue when it lands on the ranges it was computed against.
      coalesce: landing !== undefined && sameRanges(landing, values) ? 'absolute' : 'dependent',
      invalidates: ['results'],
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
      coalesce: 'dependent',
      invalidates: ['results'],
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

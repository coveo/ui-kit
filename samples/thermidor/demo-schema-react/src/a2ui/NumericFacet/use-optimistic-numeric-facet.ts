import {useState} from 'react';
import type {NumericFacetAction, NumericFacetProps} from '@coveo/thermidor-schema/zod3';
import {useOptimisticValue} from '../use-optimistic-value.js';

type NumericFacetValues = NonNullable<NumericFacetProps['values']>;

/** Two range lists cover the same ranges, whatever each one's state is. */
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
  /** The producer's listed ranges, with this facet's outstanding gestures applied. */
  values: NumericFacetValues;
  /** Whether anything is selected, optimistically. */
  hasActiveValues: boolean;
  customStart: string;
  customEnd: string;
  setCustomStart: (next: string) => void;
  setCustomEnd: (next: string) => void;
  /** True while an applyCustomRange dispatch is outstanding; drives dimming of the custom inputs. */
  isApplyingCustomRange: boolean;
  /** Reads the custom inputs, clamps them to the domain, and selects that range. */
  applyCustomRange: () => void;
  toggleSingleSelect: (start: number, end: number) => void;
  clear: () => void;
}

/**
 * The numeric facet's selection and its three gestures, each carried optimistically.
 *
 * The custom-range input text is not itself optimistic, but it lives here because
 * `toggleSingleSelect` and `clear` must empty it — a renderer owning it would have to remember to.
 */
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

  // The apply flag only means "dim the inputs" while a custom-range dispatch is still outstanding.
  // Once this slot has no gesture in flight (`pending` false), the producer has answered, so clear
  // it — and a plain toggle/clear, which also ends `pending`, never leaves the inputs dimmed.
  const isApplyingCustomRange = applyInFlight && pending;
  if (applyInFlight && !pending) {
    setApplyInFlight(false);
  }

  const resetCustomInputs = () => {
    setCustomStart('');
    setCustomEnd('');
  };

  /**
   * Safe to drop the queued gestures only when the newest lands on the same state they would have:
   * every action rewrites EVERY range, so the paths differ only in which ranges exist and in the
   * target's own prior state (a FLIP, not a write) — equal on both, the queue cannot change it.
   * An unknown landing is not permission: dropping on a guess could drop a dispatch still needed.
   */
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
    });
  };

  const clear = () => {
    resetCustomInputs();
    const landing = landingValue();
    dispatchOptimistic({
      action: {event: {name: 'clearAllActiveValues', context: {}}},
      next: (current) => current.map((value) => ({...value, state: 'idle'})),
      // Clearing sets everything idle whatever was queued ahead of it, so it can replace the queue
      // only when it lands on the state it was computed against.
      coalesce: landing !== undefined && sameRanges(landing, values) ? 'absolute' : 'dependent',
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
    // Does not place the range: the backend sorts it into `values`, and replaying that sort here
    // would be a hidden coupling that drifts if the backend reorders. Just clears the selection
    // and dispatches; `isApplyingCustomRange` dims the inputs until the producer answers.
    dispatchOptimistic({
      action: {event: {name: 'applyCustomRange', context: {start, end}}},
      next: (current) => current.map((value) => ({...value, state: 'idle'})),
      coalesce: 'dependent',
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

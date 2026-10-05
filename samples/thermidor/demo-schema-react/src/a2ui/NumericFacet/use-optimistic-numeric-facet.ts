import {useState} from 'react';
import type {NumericFacetAction, NumericFacetProps} from '@coveo/thermidor-schema/zod3';
import {useOptimisticValue} from '../use-optimistic-value.js';

type NumericFacetValues = NonNullable<NumericFacetProps['values']>;

const NO_VALUES: NumericFacetValues = [];

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
  /** The ranges to render: the producer's, with this facet's outstanding gestures applied. */
  values: NumericFacetValues;
  customStart: string;
  customEnd: string;
  setCustomStart: (next: string) => void;
  setCustomEnd: (next: string) => void;
  toggleSingleSelect: (start: number, end: number) => void;
  clear: () => void;
  /** Reads the custom inputs, clamps them to the domain, and appends the range. */
  applyCustomRange: () => void;
}

/**
 * The numeric facet's ranges, and its three gestures — all of which carry one optimistically.
 *
 * The custom-range inputs live here too, although raw input text is not itself optimistic: both
 * `toggleSingleSelect` and `clear` have to empty them, so a renderer that owned them would have to
 * remember to do it after every other gesture.
 *
 * The producer's algebra for `toggleSingleSelect` (a FLIP, not a write), the exactness condition
 * under which superseding a queued gesture is sound, and the parsing and clamping of the custom
 * range are gesture definition rather than rendering. The renderer binds the inputs and draws.
 */
export function useOptimisticNumericFacet(
  props: NumericFacetProps,
  dispatch: (action: NumericFacetAction) => void
): OptimisticNumericFacet {
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const {
    value: values,
    landingValue,
    dispatchOptimistic,
  } = useOptimisticValue(props.values ?? NO_VALUES, dispatch);

  const resetCustomInputs = () => {
    setCustomStart('');
    setCustomEnd('');
  };

  /**
   * Superseding sends the newest gesture against the state it will actually land on — the backend
   * plus the one dispatch already sent — instead of against the state the dropped gestures would
   * have produced. Every action here rewrites the state of EVERY range, so the two paths can only
   * differ in which ranges exist and in the target's own prior state, which `toggleSingleSelect`
   * FLIPS rather than sets (`SearchActionHandler.handleNumericToggle`, `single=true`). Equal on
   * both counts, dropping the queued gestures cannot change the outcome; otherwise they have to
   * go out as they are — re-clicking the range the in-flight dispatch is selecting, or a queued
   * custom range whose appended entry would be lost.
   *
   * An UNKNOWN landing state is not permission: the controller cannot always tell which of this
   * facet's outstanding dispatches is on its way, and a gesture that drops on a guess would drop
   * one the producer still needs.
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
      // Clearing sets every range to idle whatever was queued ahead of it, so only a queued
      // custom range — which would lose its appended entry — stops it replacing them.
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
    // The producer APPENDS the range as the only selected one, so the optimistic value appends
    // too — with no count, which only the backend can supply. An append is not an absolute write:
    // it never replaces what is queued, and the range it adds is what stops a later gesture
    // replacing IT.
    dispatchOptimistic({
      action: {event: {name: 'applyCustomRange', context: {start, end}}},
      next: (current) => [
        ...current.map((value) => ({...value, state: 'idle' as const})),
        {start, end, endInclusive: true, state: 'selected' as const, numberOfResults: 0},
      ],
      coalesce: 'dependent',
    });
  };

  return {
    values,
    customStart,
    customEnd,
    setCustomStart,
    setCustomEnd,
    toggleSingleSelect,
    clear,
    applyCustomRange,
  };
}

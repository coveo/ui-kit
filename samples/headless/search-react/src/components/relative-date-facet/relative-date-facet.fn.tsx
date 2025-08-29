import {
  type DateFacet,
  type DateFacetValue,
  deserializeRelativeDate,
} from '@coveo/headless';
import {type FunctionComponent, useEffect, useState} from 'react';

interface RelativeDateFacetProps {
  controller: DateFacet;
}

export const RelativeDateFacet: FunctionComponent<RelativeDateFacetProps> = (
  props
) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  function getKeyForRange(value: DateFacetValue) {
    return `[${value.start}..${value.end}]`;
  }

  function format(value: string) {
    const relativeDate = deserializeRelativeDate(value);
    return relativeDate.period === 'now'
      ? relativeDate.period
      : `${relativeDate.period} ${relativeDate.amount} ${relativeDate.unit}`;
  }

  if (
    !state.values.filter(
      (value) => value.state !== 'idle' || value.numberOfResults > 0
    ).length
  ) {
    return <div>No facet values</div>;
  }

  return (
    <ul>
      {state.values.map((value) => (
        <li key={getKeyForRange(value)}>
          <input
            type="checkbox"
            checked={controller.isValueSelected(value)}
            onChange={() => controller.toggleSingleSelect(value)}
            disabled={state.isLoading}
          />
          {format(value.start)} to {format(value.end)} ({value.numberOfResults}{' '}
          {value.numberOfResults === 1 ? 'result' : 'results'})
        </li>
      ))}
    </ul>
  );
};

// usage

/**
 * ```tsx
 * const controller = buildDateFacet(engine, {
 *   options: {
 *     field: 'created',
 *     generateAutomaticRanges: false,
 *     currentValues: [
 *       buildDateRange({
 *         start: {period: 'past', unit: 'day', amount: 1},
 *         end: {period: 'now'},
 *       }),
 *       buildDateRange({
 *         start: {period: 'past', unit: 'week', amount: 1},
 *         end: {period: 'now'},
 *       }),
 *     ],
 *   },
 * });
 *
 * <DateFacet controller={controller} />;
 * ```
 */

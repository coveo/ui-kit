import {useEffect, useState, FunctionComponent} from 'react';
import {
  DateFacet,
  DateFacetValue,
  deserializeRelativeDate,
} from '@coveo/headless';

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
    return `[${value.start}..${value.end}${value.endInclusive ? ']' : '['}`;
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
          {format(value.start)} to {format(value.end)}{' '}
          {value.endInclusive ? 'inclusively' : 'exclusively'} (
          {value.numberOfResults}{' '}
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
 *       buildDateRange({
 *         start: {period: 'past', unit: 'month', amount: 1},
 *         end: {period: 'now'},
 *       }),
 *       buildDateRange({
 *         start: {period: 'past', unit: 'quarter', amount: 1},
 *         end: {period: 'now'},
 *       }),
 *       buildDateRange({
 *         start: {period: 'past', unit: 'year', amount: 1},
 *         end: {period: 'now'},
 *       }),
 *     ],
 *   },
 * });
 *
 * <DateFacet controller={controller} />;
 * ```
 */

import type {
  DateFacetValue,
  DateFacet as HeadlessDateFacet,
} from '@coveo/headless';
import {type FunctionComponent, useEffect, useState} from 'react';
import {parseDate} from './date-utils';

interface DateFacetProps {
  controller: HeadlessDateFacet;
}

export const DateFacet: FunctionComponent<DateFacetProps> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  function getKeyForRange(value: DateFacetValue) {
    return `[${value.start}..${value.end}]`;
  }

  function format(dateStr: string) {
    return parseDate(dateStr).format('MMMM D YYYY');
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
            onChange={() => controller.toggleSelect(value)}
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
 *     currentValues: [ // Must be specified when `generateAutomaticRanges` is false.
 *       buildDateRange({
 *         start: new Date(2015, 1),
 *         end: new Date(2018, 1),
 *       }),
 *       buildDateRange({
 *         start: new Date(2018, 1),
 *         end: new Date(2020, 1),
 *       }),
 *       buildDateRange({
 *         start: new Date(2020, 1),
 *         end: new Date(2021, 1),
 *       }),
 *     ],
 *   },
 * });
 *
 * <DateFacet controller={controller} />;
 * ```
 */

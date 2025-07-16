import {
  buildDateRange,
  type DateFilter as HeadlessDateFilter,
} from '@coveo/headless';
import {Fragment, type FunctionComponent, useEffect, useState} from 'react';
import {parseDate} from '../date-facet/date-utils';

interface DateFilterProps {
  controller: HeadlessDateFilter;
}

function formattedDateValue(date?: string | Date) {
  if (!date) {
    return '';
  }
  return parseDate(date).format('YYYY-MM-DD');
}

export const DateFilter: FunctionComponent<DateFilterProps> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);
  let startRef: HTMLInputElement;
  let endRef: HTMLInputElement;

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  const {range} = state;

  return (
    <Fragment>
      <input
        key="start"
        type="Date"
        ref={(ref) => {
          startRef = ref!;
        }}
        defaultValue={formattedDateValue(range?.start)}
        placeholder="Start"
      />
      <input
        key="end"
        type="Date"
        ref={(ref) => {
          endRef = ref!;
        }}
        defaultValue={formattedDateValue(range?.end)}
        placeholder="End"
      />
      <button
        key="apply"
        onClick={() => {
          if (!startRef.validity.valid || !endRef.validity.valid) {
            return;
          }

          controller.setRange(
            buildDateRange({
              start: startRef.valueAsDate!,
              end: endRef.valueAsDate!,
            })
          );
        }}
      >
        Apply
      </button>
    </Fragment>
  );
};

// usage

/**
 * ```tsx
 * const controller = buildDateFilter(engine, {
 *   options: {
 *     field: 'date',
 *   },
 * });
 *
 * <DateFilter controller={controller} />;
 * ```
 */

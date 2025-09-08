import type {NumericFilter as HeadlessNumericFilter} from '@coveo/headless';
import {Fragment, type FunctionComponent, useEffect, useState} from 'react';

interface NumericFilterProps {
  controller: HeadlessNumericFilter;
}

export const NumericFilter: FunctionComponent<NumericFilterProps> = (props) => {
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
        type="number"
        ref={(ref) => {
          startRef = ref!;
        }}
        defaultValue={range?.start}
        placeholder="Start"
      />
      <input
        key="end"
        type="number"
        ref={(ref) => {
          endRef = ref!;
        }}
        defaultValue={range?.end}
        placeholder="End"
      />
      <button
        key="apply"
        onClick={() =>
          controller.setRange({
            start: startRef.valueAsNumber,
            end: endRef.valueAsNumber,
          })
        }
      >
        Apply
      </button>
    </Fragment>
  );
};

// usage

/**
 * ```tsx
 * const controller = buildNumericFilter(engine, {
 *   options: {
 *     field: 'size',
 *   },
 * });
 *
 * <NumericFilter controller={controller} />;
 * ```
 */

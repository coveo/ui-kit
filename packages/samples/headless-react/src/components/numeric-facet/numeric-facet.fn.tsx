import {useEffect, useState, FunctionComponent} from 'react';
import {
  NumericFacet as HeadlessNumericFacet,
  NumericFacetValue,
} from '@coveo/headless';

interface NumericFacetProps {
  controller: HeadlessNumericFacet;
  format: (n: number) => string;
}

export const NumericFacet: FunctionComponent<NumericFacetProps> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  function getKeyForRange(value: NumericFacetValue) {
    return `[${value.start}..${value.end}${value.endInclusive ? ']' : '['}`;
  }

  if (!state.values.length) {
    return <div>No facet values</div>;
  }

  const {format} = props;

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
          From {format(value.start)} to {format(value.end)}{' '}
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
 * const controller = buildNumericFacet(engine, {
 *   options: {
 *     field: 'size',
 *     generateAutomaticRanges: false,
 *     currentValues: [ // Must be specified when `generateAutomaticRanges` is false.
 *       buildNumericRange({start: 0, end: 5e3}),
 *       buildNumericRange({start: 5e3, end: 50e3}),
 *       buildNumericRange({start: 50e3, end: 5e6}),
 *     ],
 *   },
 * });
 *
 * <NumericFacet controller={controller} format={(bytes) => `${bytes} bytes`} />;
 * ```
 */

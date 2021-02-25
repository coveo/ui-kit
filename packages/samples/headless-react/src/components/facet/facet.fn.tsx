import {useEffect, useState, FunctionComponent} from 'react';
import {Facet as HeadlessFacet} from '@coveo/headless';
import {FacetSearch} from './facet-search';

interface FacetProps {
  controller: HeadlessFacet;
}

export const Facet: FunctionComponent<FacetProps> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  if (!state.values.length) {
    return <div>No facet values</div>;
  }

  return (
    <ul>
      <li>
        <FacetSearch
          controller={controller.facetSearch}
          facetState={state.facetSearch}
          isValueSelected={(facetSearchValue) =>
            !!state.values.find(
              (facetValue) =>
                facetValue.value === facetSearchValue.displayValue &&
                controller.isValueSelected(facetValue)
            )
          }
        />
      </li>
      <li>
        <ul>
          {state.values.map((value) => (
            <li key={value.value}>
              <input
                type="checkbox"
                checked={controller.isValueSelected(value)}
                onChange={() => controller.toggleSelect(value)}
                disabled={state.isLoading}
              />
              {value.value} ({value.numberOfResults} results)
            </li>
          ))}
        </ul>
      </li>
    </ul>
  );
};

// usage

/**
 * ```tsx
 * const options: FacetOptions = {field: 'objecttype'};
 * const controller = buildFacet(engine, {options});
 *
 * <Facet controller={controller} />;
 * ```
 */

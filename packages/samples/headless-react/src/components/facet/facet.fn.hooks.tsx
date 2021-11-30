import {FunctionComponent} from 'react';
import {FacetSearch} from './facet-search';
import {useController} from './facet-hook';
import {Facet as HeadlessFacet} from '@coveo/headless';

interface FacetProps {
  controller: HeadlessFacet;
}

export const FacetWithHook: FunctionComponent<FacetProps> = ({controller}) => {
  const [state] = useController(controller);
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

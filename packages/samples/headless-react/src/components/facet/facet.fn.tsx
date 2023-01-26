import {useController, buildFacet, FacetOptions} from '@coveo/headless-react';
import {FunctionComponent, useContext} from 'react';
import {AppContext} from '../../context/engine';
import {FacetManagerFunctionChildProps} from '../facet-manager/facet-manager.fn';
import {FacetSearch} from './facet-search';

interface FacetProps extends FacetManagerFunctionChildProps {
  controllerOptions: FacetOptions &
    FacetManagerFunctionChildProps['controllerOptions'];
}

export const Facet: FunctionComponent<FacetProps> = ({controllerOptions}) => {
  const {engine} = useContext(AppContext);
  const {controller, state} = useController(buildFacet, engine!, {
    options: controllerOptions,
  });

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

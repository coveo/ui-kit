import {useEffect, useState, FunctionComponent} from 'react';
import {
  buildFacet,
  Facet as HeadlessFacet,
  FacetOptions,
} from '@coveo/headless';
import {engine} from '../../engine';

interface FacetProps {
  controller: HeadlessFacet;
}

export const Facet: FunctionComponent<FacetProps> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  const onInput = (text: string) => {
    controller.facetSearch.updateText(text);
    controller.facetSearch.search();
  };

  if (!state.values.length) {
    return <div>No facet values</div>;
  }

  return (
    <ul>
      <li>
        <input onInput={(e) => onInput(e.currentTarget.value)} />
        <ul>
          {state.facetSearch.values.map((facetSearchValue) => (
            <li key={facetSearchValue.rawValue}>
              <button
                onClick={() => controller.facetSearch.select(facetSearchValue)}
                disabled={
                  !!state.values.find(
                    (facetValue) =>
                      facetValue.value === facetSearchValue.displayValue &&
                      controller.isValueSelected(facetValue)
                  )
                }
              >
                {facetSearchValue.displayValue} ({facetSearchValue.count}{' '}
                results)
              </button>
            </li>
          ))}
        </ul>
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

const options: FacetOptions = {field: 'objecttype'};
const controller = buildFacet(engine, {options});

<Facet controller={controller} />;

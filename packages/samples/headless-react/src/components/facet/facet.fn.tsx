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

  if (!state.values.length) {
    return <div>No facet values</div>;
  }

  return (
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
  );
};

// usage

const options: FacetOptions = {field: 'objecttype'};
const controller = buildFacet(engine, {options});

<Facet controller={controller} />;

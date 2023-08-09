import {AutomaticFacetGenerator as HeadlessAutomaticFacetGenerator} from '@coveo/headless';
import {FunctionComponent, useEffect, useState} from 'react';
import {AutomaticFacet as AutomaticFacetFn} from '../automatic-facet/automatic-facet.fn';

interface AutomaticFacetGeneratorProps {
  controller: HeadlessAutomaticFacetGenerator;
}

export const AutomaticFacetGenerator: FunctionComponent<
  AutomaticFacetGeneratorProps
> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  const automaticFacets = state.automaticFacets.map((facet) => {
    return (
      <AutomaticFacetFn
        key={facet.state.field}
        controller={facet}
      ></AutomaticFacetFn>
    );
  });
  return <div>{automaticFacets}</div>;
};

// usage

/**
 * ```tsx
 * const props: AutomaticFacetGeneratorProps = {desiredCount: 5}
 * const controller = buildAutomaticFacetGenerator(engine, props);
 *
 * <AutomaticFacetGenerator controller={controller} />;
 * ```
 */

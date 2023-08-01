import {AutomaticFacetBuilder as HeadlessAutomaticFacetBuilder} from '@coveo/headless';
import {FunctionComponent, useEffect, useState} from 'react';
import {AutomaticFacet as AutomaticFacetFn} from '../automatic-facet/automatic-facet.fn';

interface AutomaticFacetBuilderProps {
  controller: HeadlessAutomaticFacetBuilder;
}

export const AutomaticFacetBuilder: FunctionComponent<
  AutomaticFacetBuilderProps
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
 * const props: AutomaticFacetBuilderProps = {desiredCount: 5}
 * const controller = buildAutomaticFacetBuilder(engine, props);
 *
 * <AutomaticFacetBuilder controller={controller} />;
 * ```
 */

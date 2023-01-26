import {
  useController,
  buildFacetManager,
  Facet as HeadlessFacet,
  FacetManagerPayload,
} from '@coveo/headless-react';
import {FunctionComponent, ReactElement, Children, useContext} from 'react';
import {AppContext} from '../../context/engine';

export interface FacetManagerFunctionChildProps {
  controllerOptions: {facetId: string};
  /** @deprecated */
  controller?: HeadlessFacet;
}

type FacetManagerChild = ReactElement<FacetManagerFunctionChildProps>;

interface FacetManagerProps {
  children: FacetManagerChild | FacetManagerChild[];
}

export const FacetManager: FunctionComponent<FacetManagerProps> = ({
  children,
}) => {
  const {engine} = useContext(AppContext);
  const {controller} = useController(buildFacetManager, engine!);

  function createPayload(
    facets: FacetManagerChild[]
  ): FacetManagerPayload<FacetManagerChild>[] {
    return facets.map((facet) => ({
      facetId:
        facet.props.controller?.state.facetId ??
        facet.props.controllerOptions.facetId,
      payload: facet,
    }));
  }

  const childFacets = Children.toArray(children) as FacetManagerChild[];
  const payload = createPayload(childFacets);
  const sortedFacets = controller.sort(payload).map((p) => p.payload);

  return <div>{sortedFacets}</div>;
};

// usage

/**
 * ```tsx
 * const facetManager = buildFacetManager(engine);
 * const facetA = buildFacet(engine, {options: {field: 'abc'}});
 * const facetB = buildFacet(engine, {options: {field: 'def'}});
 *
 * <FacetManager controller={facetManager}>
 *   <Facet controller={facetA} />
 *   <Facet controller={facetB} />
 * </FacetManager>
 * ```
 */

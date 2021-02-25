import {
  useEffect,
  useState,
  FunctionComponent,
  ReactElement,
  Children,
} from 'react';
import {
  FacetManager as HeadlessFacetManager,
  Facet as HeadlessFacet,
  FacetManagerPayload,
} from '@coveo/headless';

type FacetManagerChild = ReactElement<{controller: HeadlessFacet}>;

interface FacetManagerProps {
  controller: HeadlessFacetManager;
  children: FacetManagerChild | FacetManagerChild[];
}

export const FacetManager: FunctionComponent<FacetManagerProps> = (props) => {
  const {controller} = props;
  const [, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  function facetsToPayloads(
    facets: FacetManagerChild[]
  ): FacetManagerPayload<FacetManagerChild>[] {
    return facets.map((facet) => ({
      facetId: facet.props.controller.state.facetId,
      payload: facet,
    }));
  }

  function payloadsToFacets(
    facetPayloads: FacetManagerPayload<FacetManagerChild>[]
  ) {
    return facetPayloads.map((facetPayloads) => facetPayloads.payload);
  }

  function sortFacets(facets: FacetManagerChild[]) {
    const payloads = facetsToPayloads(facets);
    const sortedPayloads = controller.sort(payloads);
    const sortedFacets = payloadsToFacets(sortedPayloads);
    return sortedFacets;
  }

  function children() {
    return Children.toArray(props.children) as FacetManagerChild[];
  }

  return <div>{sortFacets(children())}</div>;
};

// usage

/**
 * ```tsx
 * const managerController = buildFacetManager(engine);
 * const facetAController = buildFacet(engine, {options: {field: 'abc'}});
 * const facetBController = buildFacet(engine, {options: {field: 'def'}});
 *
 * <FacetManager controller={managerController}>
 *   <Facet controller={facetAController} />
 *   <Facet controller={facetBController} />
 * </FacetManager>
 * ```
 */

import {
  buildFacetManager,
  Facet as HeadlessFacet,
  FacetManagerPayload,
} from '@coveo/headless';
import {
  useEffect,
  useState,
  FunctionComponent,
  ReactElement,
  Children,
  useContext,
  useMemo,
} from 'react';
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
  const controller = useMemo(() => buildFacetManager(engine!), [engine]);
  const [, setState] = useState(controller.state);
  useEffect(
    () => controller.subscribe(() => setState(controller.state)),
    [controller]
  );

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

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

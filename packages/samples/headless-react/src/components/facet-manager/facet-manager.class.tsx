import {Children, Component, ReactElement} from 'react';
import {
  buildFacetManager,
  FacetManager as HeadlessFacetManager,
  FacetManagerPayload,
  FacetManagerState,
  Unsubscribe,
} from '@coveo/headless';
import {engine} from '../../engine';

type FacetManagerChild = ReactElement<{facetId: string}>;

export class FacetManager extends Component<{
  children?: FacetManagerChild | FacetManagerChild[];
}> {
  private controller: HeadlessFacetManager;
  public state: FacetManagerState;
  private unsubscribe: Unsubscribe = () => {};

  constructor(props: {}) {
    super(props);

    this.controller = buildFacetManager(engine);
    this.state = this.controller.state;
  }

  componentDidMount() {
    this.unsubscribe = this.controller.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  private updateState() {
    this.setState(this.controller.state);
  }

  private createPayload(
    facets: FacetManagerChild[]
  ): FacetManagerPayload<FacetManagerChild>[] {
    return facets.map((facet) => ({
      facetId: facet.props.facetId,
      payload: facet,
    }));
  }

  render() {
    const childFacets = Children.toArray(
      this.props.children
    ) as FacetManagerChild[];
    const payload = this.createPayload(childFacets);
    const sortedFacets = this.controller.sort(payload).map((p) => p.payload);

    return sortedFacets;
  }
}

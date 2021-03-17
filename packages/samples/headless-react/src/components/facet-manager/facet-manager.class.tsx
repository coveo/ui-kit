import {Children, Component, ContextType, ReactElement} from 'react';
import {
  buildFacetManager,
  FacetManager as HeadlessFacetManager,
  FacetManagerPayload,
  FacetManagerState,
  Unsubscribe,
} from '@coveo/headless';
import {AppContext} from '../../context/engine';

type FacetManagerChild = ReactElement<{facetId: string}>;
export class FacetManager extends Component<
  {
    children?: FacetManagerChild | FacetManagerChild[];
  },
  FacetManagerState
> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessFacetManager;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildFacetManager(this.context.engine!);
    this.updateState();

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
    if (!this.state) {
      return this.props.children;
    }

    const childFacets = Children.toArray(
      this.props.children
    ) as FacetManagerChild[];
    const payload = this.createPayload(childFacets);
    const sortedFacets = this.controller.sort(payload).map((p) => p.payload);

    return sortedFacets;
  }
}

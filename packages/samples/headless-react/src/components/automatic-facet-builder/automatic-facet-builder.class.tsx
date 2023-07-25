import {
  buildAutomaticFacetBuilder,
  AutomaticFacetBuilderProps,
  AutomaticFacetBuilderState,
  AutomaticFacetBuilder as HeadlessAutomaticFacetBuilder,
  Unsubscribe,
} from '@coveo/headless';
import {Component, ContextType} from 'react';
import {AppContext} from '../../context/engine';
import {AutomaticFacet as AutomaticFacetFn} from '../automatic-facet/automatic-facet.fn';

export class AutomaticFacetBuilder extends Component<
  AutomaticFacetBuilderProps,
  AutomaticFacetBuilderState
> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessAutomaticFacetBuilder;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildAutomaticFacetBuilder(
      this.context.engine!,
      this.props
    );
    this.updateState();

    this.unsubscribe = this.controller.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  private updateState() {
    this.setState(this.controller.state);
  }

  render() {
    if (!this.state) {
      return null;
    }
    const automaticFacets = this.state.automaticFacets.map((facet) => {
      return (
        <AutomaticFacetFn
          key={facet.state.field}
          controller={facet}
        ></AutomaticFacetFn>
      );
    });
    return automaticFacets;
  }
}

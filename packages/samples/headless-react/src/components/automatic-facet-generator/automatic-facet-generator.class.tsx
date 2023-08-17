import {
  buildAutomaticFacetGenerator,
  AutomaticFacetGeneratorProps,
  AutomaticFacetGeneratorState,
  AutomaticFacetGenerator as HeadlessAutomaticFacetGenerator,
  Unsubscribe,
} from '@coveo/headless';
import {Component, ContextType} from 'react';
import {AppContext} from '../../context/engine';
import {AutomaticFacet} from '../automatic-facet/automatic-facet.class';

export class AutomaticFacetGenerator extends Component<
  AutomaticFacetGeneratorProps,
  AutomaticFacetGeneratorState
> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessAutomaticFacetGenerator;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildAutomaticFacetGenerator(
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
        <AutomaticFacet
          key={facet.state.field}
          controller={facet}
        ></AutomaticFacet>
      );
    });
    return automaticFacets;
  }
}

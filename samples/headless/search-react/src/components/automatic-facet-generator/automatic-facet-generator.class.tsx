import {
  type AutomaticFacetGeneratorOptions,
  type AutomaticFacetGeneratorState,
  buildAutomaticFacetGenerator,
  type AutomaticFacetGenerator as HeadlessAutomaticFacetGenerator,
  type Unsubscribe,
} from '@coveo/headless';
import {Component, type ContextType} from 'react';
import {AppContext} from '../../context/engine';
import {AutomaticFacet} from '../automatic-facet/automatic-facet.class';

export class AutomaticFacetGenerator extends Component<
  AutomaticFacetGeneratorOptions,
  AutomaticFacetGeneratorState
> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessAutomaticFacetGenerator;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildAutomaticFacetGenerator(this.context.engine!, {
      options: {
        desiredCount: this.props.desiredCount,
        numberOfValues: this.props.numberOfValues,
      },
    });
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

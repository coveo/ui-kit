import {Component, ContextType} from 'react';
import {
  buildNumericFacet,
  NumericFacet as HeadlessNumericFacet,
  NumericFacetOptions,
  NumericFacetState,
  NumericFacetValue,
  Unsubscribe,
} from '@coveo/headless';
import {AppContext} from '../../context/engine';

interface NumericFacetProps extends NumericFacetOptions {
  format: (n: number) => string;
  facetId: string;
}

export class NumericFacet extends Component<
  NumericFacetProps,
  NumericFacetState
> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessNumericFacet;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildNumericFacet(this.context.engine!, {
      options: {
        field: this.props.field,
        facetId: this.props.facetId,
        generateAutomaticRanges: this.props.generateAutomaticRanges,
        ...(this.props.currentValues && {
          currentValues: this.props.currentValues,
        }),
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

  private getKeyForRange(value: NumericFacetValue) {
    return `[${value.start}..${value.end}${value.endInclusive ? ']' : '['}`;
  }

  render() {
    if (!this.state) {
      return null;
    }

    if (!this.state.values.length) {
      return <div>No facet values</div>;
    }

    const {format} = this.props;

    return (
      <ul>
        {this.state.values.map((value) => (
          <li key={this.getKeyForRange(value)}>
            <input
              type="checkbox"
              checked={this.controller.isValueSelected(value)}
              onChange={() => this.controller.toggleSelect(value)}
              disabled={this.state.isLoading}
            />
            {format(value.start)} to {format(value.end)}{' '}
            {value.endInclusive ? 'inclusively' : 'exclusively'} (
            {value.numberOfResults}{' '}
            {value.numberOfResults === 1 ? 'result' : 'results'})
          </li>
        ))}
      </ul>
    );
  }
}

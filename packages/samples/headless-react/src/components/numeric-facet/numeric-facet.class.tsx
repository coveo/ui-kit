import {Component} from 'react';
import {
  buildNumericFacet,
  NumericFacet as HeadlessNumericFacet,
  NumericFacetState,
  NumericFacetValue,
  NumericRangeRequest,
  Unsubscribe,
} from '@coveo/headless';
import {engine} from '../../engine';

interface NumericFacetProps {
  format: (n: number) => string;
  field: string;
  facetId: string;
  generateAutomaticRanges: boolean;
  currentValues?: NumericRangeRequest[];
}

export class NumericFacet extends Component<NumericFacetProps> {
  private controller: HeadlessNumericFacet;
  public state: NumericFacetState;
  private unsubscribe: Unsubscribe = () => {};

  constructor(props: NumericFacetProps) {
    super(props);

    this.controller = buildNumericFacet(engine, {
      options: {
        field: props.field,
        facetId: props.facetId,
        generateAutomaticRanges: props.generateAutomaticRanges,
        ...(props.currentValues && {currentValues: props.currentValues}),
      },
    });
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

  private getKeyForRange(value: NumericFacetValue) {
    return `[${value.start}..${value.end}${value.endInclusive ? ']' : '['}`;
  }

  render() {
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

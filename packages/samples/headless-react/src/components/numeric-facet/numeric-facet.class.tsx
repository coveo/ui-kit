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

interface BaseNumericFacetProps {
  field: string;
  facetId: string;
  format: (n: number) => string;
}

interface AutomaticNumericFacetProps extends BaseNumericFacetProps {
  generateAutomaticRanges: true;
  currentValues?: NumericRangeRequest[];
}

interface ManualNumericFacetProps extends BaseNumericFacetProps {
  generateAutomaticRanges: false;
  currentValues: NumericRangeRequest[];
}

export class NumericFacet extends Component<
  AutomaticNumericFacetProps | ManualNumericFacetProps
> {
  private controller: HeadlessNumericFacet;
  public state: NumericFacetState;
  private unsubscribe: Unsubscribe = () => {};

  constructor(props: AutomaticNumericFacetProps | ManualNumericFacetProps) {
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

    const {format: formatNumber} = this.props;

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
            From {formatNumber(value.start)} to {formatNumber(value.end)}{' '}
            {value.endInclusive ? 'inclusively' : 'exclusively'} (
            {value.numberOfResults}{' '}
            {value.numberOfResults === 1 ? 'result' : 'results'})
          </li>
        ))}
      </ul>
    );
  }
}

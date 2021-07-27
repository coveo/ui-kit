import {Component, ContextType} from 'react';
import {
  buildDateFacet,
  DateFacet,
  DateFacetOptions,
  DateFacetState,
  DateFacetValue,
  Unsubscribe,
  deserializeRelativeDate,
} from '@coveo/headless';
import {AppContext} from '../../context/engine';

interface RelativeDateFacetProps extends DateFacetOptions {
  facetId: string;
}

export class RelativeDateFacet extends Component<
  RelativeDateFacetProps,
  DateFacetState
> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: DateFacet;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildDateFacet(this.context.engine!, {
      options: this.props,
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

  private getKeyForRange(value: DateFacetValue) {
    return `[${value.start}..${value.end}${value.endInclusive ? ']' : '['}`;
  }

  private format(value: string) {
    const relativeDate = deserializeRelativeDate(value);
    return relativeDate.period === 'now'
      ? relativeDate.period
      : `${relativeDate.period} ${relativeDate.amount} ${relativeDate.unit}`;
  }

  render() {
    if (!this.state) {
      return null;
    }

    if (
      !this.state.values.filter(
        (value) => value.state !== 'idle' || value.numberOfResults > 0
      ).length
    ) {
      return <div>No facet values</div>;
    }

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
            {this.format(value.start)} to {this.format(value.end)}{' '}
            {value.endInclusive ? 'inclusively' : 'exclusively'} (
            {value.numberOfResults}{' '}
            {value.numberOfResults === 1 ? 'result' : 'results'})
          </li>
        ))}
      </ul>
    );
  }
}

import {Component, ContextType} from 'react';
import {
  buildDateFacet,
  DateFacet as HeadlessDateFacet,
  DateFacetOptions,
  DateFacetState,
  DateFacetValue,
  Unsubscribe,
} from '@coveo/headless';
import {parseDate} from './date-utils';
import {AppContext} from '../../context/engine';

interface DateFacetProps extends DateFacetOptions {
  facetId: string;
}

export class DateFacet extends Component<DateFacetProps, DateFacetState> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessDateFacet;
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

  private format(dateStr: string) {
    return parseDate(dateStr).format('MMMM D YYYY');
  }

  render() {
    if (!this.state) {
      return null;
    }

    if (!this.state.values.length) {
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

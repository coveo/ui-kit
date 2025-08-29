import {
  buildDateFacet,
  type DateFacetOptions,
  type DateFacetState,
  type DateFacetValue,
  type DateFacet as HeadlessDateFacet,
  type Unsubscribe,
} from '@coveo/headless';
import {Component, type ContextType} from 'react';
import {AppContext} from '../../context/engine';
import {parseDate} from './date-utils';

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
    return `[${value.start}..${value.end}]`;
  }

  private format(dateStr: string) {
    return parseDate(dateStr).format('MMMM D YYYY');
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
            {this.format(value.start)} to {this.format(value.end)} (
            {value.numberOfResults}{' '}
            {value.numberOfResults === 1 ? 'result' : 'results'})
          </li>
        ))}
      </ul>
    );
  }
}

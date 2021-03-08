import {Component} from 'react';
import {
  buildDateFacet,
  DateFacet as HeadlessDateFacet,
  DateFacetOptions,
  DateFacetState,
  DateFacetValue,
  Unsubscribe,
} from '@coveo/headless';
import {engine} from '../../engine';
import {parseDate} from './date-utils';

type DateRangeRequest = Required<DateFacetOptions>['currentValues'][number]; // TODO: Remove this when using the new interface.

interface BaseDateFacetProps {
  field: string;
  facetId: string;
}

interface AutomaticDateFacetProps extends BaseDateFacetProps {
  generateAutomaticRanges: true;
  currentValues?: DateRangeRequest[];
}

interface ManualDateFacetProps extends BaseDateFacetProps {
  generateAutomaticRanges: false;
  currentValues: DateRangeRequest[];
}

export class DateFacet extends Component<
  AutomaticDateFacetProps | ManualDateFacetProps
> {
  private controller: HeadlessDateFacet;
  public state: DateFacetState;
  private unsubscribe: Unsubscribe = () => {};

  constructor(props: AutomaticDateFacetProps | ManualDateFacetProps) {
    super(props);

    this.controller = buildDateFacet(engine, {
      options: {
        field: props.field,
        facetId: props.facetId,
        generateAutomaticRanges: props.generateAutomaticRanges as true, // TODO: Remove this cast when using the new interface,
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

  private getKeyForRange(value: DateFacetValue) {
    return `[${value.start}..${value.end}${value.endInclusive ? ']' : '['}`;
  }

  private format(dateStr: string) {
    return parseDate(dateStr).format('MMMM D YYYY');
  }

  render() {
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

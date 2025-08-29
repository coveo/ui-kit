import {
  buildDateFilter,
  buildDateRange,
  type DateFilterOptions,
  type DateFilterState,
  type DateFilter as HeadlessDateFilter,
  type Unsubscribe,
} from '@coveo/headless';
import {Component, type ContextType} from 'react';
import {AppContext} from '../../context/engine';
import {parseDate} from '../date-facet/date-utils';

interface DateFilterProps extends DateFilterOptions {
  facetId: string;
}

export class DateFilter extends Component<DateFilterProps, DateFilterState> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessDateFilter;
  private unsubscribe: Unsubscribe = () => {};
  private startRef!: HTMLInputElement;
  private endRef!: HTMLInputElement;

  componentDidMount() {
    this.controller = buildDateFilter(this.context.engine!, {
      options: {
        field: this.props.field,
        facetId: this.props.facetId,
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

  private formattedDateValue(date?: string | Date) {
    if (!date) {
      return '';
    }
    return parseDate(date).format('YYYY-MM-DD');
  }

  private apply() {
    if (!this.startRef.validity.valid || !this.endRef.validity.valid) {
      return;
    }

    this.controller.setRange(
      buildDateRange({
        start: this.startRef.valueAsDate!,
        end: this.endRef.valueAsDate!,
      })
    );
  }

  render() {
    if (!this.state) {
      return null;
    }

    const {range} = this.state;

    return [
      <input
        key="start"
        type="date"
        ref={(ref) => {
          this.startRef = ref!;
        }}
        defaultValue={this.formattedDateValue(range?.start)}
        placeholder="Start"
      />,
      <input
        key="end"
        type="date"
        ref={(ref) => {
          this.endRef = ref!;
        }}
        defaultValue={this.formattedDateValue(range?.end)}
        placeholder="End"
      />,
      <button key="apply" onClick={() => this.apply()}>
        Apply
      </button>,
    ];
  }
}

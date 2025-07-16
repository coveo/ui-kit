import {
  buildNumericFilter,
  type NumericFilter as HeadlessNumericFilter,
  type NumericFilterOptions,
  type NumericFilterState,
  type Unsubscribe,
} from '@coveo/headless';
import {Component, type ContextType} from 'react';
import {AppContext} from '../../context/engine';

interface NumericFilterProps extends NumericFilterOptions {
  facetId: string;
}

export class NumericFilter extends Component<
  NumericFilterProps,
  NumericFilterState
> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessNumericFilter;
  private unsubscribe: Unsubscribe = () => {};
  private startRef!: HTMLInputElement;
  private endRef!: HTMLInputElement;

  componentDidMount() {
    this.controller = buildNumericFilter(this.context.engine!, {
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

  render() {
    if (!this.state) {
      return null;
    }

    const {range} = this.state;

    return [
      <input
        key="start"
        type="number"
        ref={(ref) => {
          this.startRef = ref!;
        }}
        defaultValue={range?.start}
        placeholder="Start"
      />,
      <input
        key="end"
        type="number"
        ref={(ref) => {
          this.endRef = ref!;
        }}
        defaultValue={range?.end}
        placeholder="End"
      />,
      <button
        key="apply"
        onClick={() =>
          this.controller.setRange({
            start: this.startRef.valueAsNumber,
            end: this.endRef.valueAsNumber,
          })
        }
      >
        Apply
      </button>,
    ];
  }
}

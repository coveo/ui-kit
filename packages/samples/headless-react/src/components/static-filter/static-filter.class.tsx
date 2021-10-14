import {Component, ContextType} from 'react';
import {AppContext} from '../../context/engine';
import {
  buildStaticFilter,
  StaticFilter as HeadlessStaticFilter,
  StaticFilterOptions,
  StaticFilterState,
  Unsubscribe,
} from '@coveo/headless';

export class StaticFilter extends Component<
  StaticFilterOptions,
  StaticFilterState
> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessStaticFilter;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildStaticFilter(this.context.engine!, {
      options: this.props,
    });

    this.unsubscribe = this.controller.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  private updateState() {
    this.setState(this.controller.state);
  }

  public render() {
    if (!this.state) {
      return null;
    }

    return (
      <ul>
        {this.state.values.map((value) => {
          return (
            <li key={value.caption}>
              <input
                type="checkbox"
                checked={this.controller.isValueSelected(value)}
                onChange={() => this.controller.toggleSelect(value)}
              />
              <span>{value.caption}</span>
            </li>
          );
        })}
      </ul>
    );
  }
}

import {Component, ContextType} from 'react';
import {
  buildSearchBox,
  SearchBox as HeadlessSearchBox,
  SearchBoxState,
  Unsubscribe,
} from '@coveo/headless';
import {AppContext} from '../../context/engine';

export class SearchBox extends Component<{}, SearchBoxState> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessSearchBox;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildSearchBox(this.context.engine!, {
      options: {numberOfSuggestions: 8},
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

  private isEnterKey(e: React.KeyboardEvent<HTMLInputElement>) {
    return e.key === 'Enter';
  }

  render() {
    if (!this.state) {
      return null;
    }

    return (
      <div>
        <input
          value={this.state.value}
          onChange={(e) => this.controller.updateText(e.target.value)}
          onKeyDown={(e) => this.isEnterKey(e) && this.controller.submit()}
        />
        <ul>
          {this.state.suggestions.map((suggestion) => {
            const value = suggestion.rawValue;
            return (
              <li
                key={value}
                onClick={() => this.controller.selectSuggestion(value)}
              >
                {value}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

import {Component, ContextType} from 'react';
import {
  buildStandaloneSearchBox,
  StandaloneSearchBox as HeadlessStandaloneSearchBox,
  StandaloneSearchBoxState,
  Unsubscribe,
} from '@coveo/headless';
import {AppContext} from '../../context/engine';

export class StandaloneSearchBox extends Component<
  {},
  StandaloneSearchBoxState
> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessStandaloneSearchBox;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildStandaloneSearchBox(this.context.engine!, {
      options: {redirectionUrl: 'https://mywebsite.com/search'},
    });
    this.updateState();

    this.unsubscribe = this.controller.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  componentDidUpdate() {
    if (!this.state?.redirectTo) {
      return;
    }
    window.location.href = `${this.state.redirectTo}/${encodeURIComponent(
      this.state.value
    )}`;
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

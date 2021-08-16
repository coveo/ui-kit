import {Component, ContextType} from 'react';
import {
  buildStandaloneSearchBox,
  StandaloneSearchBox as HeadlessStandaloneSearchBox,
  StandaloneSearchBoxState,
  Unsubscribe,
} from '@coveo/headless';
import {AppContext} from '../../context/engine';
import {standaloneSearchBoxStorageKey} from './standalone-search-box-storage-key';

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
      options: {redirectionUrl: '/search-page'},
    });
    this.updateState();

    this.unsubscribe = this.controller.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  componentDidUpdate() {
    const {redirectTo, value, analytics} = this.state;

    if (!redirectTo) {
      return;
    }

    const data = JSON.stringify({value, analytics});
    localStorage.setItem(standaloneSearchBoxStorageKey, data);
    window.location.href = redirectTo;
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

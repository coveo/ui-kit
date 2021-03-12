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
    window.location.href = this.state.redirectTo + this.getURIParameters();
  }

  private updateState() {
    this.setState(this.controller.state);
  }

  private getURIParameters() {
    const {redirectTo, value} = this.state;
    const query = encodeURIComponent(value);
    // The query pipeline can trigger different redirection URLs, as documented here: https://docs.coveo.com/en/1458/tune-relevance/trigger-query-pipeline-feature
    // Unless a redirect trigger is added, you won't need such conditions. These redirections are only verified here as an example.
    if (redirectTo === 'https://mywebsite.com/search') {
      return '/' + query;
    } else if (redirectTo === 'https://www.google.com') {
      return '?q=' + query;
    }
    return '?search=' + query;
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

import {
  buildInstantResults,
  buildSearchBox,
  type InstantResults as HeadlessInstantResults,
  type SearchBox as HeadlessSearchbox,
  type InstantResultsState,
  type SearchBoxState,
  type Unsubscribe,
} from '@coveo/headless';
import {Component, type ContextType, type ReactNode} from 'react';
import {AppContext} from '../../context/engine';

export class InstantResults extends Component<
  {},
  {searchbox: SearchBoxState; instantResults: InstantResultsState}
> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controllerInstantResults!: HeadlessInstantResults;
  private controllerSearchbox!: HeadlessSearchbox;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    const sharedIdBetweenSearchboxAndInstantResult = 'sample-instant-results';

    this.controllerSearchbox = buildSearchBox(this.context.engine!, {
      options: {id: sharedIdBetweenSearchboxAndInstantResult},
    });

    this.controllerInstantResults = buildInstantResults(this.context.engine!, {
      options: {
        maxResultsPerQuery: 5,
        searchBoxId: sharedIdBetweenSearchboxAndInstantResult,
      },
    });
    this.updateState();

    const unsubInstantResults = this.controllerInstantResults.subscribe(() =>
      this.updateState()
    );
    const unsubSearchbox = this.controllerSearchbox.subscribe(() => {
      this.updateState();
    });

    this.unsubscribe = () => {
      unsubInstantResults();
      unsubSearchbox();
    };
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  private updateState() {
    this.setState({
      instantResults: this.controllerInstantResults.state,
      searchbox: this.controllerSearchbox.state,
    });
  }

  private isEnterKey(e: React.KeyboardEvent<HTMLInputElement>) {
    return e.key === 'Enter';
  }

  render(): ReactNode {
    if (!this.state) {
      return;
    }
    return (
      <div>
        <p>
          Type in the searchbox and hover a query suggestion to preview
          associated results
        </p>

        <input
          value={this.state.searchbox.value}
          onChange={(e) => this.controllerSearchbox.updateText(e.target.value)}
          onKeyDown={(e) =>
            this.isEnterKey(e) && this.controllerSearchbox.submit()
          }
        />

        <div style={{display: 'flex'}}>
          <ul>
            {this.state.searchbox.suggestions.map((suggestion) => {
              const value = suggestion.rawValue;
              return (
                <li
                  key={value}
                  onMouseEnter={() =>
                    this.controllerInstantResults.updateQuery(value)
                  }
                  onClick={() =>
                    this.controllerSearchbox.selectSuggestion(value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      this.controllerSearchbox.selectSuggestion(value);
                    }
                  }}
                >
                  {value}
                </li>
              );
            })}
          </ul>
          <ul>
            {this.state.instantResults.results.map((result) => {
              return (
                <li key={result.uniqueId}>
                  <div>
                    {result.title}: {result.raw.source}
                  </div>
                  <pre>{result.excerpt}</pre>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }
}

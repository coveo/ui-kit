import {Component} from 'react';
import {
  buildSearchBox,
  SearchBox as HeadlessSearchBox,
  SearchBoxOptions,
  SearchBoxState,
  Unsubscribe,
} from '@coveo/headless';
import {engine} from '../../engine';

export class SearchBox extends Component {
  private searchBox: HeadlessSearchBox;
  public state: SearchBoxState;
  private unsubscribe: Unsubscribe = () => {};

  constructor(props: {}) {
    super(props);

    const options: SearchBoxOptions = {numberOfSuggestions: 8};
    this.searchBox = buildSearchBox(engine, {options});
    this.state = this.searchBox.state;
  }

  componentDidMount() {
    this.unsubscribe = this.searchBox.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  private updateState() {
    this.setState(this.searchBox.state);
  }

  private isEnterKey(e: React.KeyboardEvent<HTMLInputElement>) {
    return e.key === 'Enter';
  }

  render() {
    return (
      <div>
        <input
          value={this.state.value}
          onChange={(e) => this.searchBox.updateText(e.target.value)}
          onKeyDown={(e) => this.isEnterKey(e) && this.searchBox.submit()}
        />
        <ul>
          {this.state.suggestions.map((suggestion) => {
            const value = suggestion.rawValue;
            return (
              <li
                key={value}
                onClick={() => this.searchBox.selectSuggestion(value)}
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

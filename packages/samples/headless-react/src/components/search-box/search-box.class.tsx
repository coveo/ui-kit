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
  private controller: HeadlessSearchBox;
  public state: SearchBoxState;
  private unsubscribe: Unsubscribe = () => {};

  constructor(props: {}) {
    super(props);

    const options: SearchBoxOptions = {numberOfSuggestions: 8};
    this.controller = buildSearchBox(engine, {options});
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

  private isEnterKey(e: React.KeyboardEvent<HTMLInputElement>) {
    return e.key === 'Enter';
  }

  render() {
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

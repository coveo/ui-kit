import {
  FieldSuggestions as HeadlessFieldSuggestions,
  FieldSuggestionsOptions,
  Unsubscribe,
  buildFieldSuggestions,
  FacetSearchState,
} from '@coveo/headless';
import {Component, ContextType} from 'react';
import {AppContext} from '../../../context/engine';

type FieldSuggestionsFacetOptions = FieldSuggestionsOptions['facet'];

interface FieldSuggestionsProps extends FieldSuggestionsFacetOptions {
  facetId: string;
}

export class FieldSuggestions extends Component<
  FieldSuggestionsProps,
  FacetSearchState
> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessFieldSuggestions;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildFieldSuggestions(this.context.engine!, {
      options: {facet: this.props},
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

  private onInput(text: string) {
    if (text === '') {
      this.controller.clear();
      return;
    }
    this.controller.updateText(text);
  }

  render() {
    if (!this.state) {
      return null;
    }

    return (
      <div>
        <input onInput={(e) => this.onInput(e.currentTarget.value)} />
        <ul>
          {this.state.values.map((facetSearchValue) => (
            <li
              key={facetSearchValue.rawValue}
              onClick={() => this.controller.select(facetSearchValue)}
            >
              {facetSearchValue.displayValue} ({facetSearchValue.count} results)
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

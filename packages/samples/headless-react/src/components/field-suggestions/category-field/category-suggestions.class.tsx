import {
  buildCategoryFieldSuggestions,
  type CategoryFacetSearchState,
  type CategoryFieldSuggestionsOptions,
  type CategoryFieldSuggestions as HeadlessCategoryFieldSuggestions,
  type Unsubscribe,
} from '@coveo/headless';
import {Component, type ContextType} from 'react';
import {AppContext} from '../../../context/engine';

type CategoryFieldSuggestionsFacetOptions =
  CategoryFieldSuggestionsOptions['facet'];

interface CategoryFieldSuggestionsProps
  extends CategoryFieldSuggestionsFacetOptions {
  facetId: string;
}

export class CategoryFieldSuggestions extends Component<
  CategoryFieldSuggestionsProps,
  CategoryFacetSearchState
> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessCategoryFieldSuggestions;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildCategoryFieldSuggestions(this.context.engine!, {
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
              key={[...facetSearchValue.path, facetSearchValue.rawValue].join(
                '>'
              )}
              onClick={() => this.controller.select(facetSearchValue)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  this.controller.select(facetSearchValue);
                }
              }}
            >
              {[...facetSearchValue.path, facetSearchValue.displayValue].join(
                ' > '
              )}{' '}
              ({facetSearchValue.count} results)
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

import {Component, h, Prop, State} from '@stencil/core';
import {SearchBox, SearchBoxState, buildSearchBox} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  BindStateToI18n,
  I18nState,
  InitializeBindings,
} from '../../utils/initialization-utils';
import {randomID} from '../../utils/utils';

/**
 * A search box with built in support for query suggestions.
 *
 * @part submit-button - The search box submit button
 * @part input - The search box input
 * @part input-wrapper - The wrapper for the searchbox input
 * @part clear-button - The search box input's clear button
 * @part suggestions - The list of suggestions
 * @part suggestion - The suggestion
 * @part active-suggestion - The currently active suggestion
 */
@Component({
  tag: 'atomic-search-box',
  styleUrl: 'atomic-search-box.pcss',
  shadow: true,
})
export class AtomicSearchBox {
  @InitializeBindings() public bindings!: Bindings;

  @BindStateToI18n()
  @State()
  public strings: I18nState = {
    clear: () => this.bindings.i18n.t('clear'),
    search: () => this.bindings.i18n.t('search'),
    searchBox: () => this.bindings.i18n.t('searchBox'),
    querySuggestionList: () => this.bindings.i18n.t('querySuggestionList'),
  };
  /**
   * Maximum number of suggestions to display
   */
  @Prop() numberOfSuggestions = 5;
  /**
   * The placeholder for the search box input
   */
  @Prop() placeholder = '';
  /**
   * Whether the submit button should be placed before the input
   */
  @Prop() leadingSubmitButton = false;
  @Prop({reflect: true, attribute: 'data-id'}) public _id = randomID(
    'atomic-search-box-'
  );

  private searchBox!: SearchBox;

  @BindStateToController('searchBox')
  @State()
  private searchBoxState!: SearchBoxState;
  @State() public error!: Error;

  public initialize() {
    this.searchBox = buildSearchBox(this.bindings.engine, {
      options: {
        numberOfSuggestions: this.numberOfSuggestions,
        highlightOptions: {
          notMatchDelimiters: {
            open: '<strong>',
            close: '</strong>',
          },
          correctionDelimiters: {
            open: '<i>',
            close: '</i>',
          },
        },
      },
    });
  }

  public render() {
    return (
      <base-search
        _id={this._id}
        strings={this.strings}
        suggestionValues={this.searchBoxState.suggestions.map((v) => ({
          ...v,
          value: v.highlightedValue,
        }))}
        onTextChange={(e) => this.searchBox.updateText(e.detail)}
        onSearch={() => this.searchBox.submit()}
        onSelectValue={(e) => {
          this.searchBox.selectSuggestion(
            this.searchBoxState.suggestions[e.detail].rawValue
          );
        }}
        onShowSuggestions={() => this.searchBox.showSuggestions()}
        onHideSuggestions={() => this.searchBox.hideSuggestions()}
      />
    );
  }
}

import {QuerySetActionCreators, Suggestion} from '@coveo/headless';
import {Component, h, Prop, State} from '@stencil/core';
import {
  buildInsightSearchBox,
  InsightSearchBox,
  InsightSearchBoxState,
  loadInsightQuerySetActions,
} from '..';
import SearchSlimIcon from '../../../images/search-slim.svg';
import {AriaLiveRegion} from '../../../utils/accessibility-utils';
import {isMacOS} from '../../../utils/device-utils';
import {
  BindStateToController,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {encodeForDomAttribute} from '../../../utils/string-utils';
import {randomID} from '../../../utils/utils';
import {SearchBoxCommon} from '../../common/search-box/search-box-common';
import {SearchBoxWrapper} from '../../common/search-box/search-box-wrapper';
import {SearchTextArea} from '../../common/search-box/search-text-area';
import {
  ButtonSearchSuggestion,
  queryDataAttribute,
} from '../../search/atomic-search-box/search-suggestion';
import {
  elementHasNoQuery,
  elementHasQuery,
  SearchBoxSuggestionElement,
} from '../../search/search-box-suggestions/suggestions-common';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-search-box',
  styleUrl: 'atomic-insight-search-box.pcss',
  shadow: true,
})
export class AtomicInsightSearchBox {
  @InitializeBindings() public bindings!: InsightBindings;

  private searchBox!: InsightSearchBox;
  private id!: string;
  private textAreaRef!: HTMLTextAreaElement;
  private panelRef: HTMLElement | undefined;
  private querySetActions!: QuerySetActionCreators;
  private searchBoxCommon!: SearchBoxCommon;

  @BindStateToController('searchBox')
  @State()
  private searchBoxState!: InsightSearchBoxState;
  @State() public error!: Error;
  @State() private suggestedQuery = '';
  @State() private isExpanded = false;
  @State() private suggestionElements: SearchBoxSuggestionElement[] = [];
  @State() private activeDescendant = '';

  /**
   * Whether to prevent the user from triggering a search from the component.
   * Perfect for use cases where you need to disable the search conditionally, like when the input is empty.
   */
  @Prop({reflect: true}) public disableSearch = false;
  /**
   * The number of query suggestions to display when interacting with the search box.
   */
  @Prop({reflect: true}) public numberOfSuggestions = 5;

  @AriaLiveRegion('search-box')
  protected searchBoxAriaMessage!: string;

  @AriaLiveRegion('search-suggestions', true)
  protected suggestionsAriaMessage!: string;

  public initialize() {
    this.id = randomID('atomic-search-box-');
    this.querySetActions = loadInsightQuerySetActions(this.bindings.engine);

    const searchBoxOptions = {
      id: this.id,
      numberOfSuggestions: this.numberOfSuggestions,
      highlightOptions: {
        notMatchDelimiters: {
          open: '<span class="font-bold">',
          close: '</span>',
        },
        correctionDelimiters: {
          open: '<span class="font-normal">',
          close: '</span>',
        },
      },
    };

    this.searchBox = buildInsightSearchBox(this.bindings.engine, {
      options: searchBoxOptions,
    });

    this.searchBoxCommon = new SearchBoxCommon({
      id: this.id,
      bindings: this.bindings,
      querySetActions: this.querySetActions,
      focusValue: this.focusValue.bind(this),
      clearSuggestions: this.clearSuggestions.bind(this),
      getIsSearchDisabled: () => this.disableSearch,
      getIsExpanded: () => this.isExpanded,
      getPanelInFocus: () => this.panelRef,
      getActiveDescendant: () => this.activeDescendant,
      getActiveDescendantElement: () => this.activeDescendantElement,
      getAllSuggestionElements: () => this.suggestionElements,
    });
  }

  private get suggestions() {
    return this.searchBoxState?.suggestions ?? [];
  }

  private get activeDescendantElement(): HTMLElement | null {
    if (!this.searchBoxCommon.hasActiveDescendant) {
      return null;
    }

    return this.panelRef?.querySelector(`#${this.activeDescendant}`) || null;
  }

  private updateActiveDescendant(activeDescendant = '') {
    this.activeDescendant = activeDescendant;
  }

  private clearSuggestionElements() {
    this.suggestionElements = [];
    this.searchBoxAriaMessage = '';
  }

  private clearSuggestions() {
    this.isExpanded = false;
    this.updateActiveDescendant();
    this.clearSuggestionElements();
  }

  private onSubmit() {
    if (this.activeDescendantElement) {
      this.activeDescendantElement.click();
      this.updateActiveDescendant();
      return;
    }

    this.searchBox.submit();
    this.updateActiveDescendant();
    this.clearSuggestions();
  }

  private onSuggestionMouseOver(item: SearchBoxSuggestionElement, id: string) {
    this.updateActiveDescendant(id);
    if (item.query) {
      this.updateSuggestedQuery(item.query);
    }
  }

  private updateQueryFromSuggestion() {
    const suggestedQuery =
      this.activeDescendantElement?.getAttribute(queryDataAttribute);
    if (suggestedQuery && this.searchBoxState.value !== suggestedQuery) {
      this.searchBoxCommon.updateQuery(suggestedQuery);
      this.updateSuggestedQuery(suggestedQuery);
    }
  }

  private updateAriaLiveActiveDescendant(value: HTMLElement) {
    if (isMacOS()) {
      this.suggestionsAriaMessage = value.ariaLabel!;
    }
  }

  private focusValue(value: HTMLElement) {
    this.updateActiveDescendant(value.id);
    this.searchBoxCommon.scrollActiveDescendantIntoView();
    this.updateQueryFromSuggestion();
    this.updateAriaLiveActiveDescendant(value);
  }

  private updateSuggestionElements() {
    this.suggestionElements = this.getSuggestionElements(this.suggestions);
  }

  private getSuggestionElements(suggestions: Suggestion[]) {
    const elements = suggestions.map((suggestion) =>
      this.renderSuggestionItem(suggestion)
    );
    const max =
      this.numberOfSuggestions + elements.filter(elementHasNoQuery).length;

    return elements.slice(0, max);
  }

  private onKeyDown(e: KeyboardEvent) {
    if (this.disableSearch) {
      return;
    }

    switch (e.key) {
      case 'Enter':
        this.onSubmit();
        break;
      case 'Escape':
        this.clearSuggestions();
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.searchBoxCommon.focusNextValue();
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (this.searchBoxCommon.firstValue === this.activeDescendantElement) {
          this.updateActiveDescendant();
        } else {
          this.searchBoxCommon.focusPreviousValue();
        }
        break;
      case 'Tab':
        this.clearSuggestions();
        break;
    }
  }

  private updateAriaMessage() {
    const elsLength = this.suggestionElements.filter(elementHasQuery).length;
    this.searchBoxAriaMessage = elsLength
      ? this.bindings.i18n.t('query-suggestions-available', {
          count: elsLength,
        })
      : this.bindings.i18n.t('query-suggestions-unavailable');
  }

  private async triggerSuggestions() {
    this.updateSuggestedQuery('');
    this.updateAriaMessage();
  }

  private onInput(value: string) {
    this.isExpanded = true;
    this.searchBox.updateText(value);
    this.triggerSuggestions();
  }

  private onFocus() {
    this.isExpanded = true;
    this.updateActiveDescendant();
    this.searchBox.showSuggestions();
    this.triggerSuggestions();
  }

  private async updateSuggestedQuery(suggestedQuery: string) {
    this.suggestedQuery = suggestedQuery;
  }

  private triggerTextAreaChange(value: string) {
    this.textAreaRef.value = value;
    this.textAreaRef.dispatchEvent(new window.Event('change'));
  }

  private renderSuggestion(
    item: SearchBoxSuggestionElement,
    index: number,
    lastIndex: number
  ) {
    const id = `${this.id}-suggestion-${item.key}`;

    const isSelected =
      id === this.activeDescendant || this.suggestedQuery === item.query;

    if (index === lastIndex && item.hideIfLast) {
      return null;
    }

    return (
      <ButtonSearchSuggestion
        bindings={this.bindings}
        id={id}
        suggestion={item}
        isSelected={isSelected}
        side={'left'}
        index={index}
        lastIndex={lastIndex}
        isDoubleList={false}
        onClick={(e: Event) => {
          this.searchBoxCommon.onSuggestionClick(item, e);
        }}
        onMouseOver={() => {
          this.onSuggestionMouseOver(item, id);
        }}
      ></ButtonSearchSuggestion>
    );
  }

  private renderSuggestionItem(
    suggestion: Suggestion
  ): SearchBoxSuggestionElement {
    const hasQuery = this.searchBox.state.value !== '';
    return {
      part: 'query-suggestion-item',
      content: (
        <div part="query-suggestion-content" class="flex items-center">
          <atomic-icon
            part="query-suggestion-icon"
            icon={SearchSlimIcon}
            class="w-4 h-4 mr-2 shrink-0"
          ></atomic-icon>
          {hasQuery ? (
            <span
              part="query-suggestion-text"
              class="break-all line-clamp-2"
              innerHTML={suggestion.highlightedValue}
            ></span>
          ) : (
            <span part="query-suggestion-text" class="break-all line-clamp-2">
              {suggestion.rawValue}
            </span>
          )}
        </div>
      ),
      key: `qs-${encodeForDomAttribute(suggestion.rawValue)}`,
      query: suggestion.rawValue,
      ariaLabel: this.bindings.i18n.t('query-suggestion-label', {
        query: suggestion.rawValue,
        interpolation: {escapeValue: false},
      }),
      onSelect: () => {
        this.searchBox.selectSuggestion(suggestion.rawValue);
      },
    };
  }

  private renderPanel(
    elements: SearchBoxSuggestionElement[],
    setRef: (el: HTMLElement | undefined) => void,
    getRef: () => HTMLElement | undefined
  ) {
    if (!elements.length) {
      return null;
    }

    return (
      <div
        part={'suggestions'}
        ref={setRef}
        class="flex flex-grow basis-1/2 flex-col"
        onMouseDown={(e) => {
          if (e.target === getRef()) {
            e.preventDefault();
          }
        }}
      >
        {elements.map((suggestion, index) =>
          this.renderSuggestion(suggestion, index, elements.length - 1)
        )}
      </div>
    );
  }

  private renderSuggestions() {
    if (!this.searchBoxCommon.hasSuggestions) {
      this.updateSuggestedQuery('');
      this.updateActiveDescendant();
      return null;
    }

    return (
      <div
        id={this.searchBoxCommon.popupId}
        part="suggestions-wrapper"
        class={`flex w-full z-10 absolute left-0 top-full rounded-md bg-background border border-neutral ${
          this.searchBoxCommon.showSuggestions ? '' : 'hidden'
        }`}
        role="application"
        aria-label={this.bindings.i18n.t('search-suggestions-single-list')}
        aria-activedescendant={this.activeDescendant}
      >
        {this.renderPanel(
          this.suggestionElements,
          (el) => (this.panelRef = el),
          () => this.panelRef
        )}
      </div>
    );
  }

  componentWillRender() {
    this.updateSuggestionElements();
  }

  public render() {
    return (
      <SearchBoxWrapper disabled={this.disableSearch} textArea>
        <atomic-focus-detector
          style={{display: 'contents'}}
          onFocusExit={() => this.clearSuggestions()}
        >
          <atomic-icon
            part="submit-icon"
            icon={SearchSlimIcon}
            class="w-4 h-4 my-auto mr-0 ml-4"
          />
          <SearchTextArea
            textAreaRef={this.textAreaRef}
            loading={this.searchBoxState.isLoading}
            ref={(el) => el && (this.textAreaRef = el)}
            bindings={this.bindings}
            value={this.searchBoxState.value}
            ariaLabel={this.searchBoxCommon.getSearchInputLabel()}
            placeholder={this.bindings.i18n.t('search-ellipsis')}
            onFocus={() => this.onFocus()}
            onKeyDown={(e) => this.onKeyDown(e)}
            onClear={() => {
              this.searchBox.clear();
              this.triggerTextAreaChange('');
            }}
            onInput={(e) => this.onInput((e.target as HTMLInputElement).value)}
          />
          {this.renderSuggestions()}
        </atomic-focus-detector>
      </SearchBoxWrapper>
    );
  }
}

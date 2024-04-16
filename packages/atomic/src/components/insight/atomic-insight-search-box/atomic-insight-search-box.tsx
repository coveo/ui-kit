import {loadInsightSearchActions} from '@coveo/headless/insight';
import {Component, Element, h, Prop, State} from '@stencil/core';
import {
  buildInsightSearchBox,
  InsightSearchBox,
  InsightSearchBoxState,
  InsightSuggestion,
} from '..';
import SearchSlimIcon from '../../../images/search-slim.svg';
import {AriaLiveRegion} from '../../../utils/accessibility-utils';
import {hasKeyboard, isMacOS} from '../../../utils/device-utils';
import {
  BindStateToController,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {randomID} from '../../../utils/utils';
import {SearchBoxWrapper} from '../../common/search-box/search-box-wrapper';
import {SearchTextArea} from '../../common/search-box/search-text-area';
import {
  getPartialSearchBoxSuggestionElement,
  QuerySuggestionContainer,
  QuerySuggestionIcon,
  QuerySuggestionText,
} from '../../common/suggestions/query-suggestions';
import {SuggestionManager} from '../../common/suggestions/suggestion-manager';
import {
  elementHasQuery,
  SearchBoxSuggestionElement,
} from '../../common/suggestions/suggestions-common';
import {ButtonSearchSuggestion} from '../../search/atomic-search-box/search-suggestion';
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
  private suggestionManager!: SuggestionManager<InsightSearchBox>;

  @Element() private host!: HTMLElement;

  @BindStateToController('searchBox')
  @State()
  private searchBoxState!: InsightSearchBoxState;
  @State() public error!: Error;
  @State() private isExpanded = false;

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

    const searchBoxOptions = {
      id: this.id,
      numberOfSuggestions: 0,
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

    const {fetchQuerySuggestions, registerQuerySuggest} =
      loadInsightSearchActions(this.bindings.engine);

    this.searchBox = buildInsightSearchBox(this.bindings.engine, {
      options: searchBoxOptions,
    });

    this.bindings.engine.dispatch(
      registerQuerySuggest({id: this.id, count: this.numberOfSuggestions})
    );

    this.suggestionManager = new SuggestionManager({
      getNumberOfSuggestionsToDisplay: () => this.numberOfSuggestions,
      updateQuery: (query) => this.searchBox.updateText(query),
      getSearchBoxValue: () => this.searchBoxState.value,
      getSuggestionTimeout: () => 500,
      getSuggestionDelay: () => 0,
      getHost: () => this.host,
      getLogger: () => this.bindings.engine.logger,
    });

    this.suggestionManager.registerSuggestions({
      position: 0,
      renderItems: () =>
        this.searchBox.state.suggestions.map((suggestion) =>
          this.renderSuggestionItem(suggestion)
        ),
      onInput: () => {
        this.bindings.engine.dispatch(fetchQuerySuggestions({id: this.id}));
      },
      panel: 'left',
    });
  }

  private onSubmit() {
    if (this.suggestionManager.activeDescendantElement) {
      this.suggestionManager.clickOnActiveElement();
      return;
    }

    this.searchBox.submit();
    this.suggestionManager.clearSuggestions();
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
        this.suggestionManager.clearSuggestions();
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.suggestionManager.focusNextValue();
        this.announceNewActiveSuggestionToScreenReader();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.suggestionManager.focusPreviousValue();
        this.announceNewActiveSuggestionToScreenReader();
        break;
      case 'Tab':
        this.suggestionManager.clearSuggestions();
        break;
    }
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
      id === this.suggestionManager.activeDescendant ||
      this.suggestionManager.suggestedQuery === item.query;

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
          this.suggestionManager.onSuggestionClick(item, e);
        }}
        onMouseOver={() => {
          this.suggestionManager.onSuggestionMouseOver(item, 'left', id);
        }}
      ></ButtonSearchSuggestion>
    );
  }

  private renderSuggestionItem(
    suggestion: InsightSuggestion
  ): SearchBoxSuggestionElement {
    const hasQuery = this.searchBox.state.value !== '';
    const partialItem = getPartialSearchBoxSuggestionElement(
      suggestion,
      this.bindings.i18n
    );

    return {
      ...partialItem,
      content: (
        <QuerySuggestionContainer>
          <QuerySuggestionIcon
            icon={SearchSlimIcon}
            hasSuggestion={this.searchBoxState.suggestions.length > 1}
          />

          <QuerySuggestionText suggestion={suggestion} hasQuery={hasQuery} />
        </QuerySuggestionContainer>
      ),
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
    if (!this.suggestionManager.hasSuggestions) {
      this.suggestionManager.updateActiveDescendant();
      return null;
    }

    return (
      <div
        id={`${this.id}-popup`}
        part="suggestions-wrapper"
        class={`flex w-full z-10 absolute left-0 top-full rounded-md bg-background border border-neutral ${
          this.suggestionManager.hasSuggestions && this.isExpanded
            ? ''
            : 'hidden'
        }`}
        role="application"
        aria-label={this.bindings.i18n.t('search-suggestions-single-list')}
        aria-activedescendant={this.suggestionManager.activeDescendant}
      >
        {this.renderPanel(
          this.suggestionManager.allSuggestionElements,
          (el) => (this.suggestionManager.leftPanel = el),
          () => this.suggestionManager.leftPanel
        )}
      </div>
    );
  }

  private getSearchInputLabel() {
    if (isMacOS()) {
      return this.bindings.i18n.t('search-box-with-suggestions-macos');
    }
    if (!hasKeyboard()) {
      return this.bindings.i18n.t('search-box-with-suggestions-keyboardless');
    }
    return this.bindings.i18n.t('search-box-with-suggestions');
  }

  private async onFocus() {
    this.isExpanded = true;
    await this.suggestionManager.triggerSuggestions();
    this.announceNewSuggestionsToScreenReader();
  }

  private async onInput(value: string) {
    this.searchBox.updateText(value);
    this.isExpanded = true;
    await this.suggestionManager.triggerSuggestions();
    this.announceNewSuggestionsToScreenReader();
  }

  private announceNewActiveSuggestionToScreenReader() {
    const ariaLabel = this.suggestionManager.activeDescendantElement?.ariaLabel;
    if (isMacOS() && ariaLabel) {
      this.suggestionsAriaMessage = ariaLabel;
    }
  }

  private announceNewSuggestionsToScreenReader() {
    const numberOfSuggestionsToAnnounce =
      this.suggestionManager.allSuggestionElements.filter(
        elementHasQuery
      ).length;
    this.searchBoxAriaMessage = numberOfSuggestionsToAnnounce
      ? this.bindings.i18n.t('query-suggestions-available', {
          count: numberOfSuggestionsToAnnounce,
        })
      : this.bindings.i18n.t('query-suggestions-unavailable');
  }

  public render() {
    return (
      <SearchBoxWrapper disabled={this.disableSearch} textArea>
        <atomic-focus-detector
          style={{display: 'contents'}}
          onFocusExit={() => this.suggestionManager.clearSuggestions()}
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
            ariaLabel={this.getSearchInputLabel()}
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

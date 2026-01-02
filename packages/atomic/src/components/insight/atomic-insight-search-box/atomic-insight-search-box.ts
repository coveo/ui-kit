import {
  buildSearchBox as buildInsightSearchBox,
  type SearchBox as InsightSearchBox,
  type SearchBoxState as InsightSearchBoxState,
  type Suggestion as InsightSuggestion,
  loadInsightSearchActions,
} from '@coveo/headless/insight';
import {html, LitElement, nothing, type TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {createRef, type Ref, ref} from 'lit/directives/ref.js';
import SearchSlimIcon from '@/images/search-slim.svg';
import {renderSearchBoxWrapper} from '@/src/components/common/search-box/search-box-wrapper';
import {renderSearchBoxTextArea} from '@/src/components/common/search-box/search-text-area';
import {renderQuerySuggestionContainer} from '@/src/components/common/suggestions/query-suggestion-container';
import {renderQuerySuggestionIcon} from '@/src/components/common/suggestions/query-suggestion-icon';
import {renderQuerySuggestionText} from '@/src/components/common/suggestions/query-suggestion-text';
import {getPartialSearchBoxSuggestionElement} from '@/src/components/common/suggestions/query-suggestions';
import {SuggestionManager} from '@/src/components/common/suggestions/suggestion-manager';
import type {SearchBoxSuggestionElement} from '@/src/components/common/suggestions/suggestions-types';
import {elementHasQuery} from '@/src/components/common/suggestions/suggestions-utils';
import type {InsightBindings} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {AriaLiveRegionController} from '@/src/utils/accessibility-utils';
import {hasKeyboard, isMacOS} from '@/src/utils/device-utils';
import {isFocusingOut, randomID} from '@/src/utils/utils';
import '@/src/components/common/atomic-suggestion-renderer/atomic-suggestion-renderer';
import '@/src/components/common/atomic-icon/atomic-icon';
import styles from './atomic-insight-search-box.tw.css?inline';

/**
 * The `atomic-insight-search-box` component allows users to enter and submit search queries within the Insight interface.
 * It provides query suggestions as the user types.
 *
 * @internal
 * @part wrapper - The wrapper around the entire search box.
 * @part submit-icon - The search icon displayed in the search box.
 * @part textarea - The text area where users enter their search queries.
 * @part textarea-expander - The container that allows the textarea to expand.
 * @part clear-button-wrapper - The wrapper for the clear button.
 * @part clear-icon - The icon in the clear button.
 * @part suggestions-wrapper - The wrapper around the suggestions panel.
 * @part suggestions - The container for the suggestions.
 */
@customElement('atomic-insight-search-box')
@bindings()
@withTailwindStyles
export class AtomicInsightSearchBox
  extends LitElement
  implements InitializableComponent<InsightBindings>
{
  static styles = styles;

  @state()
  public bindings!: InsightBindings;

  @state()
  public error!: Error;

  public searchBox!: InsightSearchBox;

  @bindStateToController('searchBox')
  @state()
  private searchBoxState!: InsightSearchBoxState;

  @state()
  private isExpanded = false;

  /**
   * Whether to prevent the user from triggering a search from the component.
   * Perfect for use cases where you need to disable the search conditionally, like when the input is empty.
   */
  public disableSearch = false;

  /**
   * The number of query suggestions to display when interacting with the search box.
   */
  public numberOfSuggestions = 5;

  private searchBoxId!: string;
  private textAreaRef: Ref<HTMLTextAreaElement> = createRef();
  private suggestionManager!: SuggestionManager<InsightSearchBox>;
  private searchBoxAriaMessage = new AriaLiveRegionController(
    this,
    'search-box'
  );
  private suggestionsAriaMessage = new AriaLiveRegionController(
    this,
    'search-suggestions',
    true
  );

  public initialize() {
    this.searchBoxId = randomID('atomic-search-box-');

    const searchBoxOptions = {
      id: this.searchBoxId,
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
      registerQuerySuggest({
        id: this.searchBoxId,
        count: this.numberOfSuggestions,
      })
    );

    this.suggestionManager = new SuggestionManager({
      getNumberOfSuggestionsToDisplay: () => this.numberOfSuggestions,
      updateQuery: (query) => this.searchBox.updateText(query),
      getSearchBoxValue: () => this.searchBoxState.value,
      getSuggestionTimeout: () => 500,
      getSuggestionDelay: () => 0,
      getHost: () => this,
      getLogger: () => this.bindings.engine.logger,
    });

    this.suggestionManager.registerSuggestions({
      position: 0,
      renderItems: () =>
        this.searchBox.state.suggestions.map((suggestion) =>
          this.renderSuggestionItem(suggestion)
        ),
      onInput: () =>
        this.bindings.engine.dispatch(
          fetchQuerySuggestions({id: this.searchBoxId})
        ),
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

  private async onKeyDown(e: KeyboardEvent) {
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
        await this.suggestionManager.focusNextValue();
        this.announceNewActiveSuggestionToScreenReader();
        break;
      case 'ArrowUp':
        e.preventDefault();
        await this.suggestionManager.focusPreviousValue();
        this.announceNewActiveSuggestionToScreenReader();
        break;
      case 'Tab':
        this.suggestionManager.clearSuggestions();
        break;
    }
  }

  private triggerTextAreaChange(value: string) {
    if (!this.textAreaRef.value) {
      return;
    }
    this.textAreaRef.value.value = value;
    this.textAreaRef.value.dispatchEvent(new window.Event('change'));
  }

  private renderSuggestion(
    item: SearchBoxSuggestionElement,
    index: number,
    lastIndex: number
  ): TemplateResult | typeof nothing {
    const id = `${this.searchBoxId}-suggestion-${item.key}`;

    const isSelected =
      id === this.suggestionManager.activeDescendant ||
      this.suggestionManager.suggestedQuery === item.query;

    if (index === lastIndex && item.hideIfLast) {
      return nothing;
    }

    return html`<atomic-suggestion-renderer
      .i18n=${this.bindings.i18n}
      .id=${id}
      .suggestion=${item}
      .isSelected=${isSelected}
      .side=${'left'}
      .index=${index}
      .lastIndex=${lastIndex}
      .isDoubleList=${false}
      @click=${(e: Event) => {
        this.suggestionManager.onSuggestionClick(item, e);
      }}
      @mouseover=${() => {
        this.suggestionManager.onSuggestionMouseOver(item, 'left', id);
      }}
    ></atomic-suggestion-renderer>`;
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
      content: renderQuerySuggestionContainer()(html`
        ${renderQuerySuggestionIcon({
          props: {
            icon: SearchSlimIcon,
            hasSuggestion: this.searchBoxState.suggestions.length > 1,
          },
        })}
        ${renderQuerySuggestionText({
          props: {
            suggestion,
            hasQuery,
          },
        })}
      `),
      onSelect: () => {
        this.searchBox.selectSuggestion(suggestion.rawValue);
      },
    };
  }

  private renderPanel(
    elements: SearchBoxSuggestionElement[],
    setRef: (el: HTMLElement | undefined) => void,
    getRef: () => HTMLElement | undefined
  ): TemplateResult | typeof nothing {
    if (!elements.length) {
      return nothing;
    }

    return html`<div
      part="suggestions"
      ${ref((el) => {
        setRef(el as HTMLElement | undefined);
      })}
      class="flex grow basis-1/2 flex-col"
      @mousedown=${(e: MouseEvent) => {
        if (e.target === getRef()) {
          e.preventDefault();
        }
      }}
    >
      ${elements.map((suggestion, index) =>
        this.renderSuggestion(suggestion, index, elements.length - 1)
      )}
    </div>`;
  }

  private renderSuggestions(): TemplateResult | typeof nothing {
    if (!this.suggestionManager.hasSuggestions) {
      this.suggestionManager.updateActiveDescendant();
      return nothing;
    }

    const hasActiveSuggestion = !!this.suggestionManager.activeDescendant;
    const activeDescendantAttr = hasActiveSuggestion
      ? {'aria-activedescendant': this.suggestionManager.activeDescendant}
      : {};

    return html`<div
      id="${this.searchBoxId}-popup"
      part="suggestions-wrapper"
      class="bg-background border-neutral absolute top-full left-0 z-10 flex w-full rounded-md border ${
        this.suggestionManager.hasSuggestions && this.isExpanded ? '' : 'hidden'
      }"
      role="application"
      aria-label=${this.bindings.i18n.t('search-suggestions-single-list')}
      ${hasActiveSuggestion ? activeDescendantAttr : nothing}
    >
      ${this.renderPanel(
        this.suggestionManager.allSuggestionElements,
        (el) => {
          this.suggestionManager.leftPanel = el;
        },
        () => this.suggestionManager.leftPanel
      )}
    </div>`;
  }

  private getSearchInputLabel(): string {
    if (isMacOS()) {
      return this.bindings.i18n.t('search-box-with-suggestions-macos');
    }
    if (!hasKeyboard()) {
      return this.bindings.i18n.t('search-box-with-suggestions-keyboardless');
    }
    return this.bindings.i18n.t('search-box-with-suggestions');
  }

  private async onFocus() {
    if (this.isExpanded) {
      return;
    }
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
      this.suggestionsAriaMessage.message = ariaLabel;
    }
  }

  private announceNewSuggestionsToScreenReader() {
    const numberOfSuggestionsToAnnounce =
      this.suggestionManager.allSuggestionElements.filter(
        elementHasQuery
      ).length;
    this.searchBoxAriaMessage.message = numberOfSuggestionsToAnnounce
      ? this.bindings.i18n.t(
          this.searchBoxState.value
            ? 'query-suggestions-available'
            : 'query-suggestions-available-no-query',
          {
            count: numberOfSuggestionsToAnnounce,
            query: this.searchBoxState.value,
          }
        )
      : this.bindings.i18n.t('query-suggestions-unavailable');
  }

  @errorGuard()
  render() {
    return renderSearchBoxWrapper({
      props: {
        disabled: this.disableSearch,
        onFocusout: (event) => {
          if (!isFocusingOut(event)) {
            return;
          }
          this.suggestionManager.clearSuggestions();
          this.isExpanded = false;
        },
      },
    })(html`
      <atomic-icon
        part="submit-icon"
        .icon=${SearchSlimIcon}
        class="my-auto mr-0 ml-4 h-4 w-4"
      ></atomic-icon>
      ${renderSearchBoxTextArea({
        props: {
          textAreaRef: this.textAreaRef,
          loading: this.searchBoxState.isLoading,
          i18n: this.bindings.i18n,
          value: this.searchBoxState.value,
          ariaLabel: this.getSearchInputLabel(),
          title: this.bindings.i18n.t('search'),
          onClear: () => {
            this.searchBox.clear();
            this.triggerTextAreaChange('');
          },
          popup: {
            id: `${this.searchBoxId}-popup`,
            activeDescendant: this.suggestionManager.activeDescendant || '',
            expanded: this.isExpanded && this.suggestionManager.hasSuggestions,
            hasSuggestions: this.suggestionManager.hasSuggestions,
          },
          onInput: (e) => this.onInput((e.target as HTMLInputElement).value),
          onFocus: () => this.onFocus(),
          onKeyDown: (e) => this.onKeyDown(e),
        },
      })}
      ${this.renderSuggestions()}
    `);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-search-box': AtomicInsightSearchBox;
  }
}

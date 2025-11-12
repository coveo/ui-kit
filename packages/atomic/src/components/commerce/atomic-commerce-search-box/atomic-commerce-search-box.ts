import {
  buildSearchBox,
  buildStandaloneSearchBox,
  loadQuerySetActions,
  type SearchBox,
  type SearchBoxOptions,
  type SearchBoxState,
  type StandaloneSearchBox,
  type StandaloneSearchBoxState,
} from '@coveo/headless/commerce';
import {type CSSResultGroup, css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {createRef, type RefOrCallback, ref} from 'lit/directives/ref.js';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {watch} from '@/src/decorators/watch';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {AriaLiveRegionController} from '@/src/utils/accessibility-utils';
import {hasKeyboard, isMacOS} from '@/src/utils/device-utils';
import {
  SafeStorage,
  type StandaloneSearchBoxData,
  StorageItems,
} from '@/src/utils/local-storage-utils';
import {updateBreakpoints} from '@/src/utils/replace-breakpoint-utils';
import {getDefaultSlotContent} from '@/src/utils/slot-utils';
import {
  isFocusingOut,
  once,
  randomID,
  spreadProperties,
} from '../../../utils/utils';
import type {RedirectionPayload} from '../../common/search-box/redirection-payload';
import {renderSearchBoxWrapper} from '../../common/search-box/search-box-wrapper';
import {renderSearchBoxTextArea} from '../../common/search-box/search-text-area';
import {renderSubmitButton} from '../../common/search-box/submit-button';
import {SuggestionManager} from '../../common/suggestions/suggestion-manager';
import type {
  SearchBoxSuggestionElement,
  SearchBoxSuggestionsBindings,
  SearchBoxSuggestionsEvent,
} from '../../common/suggestions/suggestions-types';
import {elementHasQuery} from '../../common/suggestions/suggestions-utils';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import type {SelectChildProductEventArgs} from '../atomic-product-children/select-child-product-event';
import '../atomic-commerce-search-box-instant-products/atomic-commerce-search-box-instant-products';
import '../atomic-commerce-search-box-query-suggestions/atomic-commerce-search-box-query-suggestions';
import '../atomic-commerce-search-box-recent-queries/atomic-commerce-search-box-recent-queries';

/**
 * The `atomic-commerce-search-box` component enables users to perform product searches with built-in query suggestions and optional redirection to a search page.
 *
 * @slot default - The default slot where you can add child components to the search box.
 *
 * @part wrapper - The search box wrapper.
 * @part input - The search box input.
 * @part loading - The search box loading animation.
 * @part clear-button - The button to clear the search box of input.
 * @part clear-icon - The clear button's icon.
 * @part submit-button - The search box submit button.
 * @part submit-icon - The search box submit button's icon.
 * @part suggestions - A list of suggested query corrections on each panel.
 * @part suggestions-left - A list of suggested query corrections on the left panel.
 * @part suggestions-right - A list of suggested query corrections on the right panel.
 * @part suggestions-wrapper - The wrapper that contains suggestion panels.
 * @part suggestions-single-list - The wrapper that contains 1 suggestion list.
 * @part suggestions-double-list - The wrapper that contains 2 suggestion lists.
 * @part suggestion - A suggested query correction.
 * @part active-suggestion - The currently active suggestion.
 * @part suggestion-divider - An item in the list that separates groups of suggestions.
 * @part suggestion-with-query - An item in the list that will update the search box query.
 *
 * @part query-suggestion-item - A suggestion from the `atomic-commerce-search-box-query-suggestions` component.
 * @part query-suggestion-content - The contents of a suggestion from the `atomic-commerce-search-box-query-suggestions` component.
 * @part query-suggestion-icon - The icon of a suggestion from the `atomic-commerce-search-box-query-suggestions` component.
 * @part query-suggestion-text - The text of a suggestion from the `atomic-commerce-search-box-query-suggestions` component.
 *
 * @part recent-query-item - A suggestion from the `atomic-commerce-search-box-recent-queries` component.
 * @part recent-query-content - The contents of a suggestion from the `atomic-commerce-search-box-recent-queries` component.
 * @part recent-query-icon - The icon of a suggestion from the `atomic-commerce-search-box-recent-queries` component.
 * @part recent-query-text - The text of a suggestion from the `atomic-commerce-search-box-recent-queries` component.
 * @part recent-query-text-highlight - The highlighted portion of the text of a suggestion from the `atomic-commerce-search-box-recent-queries` component.
 * @part recent-query-title-item - The clear button above suggestions from the `atomic-commerce-search-box-recent-queries` component.
 * @part recent-query-title-content - The contents of the clear button above suggestions from the `atomic-commerce-search-box-recent-queries` component.
 * @part recent-query-title - The "recent searches" text of the clear button above suggestions from the `atomic-commerce-search-box-recent-queries` component.
 * @part recent-query-clear - The "clear" text of the clear button above suggestions from the `atomic-commerce-search-box-recent-queries` component.
 *
 * @part instant-results-item - An instant product rendered by an `atomic-commerce-search-box-instant-products` component.
 * @part instant-results-show-all - The clickable suggestion to show all items for the current instant product search rendered by an `atomic-commerce-search-box-instant-products` component.
 * @part instant-results-show-all-button - The button inside the clickable suggestion from the `atomic-commerce-search-box-instant-products` component.
 *
 * @event redirect - Event that is emitted when a standalone search box redirection is triggered. By default, the search box will directly change the URL and redirect accordingly, so if you want to handle the redirection differently, use this event.
 */
@customElement('atomic-commerce-search-box')
@bindings()
@withTailwindStyles
export class AtomicCommerceSearchBox
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  static styles: CSSResultGroup =
    css`@import "../../search/atomic-search-box/atomic-search-box.pcss";`;

  @state() bindings!: CommerceBindings;
  @state() error!: Error;
  @state() isExpanded = false;
  @bindStateToController('searchBox')
  @state()
  private searchBoxState!: SearchBoxState | StandaloneSearchBoxState;

  private textAreaRef = createRef<HTMLTextAreaElement>();
  private searchBoxSuggestionEventsQueue: CustomEvent<
    SearchBoxSuggestionsEvent<SearchBox | StandaloneSearchBox>
  >[] = [];
  private suggestionManager!: SuggestionManager<
    SearchBox | StandaloneSearchBox
  >;
  public searchBox!: SearchBox | StandaloneSearchBox;

  protected searchBoxAriaMessage = new AriaLiveRegionController(
    this,
    'search-box'
  );

  protected suggestionsAriaMessage = new AriaLiveRegionController(
    this,
    'search-suggestions',
    true
  );

  /**
   * The amount of queries displayed when the user interacts with the search box.
   * By default, a mix of query suggestions and recent queries will be shown.
   * You can configure those settings using the following components as children:
   *  - atomic-commerce-search-box-query-suggestions
   *  - atomic-commerce-search-box-recent-queries
   */
  @property({type: Number, attribute: 'number-of-queries', reflect: true})
  numberOfQueries = 8;

  /**
   * Defining this option makes the search box standalone (see [Use a
   * Standalone Search Box](https://docs.coveo.com/en/atomic/latest/usage/ssb/)).
   *
   * This option defines the default URL the user should be redirected to, when a query is submitted.
   * If a query pipeline redirect is triggered, it will redirect to that URL instead
   * (see [query pipeline triggers](https://docs.coveo.com/en/1458)).
   */
  @property({type: String, attribute: 'redirection-url', reflect: true})
  public redirectionUrl?: string;

  /**
   * The timeout for suggestion queries, in milliseconds.
   * If a suggestion query times out, the suggestions from that particular query won't be shown.
   */
  @property({type: Number, attribute: 'suggestion-timeout'})
  public suggestionTimeout = 400;

  /**
   * The delay for suggestion queries on input, in milliseconds.
   *
   * The suggestion request will be delayed until the end user stops typing for at least the specified amount of time.
   *
   * This delay is used to avoid sending too many requests to the Coveo Platform when the user is typing, as well as reducing potential input lag on low end devices.
   * A higher delay will reduce input lag, at the cost of suggestions freshness.
   */
  @property({type: Number, attribute: 'suggestion-delay'})
  public suggestionDelay = 0;

  /**
   * Whether to prevent the user from triggering searches and query suggestions from the component.
   * Perfect for use cases where you need to disable the search conditionally.
   * For the specific case when you need to disable the search based on the length of the query, refer to {@link minimumQueryLength}.
   */
  @property({
    type: Boolean,
    attribute: 'disable-search',
    reflect: true,
    converter: booleanConverter,
  })
  public disableSearch = false;

  /**
   * The minimum query length required to enable search.
   * For example, to disable the search for empty queries, set this to `1`.
   */
  @property({type: Number, attribute: 'minimum-query-length', reflect: true})
  public minimumQueryLength = 0;

  /**
   * Whether to clear all active query filters when the end user submits a new query from the search box.
   * Setting this option to "false" is not recommended and can lead to an increasing number of queries returning no products.
   */
  @property({
    type: Boolean,
    attribute: 'clear-filters',
    reflect: true,
    converter: booleanConverter,
  })
  public clearFilters = true;

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener(
      'atomic/searchBoxSuggestion/register',
      (event: Event) => {
        const customEvent = event as CustomEvent<
          SearchBoxSuggestionsEvent<SearchBox | StandaloneSearchBox>
        >;
        this.searchBoxSuggestionEventsQueue.push(customEvent);
      }
    );
    this.addEventListener('atomic/selectChildProduct', (event: Event) => {
      const customEvent = event as CustomEvent<SelectChildProductEventArgs>;
      customEvent.stopPropagation();
      this.bindings.store.state.activeProductChild = customEvent.detail.child;
      this.suggestionManager.forceUpdate();
    });
  }

  willUpdate() {
    if (!this.searchBoxState || !this.searchBox) {
      return;
    }
    if (
      !('redirectTo' in this.searchBoxState) ||
      !('afterRedirection' in this.searchBox)
    ) {
      return;
    }
    const {redirectTo, value} = this.searchBoxState;

    if (redirectTo === '') {
      return;
    }
    const data: Omit<StandaloneSearchBoxData, 'analytics'> = {
      value,
      enableQuerySyntax: false,
    };

    const storage = new SafeStorage();
    storage.setJSON(StorageItems.STANDALONE_SEARCH_BOX_DATA, data);

    this.searchBox.afterRedirection();

    const event = new CustomEvent<RedirectionPayload>('redirect');
    this.dispatchEvent(event);
    if (!event.defaultPrevented) {
      window.location.href = redirectTo;
    }
  }

  public initialize() {
    this.id = randomID('atomic-commerce-search-box-');

    this.initializeSearchboxController();
    this.initializeSuggestionManager();
  }

  private initializeSearchboxController() {
    this.searchBox = this.redirectionUrl
      ? buildStandaloneSearchBox(this.bindings.engine, {
          options: {
            ...this.searchBoxOptions,
            redirectionUrl: this.redirectionUrl,
            overwrite: true,
          },
        })
      : buildSearchBox(this.bindings.engine, {
          options: this.searchBoxOptions,
        });
  }

  private initializeSuggestionManager() {
    if (this.suggestionManager) {
      return;
    }

    this.suggestionManager = new SuggestionManager({
      getNumberOfSuggestionsToDisplay: () => this.numberOfQueries,
      updateQuery: (query) => this.searchBox.updateText(query),
      getSearchBoxValue: () => this.searchBoxState.value,
      getSuggestionTimeout: () => this.suggestionTimeout,
      getSuggestionDelay: () => this.suggestionDelay,
      getHost: () => this,
      getLogger: () => this.bindings.engine.logger,
    });
    this.suggestionManager.initializeSuggestions(this.suggestionBindings);
  }

  @watch('redirectionUrl')
  watchRedirectionUrl() {
    if (this.isStandaloneSearchBox(this.searchBox) && this.redirectionUrl) {
      this.searchBox.updateRedirectUrl(this.redirectionUrl);
    } else {
      this.registerNewSearchBoxController();
    }
  }

  private isStandaloneSearchBox(
    searchBox: SearchBox | StandaloneSearchBox
  ): searchBox is StandaloneSearchBox {
    return 'updateRedirectUrl' in searchBox;
  }

  private updateBreakpoints = once(() => updateBreakpoints(this));

  private get isSearchDisabledForEndUser() {
    if (this.searchBoxState.value.trim().length < this.minimumQueryLength) {
      return true;
    }

    return this.disableSearch;
  }

  private get textAreaLabel() {
    if (this.isSearchDisabledForEndUser) {
      return this.bindings.i18n.t('search-disabled', {
        length: this.minimumQueryLength,
      });
    }

    if (isMacOS()) {
      return this.bindings.i18n.t('search-box-with-suggestions-macos');
    }
    if (!hasKeyboard()) {
      return this.bindings.i18n.t('search-box-with-suggestions-keyboardless');
    }
    return this.bindings.i18n.t('search-box-with-suggestions');
  }

  private get suggestionBindings(): SearchBoxSuggestionsBindings<
    SearchBox | StandaloneSearchBox
  > {
    return spreadProperties(
      this.bindings,
      this.suggestionManager.partialSuggestionBindings,
      this.partialSuggestionBindings
    );
  }

  private get partialSuggestionBindings(): Pick<
    SearchBoxSuggestionsBindings<SearchBox | StandaloneSearchBox>,
    | 'id'
    | 'isStandalone'
    | 'searchBoxController'
    | 'numberOfQueries'
    | 'clearFilters'
  > {
    return Object.defineProperties(
      {...this.bindings},
      {
        id: {
          get: () => this.id,
          enumerable: true,
        },
        searchBoxController: {
          get: () => this.searchBox,
          enumerable: true,
        },
        isStandalone: {
          get: () => !!this.redirectionUrl,
          enumerable: true,
        },
        numberOfQueries: {
          get: () => this.numberOfQueries,
          enumerable: true,
        },
        clearFilters: {
          get: () => this.clearFilters,
          enumerable: true,
        },
      }
    ) as unknown as Pick<
      SearchBoxSuggestionsBindings<SearchBox | StandaloneSearchBox>,
      | 'id'
      | 'isStandalone'
      | 'searchBoxController'
      | 'numberOfQueries'
      | 'clearFilters'
    >;
  }

  private get searchBoxOptions(): SearchBoxOptions {
    return {
      id: this.id,
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
      clearFilters: this.clearFilters,
    };
  }

  private registerNewSearchBoxController() {
    this.disconnectedCallback();
    this.initialize();
  }

  private registerSearchboxSuggestionEvents() {
    this.searchBoxSuggestionEventsQueue.forEach((evt) => {
      this.suggestionManager.registerSuggestionsFromEvent(
        evt,
        this.suggestionBindings
      );
    });
    this.searchBoxSuggestionEventsQueue = [];
  }

  private async onInput(value: string) {
    this.updateQueryWithoutQuerySuggestionTrigger(value);

    if (this.isSearchDisabledForEndUser) {
      this.suggestionManager.clearSuggestions();
      return;
    }
    this.isExpanded = true;
    await this.suggestionManager.triggerSuggestions();
    this.announceNewSuggestionsToScreenReader();
  }

  private async onFocus() {
    if (this.isExpanded) {
      return;
    }
    if (this.isSearchDisabledForEndUser) {
      return;
    }
    this.isExpanded = true;
    await this.suggestionManager.triggerSuggestions();
    this.announceNewSuggestionsToScreenReader();
  }

  private onSubmit() {
    this.isExpanded = false;
    if (this.suggestionManager.keyboardActiveDescendant) {
      this.suggestionManager.onSubmit();
      return;
    }

    this.searchBox.submit();
  }

  private async onKeyDown(e: KeyboardEvent) {
    if (this.isSearchDisabledForEndUser) {
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
      case 'ArrowRight':
        if (
          this.suggestionManager.hasActiveDescendant ||
          !this.searchBoxState.value
        ) {
          e.preventDefault();
          this.suggestionManager.focusPanel('right');
          this.announceNewActiveSuggestionToScreenReader();
        }
        break;
      case 'ArrowLeft':
        if (
          this.suggestionManager.hasActiveDescendant ||
          !this.searchBoxState.value
        ) {
          e.preventDefault();
          this.suggestionManager.focusPanel('left');
          this.announceNewActiveSuggestionToScreenReader();
        }
        break;
      case 'Tab':
        this.suggestionManager.clearSuggestions();
        break;
      default:
        if (this.suggestionManager.keyboardActiveDescendant) {
          this.suggestionManager.updateKeyboardActiveDescendant();
        }
        break;
    }
  }

  private triggerTextAreaChange(value: string) {
    this.textAreaRef.value!.value = value;
    this.textAreaRef.value!.dispatchEvent(new window.Event('change'));
  }

  private announceNewActiveSuggestionToScreenReader() {
    const ariaLabel = this.suggestionManager.activeDescendantElement?.ariaLabel;
    if (isMacOS() && ariaLabel) {
      this.suggestionsAriaMessage.message = ariaLabel;
    }
  }

  private announceNewSuggestionsToScreenReader() {
    const elsLength =
      this.suggestionManager.allSuggestionElements.filter(
        elementHasQuery
      ).length;

    this.searchBoxAriaMessage.message = elsLength
      ? this.bindings.i18n.t(
          this.searchBoxState.value
            ? 'query-suggestions-available'
            : 'query-suggestions-available-no-query',
          {
            count: elsLength,
            query: this.searchBoxState.value,
          }
        )
      : this.bindings.i18n.t('query-suggestions-unavailable');
  }

  private updateQueryWithoutQuerySuggestionTrigger(query: string) {
    const {engine} = this.bindings;
    engine.dispatch(
      loadQuerySetActions(engine).updateQuerySetQuery({
        id: this.id,
        query,
      })
    );
  }

  private renderAbsolutePositionSpacer() {
    return html`<textarea
      aria-hidden="true"
      part="textarea-spacer"
      class="invisible w-full p-3.5 px-4 text-lg"
      rows="1"
    ></textarea>`;
  }

  private renderTextBox() {
    return html`${renderSearchBoxTextArea({
      props: {
        textAreaRef: this.textAreaRef,
        loading: this.searchBoxState.isLoading,
        i18n: this.bindings.i18n,
        value: this.searchBoxState.value,
        title: this.textAreaLabel,
        ariaLabel: this.textAreaLabel,
        onFocus: () => this.onFocus(),
        onInput: (e: Event) =>
          this.onInput((e.target as HTMLTextAreaElement).value),
        onKeyDown: (e: KeyboardEvent) => this.onKeyDown(e),
        onClear: () => {
          this.searchBox.clear();
          this.suggestionManager.clearSuggestions();
          this.triggerTextAreaChange('');
          this.announceClearSearchBoxToScreenReader();
        },
        popup: {
          id: `${this.id}-popup`,
          activeDescendant: this.suggestionManager.activeDescendant,
          expanded: this.isExpanded,
          hasSuggestions: this.suggestionManager.hasSuggestions,
        },
      },
    })}`;
  }

  private renderSuggestions() {
    const part = `suggestions-wrapper ${
      this.suggestionManager.isDoubleList
        ? 'suggestions-double-list'
        : 'suggestions-single-list'
    }`;

    const isVisible =
      this.suggestionManager.hasSuggestions &&
      this.isExpanded &&
      !this.isSearchDisabledForEndUser;

    const classes = {
      'bg-background border-neutral absolute top-full left-0 z-10 flex w-full rounded-md border': true,
      hidden: !isVisible,
    };

    return html`<div
      id="${this.id}-popup"
      part=${part}
      class=${classMap(classes)}
      role="application"
      aria-label=${this.bindings.i18n.t(
        this.suggestionManager.isDoubleList
          ? 'search-suggestions-double-list'
          : 'search-suggestions-single-list'
      )}
      aria-activedescendant=${this.suggestionManager.activeDescendant}
    >
      ${this.renderPanel(
        'left',
        this.suggestionManager.leftSuggestionElements,
        (el) => {
          this.suggestionManager.leftPanel = el;
        },
        () => this.suggestionManager.leftPanel
      )}
      ${this.renderPanel(
        'right',
        this.suggestionManager.rightSuggestionElements,
        (el) => {
          this.suggestionManager.rightPanel = el;
        },
        () => this.suggestionManager.rightPanel
      )}
    </div>`;
  }

  private renderPanel(
    side: 'left' | 'right',
    elements: SearchBoxSuggestionElement[],
    setRef: (el: HTMLElement | undefined) => void,
    getRef: () => HTMLElement | undefined
  ) {
    if (!elements.length) {
      return null;
    }

    return html`<div
      part="suggestions suggestions-${side}"
      ${ref(setRef as RefOrCallback<Element>)}
      class="flex grow basis-1/2 flex-col"
      @mousedown=${(e: MouseEvent) => {
        if (e.target === getRef()) {
          e.preventDefault();
        }
      }}
    >
      ${elements.map((suggestion, index) =>
        this.renderSuggestion(suggestion, index, elements.length - 1, side)
      )}
    </div>`;
  }

  private renderSuggestion(
    item: SearchBoxSuggestionElement,
    index: number,
    lastIndex: number,
    side: 'left' | 'right'
  ) {
    const id = `${this.id}-${side}-suggestion-${item.key}`;

    const isSelected = id === this.suggestionManager.activeDescendant;

    if (index === lastIndex && item.hideIfLast) {
      return null;
    }
    return html`
      <atomic-suggestion-renderer
        .i18n=${this.bindings.i18n}
        .id=${id}
        .suggestion=${item}
        .isSelected=${isSelected}
        .side=${side}
        .index=${index}
        .lastIndex=${lastIndex}
        .isDoubleList=${this.suggestionManager.isDoubleList}
        .onClick=${async (e: Event) => {
          await this.suggestionManager.onSuggestionClick(item, e);
          if (item.key === 'recent-query-clear') {
            return;
          }

          this.isExpanded = false;
        }}
        .onMouseOver=${async () => {
          await this.suggestionManager.onSuggestionMouseOver(item, side, id);
        }}
      ></atomic-suggestion-renderer>
    `;
  }

  private renderSlotContent() {
    const hasDefaultSlot = getDefaultSlotContent(this).length > 0;

    if (hasDefaultSlot) {
      return html`<slot></slot>`;
    }

    return html`<atomic-commerce-search-box-recent-queries></atomic-commerce-search-box-recent-queries>
      <atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>`;
  }

  @bindingGuard()
  @errorGuard()
  render() {
    this.updateBreakpoints();

    if (!this.suggestionManager.suggestions.length) {
      this.registerSearchboxSuggestionEvents();
    }

    return html`
      ${this.renderAbsolutePositionSpacer()}
      ${renderSearchBoxWrapper({
        props: {
          disabled: this.isSearchDisabledForEndUser,
          onFocusout: (event) => {
            if (!isFocusingOut(event)) {
              return;
            }
            this.suggestionManager.clearSuggestions();
            this.isExpanded = false;
          },
        },
      })(
        html`${this.renderTextBox()}
      ${renderSubmitButton({
        props: {
          i18n: this.bindings.i18n,
          disabled: this.isSearchDisabledForEndUser,
          onClick: () => {
            this.searchBox.submit();
            this.suggestionManager.clearSuggestions();
          },
        },
      })}
      ${this.renderSuggestions()}`
      )}
      ${this.renderSlotContent()}
    `;
  }

  private announceClearSearchBoxToScreenReader() {
    this.searchBoxAriaMessage.message =
      this.bindings.i18n.t('search-box-cleared');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-search-box': AtomicCommerceSearchBox;
  }
}

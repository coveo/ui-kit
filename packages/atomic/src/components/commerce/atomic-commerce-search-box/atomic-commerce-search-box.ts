import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {errorGuard} from '@/src/decorators/error-guard';
import {InitializableComponent} from '@/src/decorators/types';
import {watch} from '@/src/decorators/watch';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin';
import {hasKeyboard, isMacOS} from '@/src/utils/device-utils';
import {
  SafeStorage,
  StandaloneSearchBoxData,
  StorageItems,
} from '@/src/utils/local-storage-utils';
import {updateBreakpoints} from '@/src/utils/replace-breakpoint';
import {isNullOrUndefined} from '@coveo/bueno';
import {
  buildSearchBox,
  buildStandaloneSearchBox,
  loadQuerySetActions,
  SearchBox,
  SearchBoxOptions,
  SearchBoxState,
  StandaloneSearchBox,
  StandaloneSearchBoxState,
} from '@coveo/headless/commerce';
import {CSSResultGroup, html, LitElement, nothing, unsafeCSS} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {ref, RefOrCallback} from 'lit/directives/ref.js';
import {
  isFocusingOut,
  once,
  randomID,
  spreadProperties,
} from '../../../utils/stencil-utils';
import {RedirectionPayload} from '../../common/search-box/redirection-payload';
import {searchBoxTextArea} from '../../common/search-box/search-box-text-area';
import {
  buttonSearchSuggestion,
  simpleSearchSuggestion,
} from '../../common/search-box/search-suggestion';
import {submitButton} from '../../common/search-box/submit-button';
import {wrapper} from '../../common/search-box/wrapper';
import {SuggestionManager} from '../../common/suggestions/suggestion-manager';
import {
  elementHasQuery,
  SearchBoxSuggestionElement,
  SearchBoxSuggestionsBindings,
  SearchBoxSuggestionsEvent,
} from '../../common/suggestions/suggestions-common';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import {SelectChildProductEventArgs} from '../product-template-components/atomic-product-children/select-child-product-event';
import styles from './atomic-commerce-search-box.tw.css';

/**
 * The `atomic-commerce-search-box` component creates a search box with built-in support for suggestions.
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
 * @part instant-results-item - An instant result rendered by an `atomic-commerce-search-box-instant-products` component.
 * @part instant-results-show-all - The clickable suggestion to show all items for the current instant results search rendered by an `atomic-commerce-search-box-instant-products` component.
 * @part instant-results-show-all-button - The button inside the clickable suggestion from the `atomic-commerce-search-box-instant-products` component.
 *
 * @event redirect - Event that is emitted when a standalone search box redirection is triggered. By default, the search box will directly change the URL and redirect accordingly, so if you want to handle the redirection differently, use this event.
 *
 * @alpha
 */
@customElement('atomic-commerce-search-box')
@withTailwindStyles
export class AtomicCommerceSearchBox
  extends InitializeBindingsMixin(LitElement)
  implements InitializableComponent<CommerceBindings>
{
  static styles: CSSResultGroup = [unsafeCSS(styles)];

  constructor() {
    super();
    this.addEventListener(
      'atomic/searchBoxSuggestion/register',
      (event: Event) => {
        const customEvent = event as CustomEvent<
          SearchBoxSuggestionsEvent<SearchBox | StandaloneSearchBox>
        >;
        if (!this.bindings) {
          this.searchBoxSuggestionEventsQueue.push(customEvent);
        } else {
          this.suggestionManager.registerSuggestionsFromEvent(
            customEvent,
            this.suggestionBindings
          );
        }
      }
    );
    this.addEventListener('atomic/selectChildProduct', (event: Event) => {
      const customEvent = event as CustomEvent<SelectChildProductEventArgs>;
      customEvent.stopPropagation();
      this.bindings.store.state.activeProductChild = customEvent.detail.child;
      this.suggestionManager.forceUpdate();
    });
  }

  @state()
  bindings!: CommerceBindings;
  @state() error!: Error;
  @state() isExpanded = false;

  private textAreaRef!: HTMLTextAreaElement;

  private searchBoxSuggestionEventsQueue: CustomEvent<
    SearchBoxSuggestionsEvent<SearchBox | StandaloneSearchBox>
  >[] = [];

  private suggestionManager!: SuggestionManager<
    SearchBox | StandaloneSearchBox
  >;

  public searchBox!: SearchBox | StandaloneSearchBox;
  @bindStateToController('searchBox')
  @state()
  private searchBoxState!: SearchBoxState | StandaloneSearchBoxState;

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
  @property({attribute: 'redirection-url', reflect: true})
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
  @property({type: Boolean, attribute: 'disable-search', reflect: true})
  public disableSearch = false;

  /**
   * The minimum query length required to enable search.
   * For example, to disable the search for empty queries, set this to `1`.
   */
  @property({type: Number, attribute: 'minimum-query-length', reflect: true})
  public minimumQueryLength = 0;

  /**
   * Whether to clear all active query filters when the end user submits a new query from the search box.
   * Setting this option to "false" is not recommended & can lead to an increasing number of queries returning no results.
   */
  @property({type: Boolean, attribute: 'clear-filters', reflect: true})
  public clearFilters = true;

  //TODO
  // @AriaLiveRegion('search-box')
  protected searchBoxAriaMessage!: string;

  //TODO
  // @AriaLiveRegion('search-suggestions', true)
  protected suggestionsAriaMessage!: string;
  public disconnectedCallback = () => {};

  private isStandaloneSearchBox(
    searchBox: SearchBox | StandaloneSearchBox
  ): searchBox is StandaloneSearchBox {
    return 'redirectTo' in searchBox;
  }

  public initialize() {
    this.id ||= randomID('atomic-commerce-search-box-');

    this.initializeSearchboxController();
    this.initializeSuggestionManager();
  }

  private updateRedirectionUrl() {
    if (this.isStandaloneSearchBox(this.searchBox) && this.redirectionUrl) {
      this.searchBox.updateRedirectUrl(this.redirectionUrl);
    } else {
      this.registerNewSearchBoxController();
    }
  }

  private registerNewSearchBoxController() {
    this.disconnectedCallback();
    this.initialize();
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

  private registerSearchboxSuggestionEvents() {
    this.searchBoxSuggestionEventsQueue.forEach((evt) => {
      this.suggestionManager.registerSuggestionsFromEvent(
        evt,
        this.suggestionBindings
      );
    });
    this.searchBoxSuggestionEventsQueue = [];
  }

  @watch('redirectionUrl')
  watchRedirectionUrl() {
    this.updateRedirectionUrl();
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

  private updateBreakpoints = once(() => updateBreakpoints(this));

  private async onInput(value: string) {
    this.updateQueryWithoutQuerySuggestionTrigger(value);

    if (this.isSearchDisabledForEndUser(value)) {
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
    if (this.isSearchDisabledForEndUser(this.searchBoxState.value)) {
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

  private onKeyDown(e: KeyboardEvent) {
    if (this.isSearchDisabledForEndUser(this.searchBoxState.value)) {
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
      case 'ArrowRight':
        if (
          this.suggestionManager.hasActiveDescendant ||
          !this.searchBox.state.value
        ) {
          e.preventDefault();
          this.suggestionManager.focusPanel('right');
          this.announceNewActiveSuggestionToScreenReader();
        }
        break;
      case 'ArrowLeft':
        if (
          this.suggestionManager.hasActiveDescendant ||
          !this.searchBox.state.value
        ) {
          e.preventDefault();
          this.suggestionManager.focusPanel('left');
          this.announceNewActiveSuggestionToScreenReader();
        }
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
    lastIndex: number,
    side: 'left' | 'right'
  ) {
    const id = `${this.id}-${side}-suggestion-${item.key}`;

    const isSelected = id === this.suggestionManager.activeDescendant;

    if (index === lastIndex && item.hideIfLast) {
      return null;
    }
    const isButton = item.onSelect || item.query;

    if (!isButton) {
      return html`${simpleSearchSuggestion({
        props: {
          i18n: this.bindings.i18n,
          id,
          suggestion: item,
          isSelected,
          side,
          index,
          lastIndex,
          isDoubleList: this.suggestionManager.isDoubleList,
        },
      })}`;
    }

    return html`${buttonSearchSuggestion({
      props: {
        i18n: this.bindings.i18n,
        id,
        suggestion: item,
        isSelected,
        side,
        index,
        lastIndex,
        isDoubleList: this.suggestionManager.isDoubleList,
        onClick: (e: Event) => {
          this.suggestionManager.onSuggestionClick(item, e);
          if (item.key === 'recent-query-clear') {
            return;
          }

          this.isExpanded = false;
          this.triggerTextAreaChange(item.query ?? '');
        },
        onMouseOver: () => {
          this.suggestionManager.onSuggestionMouseOver(item, side, id);
        },
      },
    })}`;
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

  private renderSuggestions() {
    if (!this.suggestionManager.hasSuggestions) {
      return null;
    }

    const part = `suggestions-wrapper ${
      this.suggestionManager.isDoubleList
        ? 'suggestions-double-list'
        : 'suggestions-single-list'
    }`;

    const isVisible =
      this.suggestionManager.hasSuggestions &&
      this.isExpanded &&
      !this.isSearchDisabledForEndUser(this.searchBoxState.value);

    const classes = {
      'bg-background': true,
      'border-neutral': true,
      absolute: true,
      'top-full': true,
      'left-0': true,
      'z-10': true,
      flex: true,
      'w-full': true,
      'rounded-md': true,
      border: true,
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
        (el) => (this.suggestionManager.leftPanel = el),
        () => this.suggestionManager.leftPanel
      )}
      ${this.renderPanel(
        'right',
        this.suggestionManager.rightSuggestionElements,
        (el) => (this.suggestionManager.rightPanel = el),
        () => this.suggestionManager.rightPanel
      )}
    </div>`;
  }
  private renderTextBox(searchLabel: string) {
    const props = {
      loading: this.searchBoxState.isLoading,
      i18n: this.bindings.i18n,
      value: this.searchBoxState.value,
      title: searchLabel,
      ariaLabel: searchLabel,
      onFocus: () => this.onFocus(),
      onInput: (e: Event) =>
        this.onInput((e.target as HTMLTextAreaElement).value),
      onKeyDown: (e: KeyboardEvent) => this.onKeyDown(e),
      onClear: () => {
        this.searchBox.clear();
        this.suggestionManager.clearSuggestions();
      },
      popup: {
        id: `${this.id}-popup`,
        activeDescendant: this.suggestionManager.activeDescendant,
        expanded: this.isExpanded,
        hasSuggestions: this.suggestionManager.hasSuggestions,
      },
    };

    return html`${searchBoxTextArea({
      props: {
        textAreaRef: this.textAreaRef,
        ref: (el) => {
          this.textAreaRef = el as HTMLTextAreaElement;
        },
        ...props,
        onClear: () => {
          props.onClear();
          this.triggerTextAreaChange('');
        },
      },
    })}`;
  }

  private renderAbsolutePositionSpacer() {
    //style 0.875 rem to replace py-3.5 that does not work.. Is there a better solution ?
    return html`<textarea
      aria-hidden="true"
      part="textarea-spacer"
      class="invisible w-full p-[5px] px-4 text-lg"
      style="padding-block: 0.875rem"
      rows="1"
    ></textarea>`;
  }

  private isSearchDisabledForEndUser(queryValue?: string) {
    if (isNullOrUndefined(queryValue)) {
      return this.disableSearch;
    }

    if (queryValue.trim().length < this.minimumQueryLength) {
      return true;
    }

    return this.disableSearch;
  }

  private getSearchInputLabel(minimumQueryLength = 0) {
    if (this.isSearchDisabledForEndUser(this.searchBoxState.value)) {
      return this.bindings.i18n.t('search-disabled', {
        length: minimumQueryLength,
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

  private announceNewActiveSuggestionToScreenReader() {
    const ariaLabel = this.suggestionManager.activeDescendantElement?.ariaLabel;
    if (isMacOS() && ariaLabel) {
      this.suggestionsAriaMessage = ariaLabel;
    }
  }

  private announceNewSuggestionsToScreenReader() {
    const elsLength =
      this.suggestionManager.allSuggestionElements.filter(
        elementHasQuery
      ).length;
    this.searchBoxAriaMessage = elsLength
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

  @bindingGuard()
  @errorGuard()
  render() {
    this.updateBreakpoints();

    const searchLabel = this.getSearchInputLabel(this.minimumQueryLength);
    const isDisabled = this.isSearchDisabledForEndUser(
      this.searchBoxState.value
    );
    if (!this.suggestionManager.suggestions.length) {
      this.registerSearchboxSuggestionEvents();
    }

    return html`
      ${this.renderAbsolutePositionSpacer()}
      ${wrapper({
        props: {
          disabled: isDisabled,
          onFocusout: (event) => {
            if (!isFocusingOut(event)) {
              return;
            }
            this.suggestionManager.clearSuggestions();
            this.isExpanded = false;
          },
        },
      })(
        html`${this.renderTextBox(searchLabel)}
        ${submitButton({
          props: {
            i18n: this.bindings.i18n,
            disabled: isDisabled,
            onClick: () => {
              this.searchBox.submit();
              this.suggestionManager.clearSuggestions();
            },
            title: searchLabel,
          },
        })}
        ${this.renderSuggestions()}`
      )}
      ${this.suggestionManager.suggestions.length === 0
        ? html`
            <slot>
              <atomic-commerce-search-box-recent-queries></atomic-commerce-search-box-recent-queries>
              <atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>
            </slot>
          `
        : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-search-box': AtomicCommerceSearchBox;
  }
}

import {isNullOrUndefined} from '@coveo/bueno';
import {
  SearchBox,
  SearchBoxState,
  buildSearchBox,
  StandaloneSearchBox,
  StandaloneSearchBoxState,
  buildStandaloneSearchBox,
  SearchBoxOptions,
} from '@coveo/headless';
import {
  Component,
  h,
  State,
  Prop,
  Listen,
  Watch,
  Element,
  Event,
  EventEmitter,
  Host,
} from '@stencil/core';
import {AriaLiveRegion} from '../../../utils/accessibility-utils';
import {hasKeyboard, isMacOS} from '../../../utils/device-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {
  SafeStorage,
  StandaloneSearchBoxData,
  StorageItems,
} from '../../../utils/local-storage-utils';
import {updateBreakpoints} from '../../../utils/replace-breakpoint';
import {once, randomID} from '../../../utils/utils';
import {SearchBoxWrapper} from '../../common/search-box/search-box-wrapper';
import {SearchInput} from '../../common/search-box/search-input';
import {SearchTextArea} from '../../common/search-box/search-text-area';
import {SubmitButton} from '../../common/search-box/submit-button';
import {TextAreaSubmitButton} from '../../common/search-box/text-area-submit-button';
import {SuggestionManager} from '../../common/suggestions/suggestion-manager';
import {
  SearchBoxSuggestionElement,
  SearchBoxSuggestionsBindings,
  SearchBoxSuggestionsEvent,
  elementHasQuery,
} from '../../common/suggestions/suggestions-common';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';
import {RedirectionPayload} from './redirection-payload';
import {
  ButtonSearchSuggestion,
  SimpleSearchSuggestion,
} from './search-suggestion';

/**
 * The `atomic-search-box` component creates a search box with built-in support for suggestions.
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
 * @part query-suggestion-item - A suggestion from the `atomic-search-box-query-suggestions` component.
 * @part query-suggestion-content - The contents of a suggestion from the `atomic-search-box-query-suggestions` component.
 * @part query-suggestion-icon - The icon of a suggestion from the `atomic-search-box-query-suggestions` component.
 * @part query-suggestion-text - The text of a suggestion from the `atomic-search-box-query-suggestions` component.
 *
 * @part recent-query-item - A suggestion from the `atomic-search-box-recent-queries` component.
 * @part recent-query-content - The contents of a suggestion from the `atomic-search-box-recent-queries` component.
 * @part recent-query-icon - The icon of a suggestion from the `atomic-search-box-recent-queries` component.
 * @part recent-query-text - The text of a suggestion from the `atomic-search-box-recent-queries` component.
 * @part recent-query-text-highlight - The highlighted portion of the text of a suggestion from the `atomic-search-box-recent-queries` component.
 * @part recent-query-title-item - The clear button above suggestions from the `atomic-search-box-recent-queries` component.
 * @part recent-query-title-content - The contents of the clear button above suggestions from the `atomic-search-box-recent-queries` component.
 * @part recent-query-title - The "recent searches" text of the clear button above suggestions from the `atomic-search-box-recent-queries` component.
 * @part recent-query-clear - The "clear" text of the clear button above suggestions from the `atomic-search-box-recent-queries` component.
 *
 * @part instant-results-item - An instant result rendered by an `atomic-search-box-instant-results` component.
 * @part instant-results-show-all - The clickable suggestion to show all items for the current instant results search rendered by an `atomic-search-box-instant-results` component.
 * @part instant-results-show-all-button - The button inside the clickable suggestion from the `atomic-search-box-instant-results` component.
 */
@Component({
  tag: 'atomic-search-box',
  styleUrl: 'atomic-search-box.pcss',
  shadow: true,
})
export class AtomicSearchBox implements InitializableComponent<Bindings> {
  @InitializeBindings() public bindings!: Bindings;
  private searchBox!: SearchBox | StandaloneSearchBox;
  private searchBoxSuggestionEventsQueue: CustomEvent<
    SearchBoxSuggestionsEvent<SearchBox | StandaloneSearchBox>
  >[] = [];
  private id!: string;
  private inputRef!: HTMLInputElement;
  private textAreaRef!: HTMLTextAreaElement;
  private suggestionManager!: SuggestionManager<
    SearchBox | StandaloneSearchBox
  >;

  @Element() private host!: HTMLElement;

  @BindStateToController('searchBox')
  @State()
  private searchBoxState!: SearchBoxState | StandaloneSearchBoxState;
  @State() public error!: Error;
  @State() private isExpanded = false;

  /**
   * The amount of queries displayed when the user interacts with the search box.
   * By default, a mix of query suggestions and recent queries will be shown.
   * You can configure those settings using the following components as children:
   *  - atomic-search-box-query-suggestions
   *  - atomic-search-box-recent-queries
   */
  @Prop({reflect: true}) public numberOfQueries = 8;

  /**
   * Defining this option makes the search box standalone (see [Use a
   * Standalone Search Box](https://docs.coveo.com/en/atomic/latest/usage/ssb/)).
   *
   * This option defines the default URL the user should be redirected to, when a query is submitted.
   * If a query pipeline redirect is triggered, it will redirect to that URL instead
   * (see [query pipeline triggers](https://docs.coveo.com/en/1458)).
   */
  @Prop({reflect: true}) public redirectionUrl?: string;

  /**
   * The timeout for suggestion queries, in milliseconds.
   * If a suggestion query times out, the suggestions from that particular query won't be shown.
   */
  @Prop() public suggestionTimeout = 400;

  /**
   * The delay for suggestion queries on input, in milliseconds.
   *
   * The suggestion request will be delayed until the end user stops typing for at least the specified amount of time.
   *
   * This delay is used to avoid sending too many requests to the Coveo Platform when the user is typing, as well as reducing potential input lag on low end devices.
   * A higher delay will reduce input lag, at the cost of suggestions freshness.
   */
  @Prop() public suggestionDelay = 0;

  /**
   * Whether to prevent the user from triggering searches and query suggestions from the component.
   * Perfect for use cases where you need to disable the search conditionally.
   * For the specific case when you need to disable the search based on the length of the query, refer to {@link minimumQueryLength}.
   */
  @Prop({reflect: true}) public disableSearch = false;

  /**
   * The minimum query length required to enable search.
   * For example, to disable the search for empty queries, set this to `1`.
   */
  @Prop({reflect: true}) public minimumQueryLength = 0;

  /**
   * Whether to clear all active query filters when the end user submits a new query from the search box.
   * Setting this option to "false" is not recommended & can lead to an increasing number of queries returning no results.
   */
  @Prop({reflect: true}) public clearFilters = true;

  /**
   * Whether to interpret advanced [Coveo Cloud query syntax](https://docs.coveo.com/en/1814/) in the query.
   * You should only enable query syntax in the search box if you have good reasons to do so, as it
   * requires end users to be familiar with Coveo Cloud query syntax, otherwise they will likely be surprised
   * by the search box behaviour.
   *
   * When the `redirection-url` property is set and redirects to a page with more `atomic-search-box` components, all `atomic-search-box` components need to have the same `enable-query-syntax` value.
   */
  @Prop({reflect: true}) public enableQuerySyntax = false;

  /**
   * Whether to render the search box using a [textarea](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea) element.
   * The resulting component will expand to support multi-line queries.
   * When customizing the dimensions of the textarea element using the `"textarea"` CSS part, it is important to also apply the styling to its container's ::after pseudo-element as well as the `"textarea-spacer"` part.
   * The buttons within the search box are likely to need adjusting as well.
   *
   * Example:
   * ```css
   * <style>
   *   atomic-search-box::part(textarea),
   *   atomic-search-box::part(textarea-expander)::after,
   *   atomic-search-box::part(textarea-spacer) {
   *     font-size: x-large;
   *   }
   *
   *   atomic-search-box::part(submit-button-wrapper),
   *   atomic-search-box::part(clear-button-wrapper) {
   *     padding-top: 0.75rem;
   *   }
   * </style>
   * ```
   *
   * NB: The textarea functionality will be enforced on the next major version of Atomic (3.0.0)
   */
  @Prop({reflect: true}) public textarea = false;

  /**
   * Event that is emitted when a standalone search box redirection is triggered. By default, the search box will directly change the URL and redirect accordingly, so if you want to handle the redirection differently, use this event.
   *
   * Example:
   * ```html
   * <script>
   *   document.querySelector('atomic-search-box').addEventListener((e) => {
   *     e.preventDefault();
   *     // handle redirection
   *   });
   * </script>
   * ...
   * <atomic-search-box redirection-url="/search"></atomic-search-box>
   * ```
   */
  @Event({
    eventName: 'redirect',
  })
  public redirect!: EventEmitter<RedirectionPayload>;

  @AriaLiveRegion('search-box')
  protected searchBoxAriaMessage!: string;

  @AriaLiveRegion('search-suggestions', true)
  protected suggestionsAriaMessage!: string;

  public initialize() {
    this.id = randomID('atomic-search-box-');

    if (!this.textarea) {
      this.bindings.engine.logger.warn(
        'As of Atomic version 3.0.0, the searchbox will be enabled as a text area by default. To remove this warning, set textarea="true" on the search box.',
        this.host
      );
    }

    this.searchBox = this.redirectionUrl
      ? buildStandaloneSearchBox(this.bindings.engine, {
          options: {
            ...this.searchBoxOptions,
            redirectionUrl: this.redirectionUrl,
          },
        })
      : buildSearchBox(this.bindings.engine, {
          options: this.searchBoxOptions,
        });

    this.initializeSuggestionManager();
  }

  public componentWillUpdate() {
    if (
      !('redirectTo' in this.searchBoxState) ||
      !('afterRedirection' in this.searchBox)
    ) {
      return;
    }

    const {redirectTo, value, analytics} = this.searchBoxState;

    if (redirectTo === '') {
      return;
    }
    const data: StandaloneSearchBoxData = {
      value,
      enableQuerySyntax: this.enableQuerySyntax,
      analytics,
    };
    const storage = new SafeStorage();
    storage.setJSON(StorageItems.STANDALONE_SEARCH_BOX_DATA, data);

    this.searchBox.afterRedirection();
    const event = this.redirect.emit({redirectTo, value});
    if (!event.defaultPrevented) {
      window.location.href = redirectTo;
    }
  }

  @Listen('atomic/searchBoxSuggestion/register')
  public registerSuggestions(
    event: CustomEvent<
      SearchBoxSuggestionsEvent<SearchBox | StandaloneSearchBox>
    >
  ) {
    if (!this.bindings) {
      this.searchBoxSuggestionEventsQueue.push(event);
    } else {
      this.suggestionManager.registerSuggestionsFromEvent(
        event,
        this.suggestionBindings
      );
    }
  }

  public componentWillRender() {
    this.searchBoxSuggestionEventsQueue.forEach((evt) => {
      this.suggestionManager.registerSuggestionsFromEvent(
        evt,
        this.suggestionBindings
      );
    });
    this.searchBoxSuggestionEventsQueue = [];
  }

  @Watch('redirectionUrl')
  watchRedirectionUrl() {
    this.initialize();
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
      getHost: () => this.host,
      getLogger: () => this.bindings.engine.logger,
    });
    this.suggestionManager.initializeSuggestions(this.suggestionBindings);
  }

  private get suggestionBindings(): SearchBoxSuggestionsBindings<
    SearchBox | StandaloneSearchBox
  > {
    return {
      ...this.bindings,
      ...this.suggestionManager.partialSuggestionBindings,
      ...this.partialSuggestionBindings,
    };
  }

  private get partialSuggestionBindings(): Pick<
    SearchBoxSuggestionsBindings<SearchBox | StandaloneSearchBox>,
    | 'id'
    | 'isStandalone'
    | 'searchBoxController'
    | 'numberOfQueries'
    | 'clearFilters'
  > {
    return {
      ...this.bindings,
      id: this.id,
      isStandalone: !!this.redirectionUrl,
      searchBoxController: this.searchBox,
      numberOfQueries: this.numberOfQueries,
      clearFilters: this.clearFilters,
    };
  }

  private get searchBoxOptions(): SearchBoxOptions {
    return {
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
      clearFilters: this.clearFilters,
      enableQuerySyntax: this.enableQuerySyntax,
    };
  }

  private updateBreakpoints = once(() => updateBreakpoints(this.host));

  private async onInput(value: string) {
    this.searchBox.updateText(value);

    if (this.isSearchDisabledForEndUser(value)) {
      this.suggestionManager.clearSuggestions();
      return;
    }
    this.isExpanded = true;
    await this.suggestionManager.triggerSuggestions();
    this.announceNewSuggestionsToScreenReader();
  }

  private async onFocus() {
    this.isExpanded = true;
    await this.suggestionManager.triggerSuggestions();
    this.announceNewSuggestionsToScreenReader();
  }

  private onSubmit() {
    this.isExpanded = false;

    if (this.suggestionManager.hasActiveDescendant) {
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
      return (
        <SimpleSearchSuggestion
          bindings={this.bindings}
          id={id}
          suggestion={item}
          isSelected={isSelected}
          side={side}
          index={index}
          lastIndex={lastIndex}
          isDoubleList={this.suggestionManager.isDoubleList}
        ></SimpleSearchSuggestion>
      );
    }

    return (
      <ButtonSearchSuggestion
        bindings={this.bindings}
        id={id}
        suggestion={item}
        isSelected={isSelected}
        side={side}
        index={index}
        lastIndex={lastIndex}
        isDoubleList={this.suggestionManager.isDoubleList}
        onClick={(e: Event) => {
          this.suggestionManager.onSuggestionClick(item, e);
          this.isExpanded = false;
          if (this.textarea) {
            this.triggerTextAreaChange(item.query ?? '');
          }
        }}
        onMouseOver={() => {
          this.suggestionManager.onSuggestionMouseOver(item, side, id);
        }}
      ></ButtonSearchSuggestion>
    );
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

    return (
      <div
        part={`suggestions suggestions-${side}`}
        ref={setRef}
        class="flex flex-grow basis-1/2 flex-col"
        onMouseDown={(e) => {
          if (e.target === getRef()) {
            e.preventDefault();
          }
        }}
      >
        {elements.map((suggestion, index) =>
          this.renderSuggestion(suggestion, index, elements.length - 1, side)
        )}
      </div>
    );
  }

  private get shouldShowSuggestions() {
    return (
      this.suggestionManager.hasSuggestions &&
      this.isExpanded &&
      !this.isSearchDisabledForEndUser(this.searchBoxState.value)
    );
  }

  private renderSuggestions() {
    return (
      <div
        id={`${this.id}-popup`}
        part={`suggestions-wrapper ${
          this.suggestionManager.isDoubleList
            ? 'suggestions-double-list'
            : 'suggestions-single-list'
        }`}
        class={`flex w-full z-10 absolute left-0 top-full rounded-md bg-background border border-neutral ${
          this.shouldShowSuggestions ? '' : 'hidden'
        }`}
        role="application"
        aria-label={this.bindings.i18n.t(
          this.suggestionManager.isDoubleList
            ? 'search-suggestions-double-list'
            : 'search-suggestions-single-list'
        )}
        {...(this.suggestionManager.activeDescendant && {
          'aria-activedescendant': this.suggestionManager.activeDescendant,
        })}
      >
        {this.renderPanel(
          'left',
          this.suggestionManager.leftSuggestionElements,
          (el) => (this.suggestionManager.leftPanel = el),
          () => this.suggestionManager.leftPanel
        )}
        {this.renderPanel(
          'right',
          this.suggestionManager.rightSuggestionElements,
          (el) => (this.suggestionManager.rightPanel = el),
          () => this.suggestionManager.rightPanel
        )}
      </div>
    );
  }

  private renderTextBox = (searchLabel: string) => {
    const props = {
      loading: this.searchBoxState.isLoading,
      bindings: this.bindings,
      value: this.searchBoxState.value,
      title: searchLabel,
      ariaLabel: searchLabel,
      onFocus: () => this.onFocus(),
      onInput: (e: Event) =>
        this.onInput(
          (e.target as HTMLInputElement | HTMLTextAreaElement).value
        ),
      onKeyDown: (e: KeyboardEvent) => this.onKeyDown(e),
      onClear: () => this.searchBox.clear(),
      popup: {
        id: `${this.id}-popup`,
        activeDescendant: this.suggestionManager.activeDescendant,
        expanded: this.isExpanded,
        hasSuggestions: this.suggestionManager.hasSuggestions,
      },
    };

    return this.textarea ? (
      <SearchTextArea
        textAreaRef={this.textAreaRef}
        ref={(el) => (this.textAreaRef = el as HTMLTextAreaElement)}
        {...props}
        onClear={() => {
          props.onClear();
          this.triggerTextAreaChange('');
        }}
      />
    ) : (
      <SearchInput
        inputRef={this.inputRef}
        ref={(el) => (this.inputRef = el as HTMLInputElement)}
        {...props}
      />
    );
  };

  private renderAbsolutePositionSpacer() {
    return (
      <textarea
        aria-hidden
        part="textarea-spacer"
        class="invisible text-lg py-3.5 px-4 w-full"
        rows={1}
      ></textarea>
    );
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
      ? this.bindings.i18n.t('query-suggestions-available', {
          count: elsLength,
        })
      : this.bindings.i18n.t('query-suggestions-unavailable');
  }

  public render() {
    this.updateBreakpoints();

    const searchLabel = this.getSearchInputLabel(this.minimumQueryLength);
    const Submit = this.textarea ? TextAreaSubmitButton : SubmitButton;
    const isDisabled = this.isSearchDisabledForEndUser(
      this.searchBoxState.value
    );

    return (
      <Host>
        {this.textarea ? this.renderAbsolutePositionSpacer() : null}
        {[
          <SearchBoxWrapper disabled={isDisabled} textArea={this.textarea}>
            <atomic-focus-detector
              style={{display: 'contents'}}
              onFocusExit={() => this.suggestionManager.clearSuggestions()}
            >
              {this.renderTextBox(searchLabel)}
              <Submit
                bindings={this.bindings}
                disabled={isDisabled}
                onClick={() => {
                  this.searchBox.submit();
                  this.suggestionManager.clearSuggestions();
                }}
                title={searchLabel}
              />
              {this.renderSuggestions()}
            </atomic-focus-detector>
          </SearchBoxWrapper>,
          !this.suggestionManager.suggestions.length && (
            <slot>
              <atomic-search-box-recent-queries></atomic-search-box-recent-queries>
              <atomic-search-box-query-suggestions></atomic-search-box-query-suggestions>
            </slot>
          ),
        ]}
      </Host>
    );
  }
}

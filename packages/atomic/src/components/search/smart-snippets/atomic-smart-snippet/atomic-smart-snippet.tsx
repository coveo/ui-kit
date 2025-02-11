import {
  buildSmartSnippet,
  buildTabManager,
  InlineLink,
  SmartSnippet,
  SmartSnippetState,
  TabManager,
  TabManagerState,
} from '@coveo/headless';
import {Component, Prop, State, Element, Listen, h} from '@stencil/core';
import {
  InitializableComponent,
  InitializeBindings,
  BindStateToController,
} from '../../../../utils/initialization-utils';
import {ArrayProp} from '../../../../utils/props-utils';
import {shouldDisplayOnCurrentTab} from '../../../../utils/tab-utils';
import {randomID} from '../../../../utils/utils';
import {createAppLoadedListener} from '../../../common/interface/store';
import {getAttributesFromLinkSlot} from '../../../common/item-link/attributes-slot';
import {SmartSnippetCommon} from '../../../common/smart-snippets/atomic-smart-snippet/smart-snippet-common';
import {Hidden} from '../../../common/stencil-hidden';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-smart-snippet` component displays the excerpt of a document that would be most likely to answer a particular query.
 *
 * You can style the snippet by inserting a template element as follows:
 * ```html
 * <atomic-smart-snippet>
 *   <template>
 *     <style>
 *       b {
 *         color: blue;
 *       }
 *     </style>
 *   </template>
 * </atomic-smart-snippet>
 * ```
 *
 * @slot source-anchor-attributes - Lets you pass [attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attributes) down to anchor elements, overriding other attributes.
 * To be used exclusively in anchor elements, such as: `<a slot="source-anchor-attributes" target="_blank"></a>`.
 *
 * @part smart-snippet - The wrapper of the entire smart snippet.
 * @part question - The header displaying the question that is answered by the found document excerpt.
 * @part answer - The container displaying the full document excerpt.
 * @part truncated-answer - The container displaying only part of the answer.
 * @part show-more-button - The show more button.
 * @part show-less-button - The show less button.
 * @part body - The body of the smart snippet, containing the truncated answer and the show more or show less button.
 * @part footer - The footer underneath the answer.
 * @part source-url - The URL to the document the excerpt is from.
 * @part source-title - The title of the document the excerpt is from.
 * @part feedback-banner - The feedback banner underneath the source.
 * @part feedback-inquiry-and-buttons - A wrapper around the feedback inquiry and the feedback buttons.
 * @part feedback-inquiry - The message asking the end user to provide feedback on whether the excerpt was useful.
 * @part feedback-buttons - The wrapper around the buttons after the inquiry.
 * @part feedback-like-button - The button allowing the end user to signal that the excerpt was useful.
 * @part feedback-dislike-button - The button allowing the end user to signal that the excerpt wasn't useful.
 * @part feedback-thank-you-container - The wrapper around the 'thank you' message and feedback button.
 * @part feedback-thank-you - The message thanking the end user for providing feedback.
 * @part feedback-explain-why-button - The button a user can press to provide detailed feedback.
 */
@Component({
  tag: 'atomic-smart-snippet',
  styleUrl: 'atomic-smart-snippet.pcss',
  shadow: true,
})
export class AtomicSmartSnippet implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public smartSnippet!: SmartSnippet;
  @BindStateToController('smartSnippet')
  @State()
  public smartSnippetState!: SmartSnippetState;
  public tabManager!: TabManager;
  @BindStateToController('tabManager')
  @State()
  public tabManagerState!: TabManagerState;
  public error!: Error;
  @State() private isAppLoaded = false;

  @Element() public host!: HTMLElement;
  private id = randomID();
  private modalRef?: HTMLAtomicSmartSnippetFeedbackModalElement;

  private smartSnippetCommon!: SmartSnippetCommon;

  /**
   * The [heading level](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements) to use for the question at the top of the snippet, from 1 to 5.
   */
  @Prop({reflect: true}) public headingLevel = 0;

  /**
   * The maximum height (in pixels) a snippet can have before the component truncates it and displays a "show more" button.
   */
  @Prop({reflect: true}) maximumHeight = 250;
  /**
   * When the answer is partly hidden, how much of its height (in pixels) should be visible.
   */
  @Prop({reflect: true}) collapsedHeight = 180;

  /**
   * Sets the style of the snippet.
   *
   * Example:
   * ```ts
   * smartSnippet.snippetStyle = `
   *   b {
   *     color: blue;
   *   }
   * `;
   * ```
   */
  @Prop({reflect: true}) snippetStyle?: string;

  /**
   * The tabs on which the smart snippet can be displayed. This property should not be used at the same time as `tabs-excluded`.
   *
   * Set this property as a stringified JSON array, e.g.,
   * ```html
   *  <atomic-smart-snippet tabs-included='["tabIDA", "tabIDB"]'></atomic-smart-snippet snippet>
   * ```
   * If you don't set this property, the smart snippet can be displayed on any tab. Otherwise, the smart snippet can only be displayed on the specified tabs.
   */
  @ArrayProp()
  @Prop({reflect: true, mutable: true})
  public tabsIncluded: string[] | string = '[]';

  /**
   * The tabs on which this smart snippet must not be displayed. This property should not be used at the same time as `tabs-included`.
   *
   * Set this property as a stringified JSON array, e.g.,
   * ```html
   *  <atomic-smart-snippet tabs-excluded='["tabIDA", "tabIDB"]'></atomic-smart-snippet>
   * ```
   * If you don't set this property, the smart snippet can be displayed on any tab. Otherwise, the smart snippet won't be displayed on any of the specified tabs.
   */
  @ArrayProp()
  @Prop({reflect: true, mutable: true})
  public tabsExcluded: string[] | string = '[]';

  @State() feedbackSent = false;

  @Prop({reflect: true}) public snippetMaximumHeight?: number;

  @Prop({reflect: true}) public snippetCollapsedHeight?: number;

  @Listen('selectInlineLink')
  onSelectInlineLink(event: CustomEvent<InlineLink>) {
    this.smartSnippet.selectInlineLink(event.detail);
  }

  @Listen('beginDelayedSelectInlineLink')
  onBeginDelayedSelectInlineLink(event: CustomEvent<InlineLink>) {
    this.smartSnippet.beginDelayedSelectInlineLink(event.detail);
  }

  @Listen('cancelPendingSelectInlineLink')
  onCancelPendingSelectInlineLink(event: CustomEvent<InlineLink>) {
    this.smartSnippet.cancelPendingSelectInlineLink(event.detail);
  }

  public initialize() {
    this.smartSnippet = buildSmartSnippet(this.bindings.engine);
    this.smartSnippetCommon = new SmartSnippetCommon({
      id: this.id,
      modalTagName: 'atomic-smart-snippet-feedback-modal',
      getSourceAnchorAttributes: () =>
        getAttributesFromLinkSlot(this.host, 'source-anchor-attributes'),
      getHost: () => this.host,
      getBindings: () => this.bindings,
      getModalRef: () => this.modalRef,
      getHeadingLevel: () => this.headingLevel,
      getCollapsedHeight: () => this.collapsedHeight,
      getMaximumHeight: () => this.maximumHeight,
      getSmartSnippetState: () => this.smartSnippetState,
      getSmartSnippet: () => this.smartSnippet,
      getSnippetStyle: () => this.snippetStyle,
      getFeedbackSent: () => this.feedbackSent,
      getSnippetMaximumHeight: this.snippetMaximumHeight
        ? () => this.snippetMaximumHeight!
        : undefined,
      getSnippetCollapsedHeight: this.snippetCollapsedHeight
        ? () => this.snippetCollapsedHeight!
        : undefined,
      setModalRef: this.setModalRef.bind(this),
      setFeedbackSent: this.setFeedbackSent.bind(this),
    });
    this.bindings.store.waitUntilAppLoaded(() =>
      this.smartSnippetCommon.hideDuringRender(false)
    );
    this.tabManager = buildTabManager(this.bindings.engine);
    createAppLoadedListener(this.bindings.store, (isAppLoaded) => {
      this.isAppLoaded = isAppLoaded;
    });
  }

  private setModalRef(ref: HTMLElement) {
    this.modalRef = ref as HTMLAtomicSmartSnippetFeedbackModalElement;
  }

  private setFeedbackSent(isSent: boolean) {
    this.feedbackSent = isSent;
  }

  public componentWillUpdate() {
    if (!(this.smartSnippetState.liked || this.smartSnippetState.disliked)) {
      this.setFeedbackSent(false);
    }
  }

  public componentDidRender() {
    if (this.isAppLoaded) {
      this.smartSnippetCommon.hideDuringRender(false);
    }
  }

  public render() {
    if (
      !shouldDisplayOnCurrentTab(
        [...this.tabsIncluded],
        [...this.tabsExcluded],
        this.tabManagerState?.activeTab
      )
    ) {
      return <Hidden></Hidden>;
    }
    return this.smartSnippetCommon.render();
  }
}

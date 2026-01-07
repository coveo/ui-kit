import {
  buildSmartSnippet,
  buildTabManager,
  type InlineLink,
  type SmartSnippet,
  type SmartSnippetState,
  type TabManager,
  type TabManagerState,
} from '@coveo/headless';
import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import '@/src/components/common/atomic-icon/atomic-icon';
import '@/src/components/common/atomic-smart-snippet-collapse-wrapper/atomic-smart-snippet-collapse-wrapper';
import '@/src/components/common/atomic-smart-snippet-expandable-answer/atomic-smart-snippet-expandable-answer';
import {getAttributesFromLinkSlotContent} from '@/src/components/common/item-link/attributes-slot';
import {renderSnippetFooter} from '@/src/components/common/smart-snippets/atomic-smart-snippet/snippet-footer';
import {renderSnippetQuestion} from '@/src/components/common/smart-snippets/atomic-smart-snippet/snippet-question';
import {renderSnippetTruncatedAnswer} from '@/src/components/common/smart-snippets/atomic-smart-snippet/snippet-truncated-answer';
import {renderSnippetWrapper} from '@/src/components/common/smart-snippets/atomic-smart-snippet/snippet-wrapper';
import {renderSmartSnippetFeedbackBanner} from '@/src/components/common/smart-snippets/smart-snippet-feedback-banner';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces';
import {arrayConverter} from '@/src/converters/array-converter';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {shouldDisplayOnCurrentTab} from '@/src/utils/tab-utils';
import {randomID} from '@/src/utils/utils';
import styles from './atomic-smart-snippet.tw.css';

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
@customElement('atomic-smart-snippet')
@bindings()
@withTailwindStyles
export class AtomicSmartSnippet
  extends LitElement
  implements InitializableComponent<Bindings>
{
  static styles = styles;

  @state() public bindings!: Bindings;
  @state() public error!: Error;

  @bindStateToController('smartSnippet')
  @state()
  public smartSnippetState!: SmartSnippetState;
  public smartSnippet!: SmartSnippet;

  @bindStateToController('tabManager')
  @state()
  public tabManagerState!: TabManagerState;
  public tabManager!: TabManager;

  @state() public feedbackSent = false;

  #id!: string;
  private modalRef?: HTMLAtomicSmartSnippetFeedbackModalElement;

  /**
   * The [heading level](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements) to use for the question at the top of the snippet, from 1 to 5.
   */
  @property({type: Number, reflect: true, attribute: 'heading-level'})
  headingLevel = 0;

  /**
   * The maximum height (in pixels) a snippet can have before the component truncates it and displays a "show more" button.
   */
  @property({type: Number, reflect: true, attribute: 'maximum-height'})
  maximumHeight = 250;

  /**
   * When the answer is partly hidden, how much of its height (in pixels) should be visible.
   */
  @property({type: Number, reflect: true, attribute: 'collapsed-height'})
  collapsedHeight = 180;

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
  @property({type: String, reflect: true, attribute: 'snippet-style'})
  snippetStyle?: string;

  /**
   * The tabs on which the smart snippet can be displayed. This property should not be used at the same time as `tabs-excluded`.
   *
   * Set this property as a stringified JSON array, for example:
   * ```html
   *  <atomic-smart-snippet tabs-included='["tabIDA", "tabIDB"]'></atomic-smart-snippet>
   * ```
   * If you don't set this property, the smart snippet can be displayed on any tab. Otherwise, the smart snippet can only be displayed on the specified tabs.
   */
  @property({
    type: Array,
    attribute: 'tabs-included',
    converter: arrayConverter,
  })
  tabsIncluded: string[] = [];

  /**
   * The tabs on which this smart snippet must not be displayed. This property should not be used at the same time as `tabs-included`.
   *
   * Set this property as a stringified JSON array, for example:
   * ```html
   *  <atomic-smart-snippet tabs-excluded='["tabIDA", "tabIDB"]'></atomic-smart-snippet>
   * ```
   * If you don't set this property, the smart snippet can be displayed on any tab. Otherwise, the smart snippet won't be displayed on any of the specified tabs.
   */
  @property({
    type: Array,
    attribute: 'tabs-excluded',
    converter: arrayConverter,
  })
  tabsExcluded: string[] = [];

  /**
   * The maximum height (in pixels) for the snippet when using the collapse wrapper.
   */
  @property({
    type: Number,
    reflect: true,
    attribute: 'snippet-maximum-height',
  })
  snippetMaximumHeight?: number;

  /**
   * The collapsed height (in pixels) for the snippet when using the collapse wrapper.
   */
  @property({
    type: Number,
    reflect: true,
    attribute: 'snippet-collapsed-height',
  })
  snippetCollapsedHeight?: number;

  connectedCallback(): void {
    super.connectedCallback();
    this.#id ||= randomID();
    this.addEventListener(
      'selectInlineLink',
      this.onSelectInlineLink as EventListener
    );
    this.addEventListener(
      'beginDelayedSelectInlineLink',
      this.onBeginDelayedSelectInlineLink as EventListener
    );
    this.addEventListener(
      'cancelPendingSelectInlineLink',
      this.onCancelPendingSelectInlineLink as EventListener
    );
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener(
      'selectInlineLink',
      this.onSelectInlineLink as EventListener
    );
    this.removeEventListener(
      'beginDelayedSelectInlineLink',
      this.onBeginDelayedSelectInlineLink as EventListener
    );
    this.removeEventListener(
      'cancelPendingSelectInlineLink',
      this.onCancelPendingSelectInlineLink as EventListener
    );
  }

  public initialize() {
    this.smartSnippet = buildSmartSnippet(this.bindings.engine);
    this.tabManager = buildTabManager(this.bindings.engine);
  }

  willUpdate() {
    if (
      this.smartSnippetState &&
      !(this.smartSnippetState.liked || this.smartSnippetState.disliked)
    ) {
      this.setFeedbackSent(false);
    }
  }

  private onSelectInlineLink(event: CustomEvent<InlineLink>) {
    this.smartSnippet.selectInlineLink(event.detail);
  }

  private onBeginDelayedSelectInlineLink(event: CustomEvent<InlineLink>) {
    this.smartSnippet.beginDelayedSelectInlineLink(event.detail);
  }

  private onCancelPendingSelectInlineLink(event: CustomEvent<InlineLink>) {
    this.smartSnippet.cancelPendingSelectInlineLink(event.detail);
  }

  private setModalRef(ref: HTMLElement) {
    this.modalRef = ref as HTMLAtomicSmartSnippetFeedbackModalElement;
  }

  private setFeedbackSent(isSent: boolean) {
    this.feedbackSent = isSent;
  }

  private get computedStyle() {
    const styleTag =
      this.querySelector('template')?.content.querySelector('style');
    if (!styleTag) {
      return this.snippetStyle;
    }
    return styleTag.innerHTML;
  }

  private loadModal() {
    if (this.modalRef) {
      return;
    }
    const modalRef = document.createElement(
      'atomic-smart-snippet-feedback-modal'
    );
    modalRef.addEventListener('feedbackSent', () => {
      this.setFeedbackSent(true);
    });
    this.setModalRef(modalRef);
    this.insertAdjacentElement('beforebegin', modalRef);
  }

  @bindingGuard()
  @errorGuard()
  render() {
    const shouldDisplay =
      shouldDisplayOnCurrentTab(
        this.tabsIncluded,
        this.tabsExcluded,
        this.tabManagerState?.activeTab
      ) && this.smartSnippetState.answerFound;

    this.classList.toggle('atomic-hidden', !shouldDisplay);
    return html`${when(shouldDisplay, () => this.renderContent())}`;
  }

  private renderContent() {
    const source = this.smartSnippetState.source;

    return renderSnippetWrapper({
      props: {
        headingLevel: this.headingLevel,
        i18n: this.bindings.i18n,
      },
    })(html`
      <atomic-smart-snippet-collapse-wrapper
        .collapsedHeight=${this.snippetCollapsedHeight}
        .maximumHeight=${this.snippetMaximumHeight}
      >
        ${renderSnippetQuestion({
          props: {
            headingLevel: this.headingLevel,
            question: this.smartSnippetState.question,
          },
        })}
        ${when(
          this.snippetMaximumHeight !== undefined,
          () =>
            renderSnippetTruncatedAnswer({
              props: {
                answer: this.smartSnippetState.answer,
                style: this.computedStyle,
              },
            }),
          () => html`
            <atomic-smart-snippet-expandable-answer
              .collapsedHeight=${this.collapsedHeight}
              .expanded=${this.smartSnippetState.expanded}
              exportparts="answer,show-more-button,show-less-button,truncated-answer"
              .htmlContent=${this.smartSnippetState.answer}
              .maximumHeight=${this.maximumHeight}
              @collapse=${() => this.smartSnippet.collapse()}
              @expand=${() => this.smartSnippet.expand()}
              part="body"
              .snippetStyle=${this.computedStyle}
            ></atomic-smart-snippet-expandable-answer>
          `
        )}
        ${renderSnippetFooter({
          props: {i18n: this.bindings.i18n},
        })(html`
          ${when(
            source,
            () => html`
              <atomic-smart-snippet-source
                .source=${source}
                .anchorAttributes=${getAttributesFromLinkSlotContent(
                  this,
                  'source-anchor-attributes'
                )}
                @selectSource=${this.smartSnippet.selectSource}
                @beginDelayedSelectSource=${
                  this.smartSnippet.beginDelayedSelectSource
                }
                @cancelPendingSelectSource=${
                  this.smartSnippet.cancelPendingSelectSource
                }
              ></atomic-smart-snippet-source>
            `
          )}
          ${renderSmartSnippetFeedbackBanner({
            props: {
              disliked: this.smartSnippetState.disliked,
              explainWhyRef: (button?: Element | HTMLButtonElement) => {
                if (this.modalRef && button) {
                  this.modalRef.source = button as HTMLButtonElement;
                }
              },
              feedbackSent: this.feedbackSent,
              id: this.#id,
              i18n: this.bindings.i18n,
              liked: this.smartSnippetState.liked,
              onDislike: () => {
                this.loadModal();
                this.smartSnippet.dislike();
              },
              onLike: () => this.smartSnippet.like(),
              onPressExplainWhy: () => {
                if (this.modalRef) {
                  this.modalRef.isOpen = true;
                }
              },
            },
          })}
        `)}
      </atomic-smart-snippet-collapse-wrapper>
    `);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-smart-snippet': AtomicSmartSnippet;
  }
}

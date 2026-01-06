import {
  buildSmartSnippet as buildInsightSmartSnippet,
  type SmartSnippet as InsightSmartSnippet,
  type SmartSnippetState as InsightSmartSnippetState,
} from '@coveo/headless/insight';
import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import type {RefOrCallback} from 'lit/directives/ref.js';
import {getAttributesFromLinkSlotContent} from '@/src/components/common/item-link/attributes-slot';
import {renderSnippetFooter} from '@/src/components/common/smart-snippets/atomic-smart-snippet/snippet-footer';
import {renderSnippetQuestion} from '@/src/components/common/smart-snippets/atomic-smart-snippet/snippet-question';
import {renderSnippetWrapper} from '@/src/components/common/smart-snippets/atomic-smart-snippet/snippet-wrapper';
import {renderSmartSnippetFeedbackBanner} from '@/src/components/common/smart-snippets/smart-snippet-feedback-banner';
import type {InsightBindings} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {randomID} from '@/src/utils/utils';
import '@/src/components/common/atomic-smart-snippet-collapse-wrapper/atomic-smart-snippet-collapse-wrapper';
import '@/src/components/common/atomic-smart-snippet-expandable-answer/atomic-smart-snippet-expandable-answer';
import {when} from 'lit-html/directives/when.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';

/**
 * The `atomic-insight-smart-snippet` component displays a smart snippet for an Insight Panel query.
 * Smart snippets are generated answers extracted from relevant documents.
 *
 * @internal
 * @part smart-snippet - The container for the smart snippet.
 * @part body - The expandable answer body.
 * @part feedback-banner - The feedback banner container.
 * @part feedback-inquiry - The feedback inquiry text.
 * @part feedback-buttons - The container for feedback buttons.
 * @part feedback-like-button - The like button.
 * @part feedback-dislike-button - The dislike button.
 * @part feedback-thank-you-wrapper - The thank you message wrapper.
 * @part feedback-thank-you - The thank you message.
 * @part feedback-explain-why-button - The explain why button.
 *
 * @slot source-anchor-attributes - Slot for attributes to apply to the source anchor element.
 */
@customElement('atomic-insight-smart-snippet')
@bindings()
@withTailwindStyles
export class AtomicInsightSmartSnippet
  extends LitElement
  implements InitializableComponent<InsightBindings>
{
  @state() bindings!: InsightBindings;
  @state() error!: Error;

  @bindStateToController('smartSnippet')
  @state()
  public smartSnippetState!: InsightSmartSnippetState;
  public smartSnippet!: InsightSmartSnippet;

  @state() private feedbackSent = false;

  private smartSnippetId!: string;
  private modalRef?: HTMLAtomicInsightSmartSnippetFeedbackModalElement;

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

  public initialize() {
    this.smartSnippetId ||= randomID();
    this.smartSnippet = buildInsightSmartSnippet(this.bindings.engine);
  }

  willUpdate() {
    if (!this.smartSnippetState) {
      return;
    }
    if (!(this.smartSnippetState.liked || this.smartSnippetState.disliked)) {
      this.feedbackSent = false;
    }
  }

  private get computedStyle() {
    const slot = this.shadowRoot?.querySelector(
      'slot[name="style"]'
    ) as HTMLSlotElement | null;
    if (!slot) {
      return this.snippetStyle;
    }

    const template = slot.assignedElements()[0] as
      | HTMLTemplateElement
      | undefined;
    const styleTag = template?.content.querySelector('style');

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
      'atomic-insight-smart-snippet-feedback-modal'
    );
    modalRef.addEventListener('feedbackSent', () => {
      this.feedbackSent = true;
    });
    this.modalRef = modalRef;
    this.renderRoot.parentElement?.insertAdjacentElement(
      'beforebegin',
      modalRef
    );
  }

  private renderSource() {
    const source = this.smartSnippetState.source;
    if (!source) {
      return nothing;
    }

    return html`<atomic-smart-snippet-source
      .anchorAttributes=${getAttributesFromLinkSlotContent(
        this,
        'source-anchor-attributes'
      )}
      .onBeginDelayedSelectSource=${this.smartSnippet.beginDelayedSelectSource}
      .onCancelPendingSelectSource=${
        this.smartSnippet.cancelPendingSelectSource
      }
      .onSelectSource=${this.smartSnippet.selectSource}
      .source=${source}
    ></atomic-smart-snippet-source>`;
  }

  private renderFeedbackBanner() {
    const explainWhyRef: RefOrCallback = (button) => {
      if (this.modalRef && button) {
        this.modalRef.source = button as HTMLElement;
      }
    };

    return renderSmartSnippetFeedbackBanner({
      props: {
        disliked: this.smartSnippetState.disliked,
        explainWhyRef,
        feedbackSent: this.feedbackSent,
        id: this.smartSnippetId,
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
    });
  }

  @errorGuard()
  @bindingGuard()
  render() {
    const shouldDisplay = this.smartSnippetState.answerFound;
    this.classList.toggle('atomic-hidden', !shouldDisplay);

    return html`${when(shouldDisplay, () =>
      renderSnippetWrapper({
        props: {
          headingLevel: this.headingLevel,
          i18n: this.bindings.i18n,
        },
      })(html`
        <atomic-smart-snippet-collapse-wrapper>
          ${renderSnippetQuestion({
            props: {
              headingLevel: this.headingLevel,
              question: this.smartSnippetState.question,
            },
          })}
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
          ${renderSnippetFooter({
            props: {
              i18n: this.bindings.i18n,
            },
          })(html` ${this.renderSource()} ${this.renderFeedbackBanner()} `)}
        </atomic-smart-snippet-collapse-wrapper>
        <slot name="style" hidden></slot>
      `)
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-smart-snippet': AtomicInsightSmartSnippet;
  }
}

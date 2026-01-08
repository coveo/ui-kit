import '@/src/components/common/atomic-modal/atomic-modal';
import {
  buildSmartSnippet as buildInsightSmartSnippet,
  type SmartSnippet as InsightSmartSnippet,
  type SmartSnippetFeedback as InsightSmartSnippetFeedback,
} from '@coveo/headless/insight';
import {html, LitElement, type PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {keyed} from 'lit/directives/keyed.js';
import {createRef, type Ref} from 'lit/directives/ref.js';
import {ATOMIC_MODAL_EXPORT_PARTS} from '@/src/components/common/atomic-modal/export-parts';
import {feedbackOptions} from '@/src/components/common/smart-snippets/atomic-smart-snippet-feedback-modal/feedback-options';
import {renderModalBody} from '@/src/components/common/smart-snippets/atomic-smart-snippet-feedback-modal/modal-body';
import {renderModalDetails} from '@/src/components/common/smart-snippets/atomic-smart-snippet-feedback-modal/modal-details';
import {renderModalFooter} from '@/src/components/common/smart-snippets/atomic-smart-snippet-feedback-modal/modal-footer';
import {renderModalHeader} from '@/src/components/common/smart-snippets/atomic-smart-snippet-feedback-modal/modal-header';
import {renderModalOption} from '@/src/components/common/smart-snippets/atomic-smart-snippet-feedback-modal/modal-option';
import {renderModalOptions} from '@/src/components/common/smart-snippets/atomic-smart-snippet-feedback-modal/modal-options';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {updateBreakpoints} from '@/src/utils/replace-breakpoint-utils';
import {randomID} from '@/src/utils/utils';
import type {InsightBindings} from '../../atomic-insight-interface/atomic-insight-interface';

/**
 * The `atomic-insight-smart-snippet-feedback-modal` is automatically created as a child of the `atomic-insight-interface` when the `atomic-insight-smart-snippet` is initialized.
 *
 * When the modal is opened, the class `atomic-modal-opened` is added to the body, allowing further customization.
 *
 * @part backdrop - The transparent backdrop hiding the content behind the modal.
 * @part container - The modal's outermost container with the outline and background.
 * @part header-wrapper - The wrapper around the header.
 * @part header - The header of the modal, containing the title.
 * @part header-ruler - The horizontal ruler underneath the header.
 * @part body-wrapper - The wrapper around the body.
 * @part body - The body of the modal, between the header and the footer.
 * @part form - The wrapper around the reason and details.
 * @part reason-title - The title above the reason radio buttons.
 * @part reason - A wrapper around the radio button and the label of a reason.
 * @part reason-radio - A radio button representing a reason.
 * @part reason-label - A label linked to a radio button representing a reason.
 * @part details-title - The title above the details input.
 * @part details-input - The input to specify additional details.
 * @part footer-wrapper - The wrapper with a shadow around the footer.
 * @part footer - The footer at the bottom of the modal.
 * @part buttons - The wrapper around the cancel and submit buttons.
 * @part cancel-button - The cancel button.
 * @part submit-button - The submit button.
 */
@customElement('atomic-insight-smart-snippet-feedback-modal')
@bindings()
@withTailwindStyles
export class AtomicInsightSmartSnippetFeedbackModal
  extends LitElement
  implements InitializableComponent<InsightBindings>
{
  @state()
  bindings!: InsightBindings;

  @state()
  error!: Error;

  /**
   * The element that triggers the feedback modal.
   */
  @property({type: Object, attribute: false})
  source?: HTMLElement;

  /**
   * Whether the modal is open.
   */
  @property({
    type: Boolean,
    reflect: true,
    attribute: 'is-open',
    converter: booleanConverter,
  })
  public isOpen = false;

  @state()
  private currentAnswer?: InsightSmartSnippetFeedback | 'other';

  private detailsInputRef: Ref<HTMLTextAreaElement> = createRef();
  private readonly formId = randomID(
    'atomic-insight-smart-snippet-feedback-modal-form-'
  );
  private smartSnippet!: InsightSmartSnippet;

  public initialize() {
    this.smartSnippet = buildInsightSmartSnippet(this.bindings.engine);
  }

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('isOpen') && this.isOpen && this.smartSnippet) {
      this.smartSnippet.openFeedbackModal();
      this.currentAnswer = undefined;
    }
  }

  @errorGuard()
  @bindingGuard()
  render() {
    updateBreakpoints(this);

    return html`
      <atomic-modal
        .source=${this.source}
        .container=${this as HTMLElement}
        .isOpen=${this.isOpen}
        .close=${() => this.close()}
        exportparts=${ATOMIC_MODAL_EXPORT_PARTS}
      >
        ${renderModalHeader({props: {i18n: this.bindings.i18n}})}
        ${renderModalBody({
          props: {
            formId: this.formId,
            onSubmit: (e: Event) => this.sendFeedback(e),
          },
        })(html`
          ${renderModalOptions({props: {i18n: this.bindings.i18n}})(
            html`${feedbackOptions.map(({id, localeKey, correspondingAnswer}) =>
              keyed(
                id,
                renderModalOption({
                  props: {
                    correspondingAnswer,
                    currentAnswer: this.currentAnswer,
                    i18n: this.bindings.i18n,
                    id,
                    localeKey,
                    onChange: () => {
                      this.currentAnswer = correspondingAnswer;
                    },
                  },
                })
              )
            )}`
          )}
          ${renderModalDetails({
            props: {
              currentAnswer: this.currentAnswer!,
              i18n: this.bindings.i18n,
              detailsInputRef: this.detailsInputRef,
            },
          })}
        `)}
        ${renderModalFooter({
          props: {
            formId: this.formId,
            i18n: this.bindings.i18n,
            onClick: () => this.close(),
          },
        })}
      </atomic-modal>
    `;
  }

  private close() {
    this.isOpen = false;
    this.smartSnippet.closeFeedbackModal();
  }

  private sendFeedback(e: Event) {
    e.preventDefault();

    if (this.currentAnswer === 'other') {
      this.smartSnippet.sendDetailedFeedback(this.detailsInputRef.value!.value);
    } else {
      this.smartSnippet.sendFeedback(
        this.currentAnswer as InsightSmartSnippetFeedback
      );
    }
    this.dispatchEvent(new Event('feedbackSent'));
    this.isOpen = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-smart-snippet-feedback-modal': AtomicInsightSmartSnippetFeedbackModal;
  }
}

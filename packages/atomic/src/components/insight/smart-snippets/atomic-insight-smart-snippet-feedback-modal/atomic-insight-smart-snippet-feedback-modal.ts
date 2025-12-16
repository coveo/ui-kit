import {
  buildSmartSnippet as buildInsightSmartSnippet,
  type SmartSnippet as InsightSmartSnippet,
  type SmartSnippetFeedback,
} from '@coveo/headless/insight';
import {css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {createRef, type Ref} from 'lit/directives/ref.js';
import {ATOMIC_MODAL_EXPORT_PARTS} from '@/src/components/common/atomic-modal/export-parts';
import {feedbackOptions} from '@/src/components/common/smart-snippets/atomic-smart-snippet-feedback-modal/feedback-options';
import {renderModalBody} from '@/src/components/common/smart-snippets/atomic-smart-snippet-feedback-modal/modal-body';
import {renderModalDetails} from '@/src/components/common/smart-snippets/atomic-smart-snippet-feedback-modal/modal-details';
import {renderModalFooter} from '@/src/components/common/smart-snippets/atomic-smart-snippet-feedback-modal/modal-footer';
import {renderModalHeader} from '@/src/components/common/smart-snippets/atomic-smart-snippet-feedback-modal/modal-header';
import {renderModalOption} from '@/src/components/common/smart-snippets/atomic-smart-snippet-feedback-modal/modal-option';
import {renderModalOptions} from '@/src/components/common/smart-snippets/atomic-smart-snippet-feedback-modal/modal-options';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {watch} from '@/src/decorators/watch';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin';
import {updateBreakpoints} from '@/src/utils/replace-breakpoint-utils';
import {randomID} from '@/src/utils/utils';
import type {InsightBindings} from '../../atomic-insight-interface/atomic-insight-interface';

/**
 * @internal
 */
@customElement('atomic-insight-smart-snippet-feedback-modal')
@bindings()
@withTailwindStyles
export class AtomicInsightSmartSnippetFeedbackModal
  extends InitializeBindingsMixin(LitElement)
  implements InitializableComponent<InsightBindings>
{
  static styles = css`
    @reference '../../../utils/tailwind.global.tw.css';
  `;

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
  @property({type: Boolean, reflect: true, attribute: 'is-open'})
  isOpen = false;

  @state()
  private currentAnswer?: SmartSnippetFeedback | 'other';

  private detailsInputRef: Ref<HTMLTextAreaElement> = createRef();
  private readonly formId = randomID(
    'atomic-smart-snippet-feedback-modal-form-'
  );
  private smartSnippet!: InsightSmartSnippet;

  public initialize() {
    this.smartSnippet = buildInsightSmartSnippet(this.bindings.engine);
  }

  @watch('isOpen')
  watchToggleOpen(newValue: boolean) {
    if (newValue) {
      this.smartSnippet.openFeedbackModal();
      this.currentAnswer = undefined;
    }
  }

  @errorGuard()
  render() {
    updateBreakpoints(this);

    return html`
      <atomic-modal
        .fullscreen=${false}
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
        this.currentAnswer as SmartSnippetFeedback
      );
    }
    this.dispatchEvent(new Event('feedbackSent'));
    this.isOpen = false;
  }
}

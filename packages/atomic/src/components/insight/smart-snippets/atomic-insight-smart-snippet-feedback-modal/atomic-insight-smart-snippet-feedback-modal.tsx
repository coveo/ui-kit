import {
  buildSmartSnippet as buildInsightSmartSnippet,
  SmartSnippet as InsightSmartSnippet,
  SmartSnippetFeedback as InsightSmartSnippetFeedback,
} from '@coveo/headless/insight';
import {
  Component,
  State,
  Prop,
  Watch,
  Element,
  Event,
  EventEmitter,
} from '@stencil/core';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {randomID} from '../../../../utils/utils';
import {SmartSnippetFeedbackModalCommon} from '../../../common/smart-snippets/atomic-smart-snippet-feedback-modal/smart-snippet-feedback-modal-common';
import {InsightBindings} from '../../atomic-insight-interface/atomic-insight-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-smart-snippet-feedback-modal',
  styleUrl: 'atomic-insight-smart-snippet-feedback-modal.pcss',
  shadow: true,
})
export class AtomicInsightSmartSnippetFeedbackModal
  implements InitializableComponent<InsightBindings>
{
  @InitializeBindings() public bindings!: InsightBindings;
  @Element() public host!: HTMLElement;
  public smartSnippet!: InsightSmartSnippet;

  @State() public error!: Error;

  private smartSnippetFeedbackModalCommon!: SmartSnippetFeedbackModalCommon;

  @Prop({mutable: true}) source?: HTMLElement;
  @Prop({reflect: true, mutable: true}) isOpen = false;

  @State() currentAnswer?: InsightSmartSnippetFeedback | 'other' | undefined;
  private detailsInputRef?: HTMLTextAreaElement;
  private readonly formId = randomID(
    'atomic-smart-snippet-feedback-modal-form-'
  );

  @Event() feedbackSent!: EventEmitter;

  @Watch('isOpen')
  watchToggleOpen(isOpen: boolean) {
    if (isOpen) {
      this.smartSnippet.openFeedbackModal();
      this.currentAnswer = undefined;
    }
  }

  initialize() {
    this.smartSnippet = buildInsightSmartSnippet(this.bindings.engine);
    this.smartSnippetFeedbackModalCommon = new SmartSnippetFeedbackModalCommon({
      formId: this.formId,
      getHost: () => this.host,
      getBindings: () => this.bindings,
      getCurrentAnswer: () => this.currentAnswer,
      getSmartSnippet: () => this.smartSnippet,
      getDetailsInputRef: () => this.detailsInputRef,
      getFeedbackSent: () => this.feedbackSent,
      getSource: () => this.source,
      getIsOpen: () => this.isOpen,
      setIsOpen: this.setIsOpen.bind(this),
      setCurrentAnswer: this.setCurrentAnswer.bind(this),
      setDetailsInputRef: this.setDetailsInputRef.bind(this),
    });
  }

  private setIsOpen(isOpen: boolean) {
    this.isOpen = isOpen;
  }

  private setCurrentAnswer(answer: InsightSmartSnippetFeedback | 'other') {
    this.currentAnswer = answer;
  }

  private setDetailsInputRef(ref?: HTMLTextAreaElement) {
    this.detailsInputRef = ref;
  }

  public render() {
    return this.smartSnippetFeedbackModalCommon.render();
  }
}

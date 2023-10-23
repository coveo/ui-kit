// import {
//   GeneratedAnswer,
//   GeneratedAnswerState,
//   SearchStatus,
//   SearchStatusState,
// } from '@coveo/headless';
import {GeneratedAnswer, GeneratedAnswerState} from '@coveo/headless';
import {Component, HTMLStencilElement, State, h} from '@stencil/core/internal';
import {Components} from '../../../components';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';

// import {
//   BindStateToController,
//   InitializableComponent,
//   InitializeBindings,
// } from '../../../utils/initialization-utils';
// import {Bindings} from '../atomic-search-interface/atomic-search-interface';

export interface HTMLRgaNegativeFeedbackModal
  extends Components.AtomicSmartSnippetFeedbackModal,
    HTMLStencilElement {}
// eslint-disable-next-line no-var
var HTMLRgaNegativeFeedbackModal: {
  prototype: HTMLRgaNegativeFeedbackModal;
  new (): HTMLRgaNegativeFeedbackModal;
};

// interface RgaNegativeFeedbackModalProps {
//   modalTagName: string;
//   getHost: () => HTMLElement;
//   // getModalRef: () => HTMLRgaNegativeFeedbackModal | undefined;
//   // setModalRef: (ref: HTMLElement) => void;
//   generatedAnswerState: GeneratedAnswerState | undefined;
// }

@Component({
  tag: 'rga-negative-feedback-modal',
  styleUrl: 'atomic-generated-answer.pcss',
  shadow: true,
})
export class RgaNegativeFeedbackModal implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public generatedAnswer!: GeneratedAnswer;
  // @Prop({reflect: true, mutable: true}) isOpen = false;

  @BindStateToController('generatedAnswer')
  @State()
  private generatedAnswerState!: GeneratedAnswerState;

  @State()
  public error!: Error;

  // public initialize() {}

  private get testy() {
    return this.generatedAnswerState;
  }

  public render() {
    console.log('in render', this.testy);
    return (
      <atomic-modal id="modal">
        <div>This is a title</div>
        <div slot="header">This is a title</div>
        <div slot="body">This is the body</div>
        <div slot="footer">
          <button id="btn-done">Done</button>
        </div>
      </atomic-modal>
      // <p>RENDERED</p>
    );
  }
}

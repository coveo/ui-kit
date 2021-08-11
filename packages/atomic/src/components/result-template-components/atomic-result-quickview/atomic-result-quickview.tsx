import {Component, State, h, Element, Prop} from '@stencil/core';
import {
  Result,
  buildQuickview,
  QuickviewState,
  Quickview,
} from '@coveo/headless';
import {ResultContext} from '../result-template-decorators';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import DetailsIcon from 'coveo-styleguide/resources/icons/svg/details.svg';

/**
 * The `atomic-result-quickview` component renders a preview of the result.
 */
@Component({
  tag: 'atomic-result-quickview',
  styleUrl: 'atomic-result-quickview.pcss',
  shadow: false,
})
export class AtomicResultQuickview implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  @State() public error!: Error;

  private quickview!: Quickview;

  @BindStateToController('quickview')
  @State()
  private quickviewState!: QuickviewState;

  private strings = {
    previewResult: () => this.bindings.i18n.t('preview-result'),
  };

  @State() private isModalOpen = false;

  @ResultContext() private result!: Result;

  /**
   * The maximum preview size to retrieve, in bytes. By default, the full preview is retrieved.
   */
  @Prop() public maximumPreviewSize? = 0;

  @Element() private host!: HTMLElement;

  public initialize() {
    const engine = this.bindings.engine;
    const result = this.result;
    const maximumPreviewSize = this.maximumPreviewSize;

    this.quickview = buildQuickview(engine, {
      options: {result, maximumPreviewSize},
    });
  }

  private removeComponent() {
    this.host.remove();
  }

  private openModal() {
    this.quickview.fetchResultContent();
    this.isModalOpen = true;
  }

  private closeModal() {
    this.isModalOpen = false;
  }

  private get modal() {
    return (
      <atomic-modal handleClose={() => this.closeModal()}>
        <iframe
          class="w-full h-full"
          srcDoc={this.quickviewState.content}
          sandbox=""
        ></iframe>
        ;
      </atomic-modal>
    );
  }

  public render() {
    if (!this.quickviewState.resultHasPreview) {
      return this.removeComponent();
    }

    const button = (
      <button
        class="block w-full text-primary"
        aria-label={this.strings.previewResult()}
        onClick={() => this.openModal()}
      >
        <atomic-icon
          class="block h-5 w-5 mx-auto my-2"
          icon={DetailsIcon}
        ></atomic-icon>
      </button>
    );

    if (this.isModalOpen) {
      return [button, this.modal];
    }

    return button;
  }
}

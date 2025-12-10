import {Schema, StringValue} from '@coveo/bueno';
import {
  Result,
  buildQuickview,
  Quickview,
  QuickviewState,
} from '@coveo/headless';
import {Component, h, Listen, Prop, State} from '@stencil/core';
import QuickviewIcon from '../../../../images/quickview.svg';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {
  AriaLiveRegion,
  FocusTargetController,
} from '../../../../utils/stencil-accessibility-utils';
import {Button} from '../../../common/stencil-button';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';
import {ResultContext} from '@/src/components/search/result-template-component-utils/context/stencil-result-template-decorators';

/**
 * The `atomic-quickview` component renders a button which the end user can click to open a modal box containing a preview
 * about a result.
 *
 * The `atomic-quickview` is not meant to replace the `atomic-result-link` to access an item in a result template; it has certain limitations (for example, custom styles and embedded
 * images/links may not work as expected in an `atomic-quickview`).
 *
 * @part button - The button that opens the quickview modal on click.
 * @part icon - The icon for the quickview button.
 */
@Component({
  tag: 'atomic-quickview',
  styleUrl: 'atomic-quickview.pcss',
  shadow: true,
})
export class AtomicQuickview implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  @ResultContext() private result!: Result;
  private buttonFocusTarget?: FocusTargetController;

  @State() public error!: Error;

  public quickview!: Quickview;

  @BindStateToController('quickview')
  @State()
  public quickviewState!: QuickviewState;

  /**
   * The `sandbox` attribute to apply to the quickview iframe.
   *
   * The quickview is loaded inside an iframe with a [`sandbox`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-sandbox) attribute for security reasons.
   *
   * This attribute exists primarily to protect against potential XSS attacks that could originate from the document being displayed.
   *
   * By default, the sandbox attributes are: `allow-popups allow-top-navigation allow-same-origin`.
   *
   * `allow-same-origin` is not optional, and must always be included in the list of allowed capabilities for the component to function properly.
   */
  @Prop() public sandbox =
    'allow-popups allow-top-navigation allow-same-origin';

  @AriaLiveRegion('quickview')
  protected quickviewAriaMessage!: string;

  @Listen('atomic/quickview/next', {target: 'body'})
  public onNextQuickview(evt: Event) {
    evt.stopImmediatePropagation();
    this.quickview.next();
  }

  @Listen('atomic/quickview/previous', {target: 'body'})
  public onPreviousQuickview(evt: Event) {
    evt.stopImmediatePropagation();
    this.quickview.previous();
  }

  private quickviewModalRef?: HTMLAtomicQuickviewModalElement;

  public get focusTarget() {
    if (!this.buttonFocusTarget) {
      this.buttonFocusTarget = new FocusTargetController(this);
    }
    return this.buttonFocusTarget;
  }

  public initialize() {
    this.quickview = buildQuickview(this.bindings.engine, {
      options: {result: this.result},
    });
    new Schema({
      sandbox: new StringValue({
        required: true,
        regex: /allow-same-origin/,
      }),
    }).validate({sandbox: this.sandbox});
  }

  private addQuickviewModalIfNeeded() {
    if (this.quickviewModalRef) {
      return;
    }

    const quickviewModal = this.bindings.interfaceElement.querySelector(
      'atomic-quickview-modal'
    );
    if (quickviewModal) {
      this.quickviewModalRef = quickviewModal;
      return;
    }
    this.quickviewModalRef = document.createElement('atomic-quickview-modal');
    this.quickviewModalRef.setAttribute('sandbox', this.sandbox);
    this.bindings.interfaceElement.appendChild(this.quickviewModalRef);
  }

  private updateModalContent() {
    if (this.quickviewModalRef && this.quickview.state.content) {
      this.quickviewModalRef.content = this.quickview.state.content;
      this.quickviewModalRef.result = this.result;
      this.quickviewModalRef.total = this.quickviewState.totalResults;
      this.quickviewModalRef.current = this.quickviewState.currentResult;
      this.quickviewModalRef.modalCloseCallback = () =>
        this.focusTarget.focus();

      this.quickviewAriaMessage = this.quickviewState.isLoading
        ? this.bindings.i18n.t('quickview-loading')
        : this.bindings.i18n.t('quickview-loaded', {
            first: this.quickviewState.currentResult,
            last: this.quickviewState.totalResults,
            title: this.result.title,
          });
    }
  }

  private onClick(event?: MouseEvent) {
    event?.stopPropagation();
    this.quickview.fetchResultContent();
  }

  componentWillUpdate(): void {
    this.addQuickviewModalIfNeeded();
    this.updateModalContent();
  }

  public render() {
    if (this.quickviewState.resultHasPreview) {
      return (
        <Button
          part="button"
          title={this.bindings.i18n.t('quickview')}
          style="outline-primary"
          class="p-2"
          onClick={(event) => this.onClick(event)}
          ref={this.focusTarget.setTarget}
        >
          <atomic-icon
            part="icon"
            class="flex w-5 justify-center"
            icon={QuickviewIcon}
          ></atomic-icon>
        </Button>
      );
    }
  }
}

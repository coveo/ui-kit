import {Schema, StringValue} from '@coveo/bueno';
import {
  buildQuickview,
  QuickviewState,
  Quickview,
  Result,
} from '@coveo/headless';
import {Component, Listen, Prop, State, h, Element} from '@stencil/core';
import QuickviewIcon from '../../../images/preview.svg';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {
  AriaLiveRegion,
  FocusTargetController,
} from '../../../utils/stencil-accessibility-utils';
import {IconButton} from '../../common/stencil-iconButton';
import {Bindings} from '../../search/atomic-search-interface/atomic-search-interface';
import {ResultContext} from '@/src/components/search/result-template-component-utils/context/stencil-result-template-decorators';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-result-quickview-action',
  styleUrl: 'atomic-insight-result-quickview-action.pcss',
})
export class AtomicInsightResultQuickviewAction
  implements InitializableComponent
{
  @InitializeBindings() public bindings!: Bindings;
  @ResultContext() private result!: Result;

  private buttonFocusTarget?: FocusTargetController;

  @Element() host!: HTMLElement;
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
  @Prop()
  public sandbox = 'allow-popups allow-top-navigation allow-same-origin';

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

  private get shouldRenderQuickview() {
    return this.quickviewState.resultHasPreview;
  }

  public render() {
    this.addQuickviewModalIfNeeded();
    this.updateModalContent();
    if (this.shouldRenderQuickview) {
      return (
        <IconButton
          partPrefix="result-action"
          style="outline-neutral"
          ref={this.focusTarget.setTarget}
          icon={QuickviewIcon}
          title={this.bindings.i18n.t('quickview')}
          onClick={() => this.onClick()}
        />
      );
    }
  }
}

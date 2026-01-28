import {Schema, StringValue} from '@coveo/bueno';
import type {Quickview, QuickviewState, Result} from '@coveo/headless';
import {buildQuickview} from '@coveo/headless';
import {LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {createRef, type Ref} from 'lit/directives/ref.js';
import {when} from 'lit/directives/when.js';
import {renderIconButton} from '@/src/components/common/icon-button';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import {createResultContextController} from '@/src/components/search/result-template-component-utils/context/result-context-controller';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindings} from '@/src/decorators/bindings';
import type {InitializableComponent} from '@/src/decorators/types';
import {
  AriaLiveRegionController,
  FocusTargetController,
} from '@/src/utils/accessibility-utils';
import QuickviewIcon from '../../../images/preview.svg';
import '@/src/components/common/atomic-icon/atomic-icon';
import type {Bindings} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface';
import type {AtomicQuickviewModal} from '@/src/components/search/atomic-quickview-modal/atomic-quickview-modal';

/**
 * @internal
 */
@customElement('atomic-insight-result-quickview-action')
@bindings()
export class AtomicInsightResultQuickviewAction
  extends LitElement
  implements InitializableComponent<Bindings>
{
  private static readonly propsSchema = new Schema({
    sandbox: new StringValue({
      required: true,
      regex: /allow-same-origin/,
    }),
  });

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
  @property({type: String})
  public sandbox = 'allow-popups allow-top-navigation allow-same-origin';

  @state() public bindings!: Bindings;
  @state() public error!: Error;
  @state() private result!: Result;

  @bindStateToController('quickview')
  @state()
  public quickviewState!: QuickviewState;
  public quickview!: Quickview;

  private resultContext = createResultContextController(this);
  private buttonFocusTarget!: FocusTargetController;
  private ariaLiveRegion = new AriaLiveRegionController(this, 'quickview');
  private quickviewModalRef?: AtomicQuickviewModal;
  private buttonRef: Ref<HTMLButtonElement> = createRef();

  private nextQuickviewHandler = (evt: Event) => {
    evt.stopImmediatePropagation();
    this.quickview.next();
  };

  private previousQuickviewHandler = (evt: Event) => {
    evt.stopImmediatePropagation();
    this.quickview.previous();
  };

  constructor() {
    super();

    new ValidatePropsController(
      this,
      () => ({sandbox: this.sandbox}),
      AtomicInsightResultQuickviewAction.propsSchema
    );
  }

  public initialize() {
    if (this.resultContext.item) {
      const item = this.resultContext.item;
      if ('result' in item) {
        this.result = item.result;
      } else {
        this.result = item;
      }
    }
    this.buttonFocusTarget = new FocusTargetController(this, this.bindings);
    this.quickview = buildQuickview(this.bindings.engine, {
      options: {result: this.result},
    });
  }

  connectedCallback() {
    super.connectedCallback();
    document.body.addEventListener(
      'atomic/quickview/next',
      this.nextQuickviewHandler
    );
    document.body.addEventListener(
      'atomic/quickview/previous',
      this.previousQuickviewHandler
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.body.removeEventListener(
      'atomic/quickview/next',
      this.nextQuickviewHandler
    );
    document.body.removeEventListener(
      'atomic/quickview/previous',
      this.previousQuickviewHandler
    );
  }

  private addQuickviewModalIfNeeded() {
    if (this.quickviewModalRef || !this.bindings?.interfaceElement) {
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
        this.buttonFocusTarget.focus();

      this.ariaLiveRegion.message = this.quickviewState.isLoading
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

  render() {
    this.addQuickviewModalIfNeeded();
    this.updateModalContent();

    return when(this.shouldRenderQuickview, () =>
      renderIconButton({
        props: {
          partPrefix: 'result-action',
          style: 'outline-neutral',
          buttonRef: this.buttonRef,
          icon: QuickviewIcon,
          title: this.bindings.i18n.t('quickview'),
          onClick: (event) => this.onClick(event),
        },
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-result-quickview-action': AtomicInsightResultQuickviewAction;
  }
}

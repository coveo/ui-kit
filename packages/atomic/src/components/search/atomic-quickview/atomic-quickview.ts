import {Schema, StringValue} from '@coveo/bueno';
import type {Quickview, QuickviewState, Result} from '@coveo/headless';
import {buildQuickview} from '@coveo/headless';
import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {createRef, type Ref} from 'lit/directives/ref.js';
import {when} from 'lit/directives/when.js';
import {renderButton} from '@/src/components/common/button';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces';
import {createResultContextController} from '@/src/components/search/result-template-component-utils/context/result-context-controller';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindings} from '@/src/decorators/bindings';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {
  AriaLiveRegionController,
  FocusTargetController,
} from '@/src/utils/accessibility-utils';
import QuickviewIcon from '../../../images/quickview.svg';
import '@/src/components/common/atomic-icon/atomic-icon';

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
@customElement('atomic-quickview')
@bindings()
@withTailwindStyles
export class AtomicQuickview
  extends LitElement
  implements InitializableComponent<Bindings>
{
  /**
   * The sandbox attribute to apply to the iframe containing the quickview content.
   * This attribute restricts the capabilities of the iframe for security reasons (e.g., to prevent XSS attacks).
   * The default value is `'allow-popups allow-top-navigation allow-same-origin'`.
   * The `allow-same-origin` directive is required for the quickview to function properly.
   * You may override this value to further restrict or expand the iframe's capabilities, but removing `allow-same-origin` will break the component.
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
  private quickviewModalRef?: HTMLAtomicQuickviewModalElement;
  private buttonRef: Ref<HTMLButtonElement> = createRef();

  private nextQuickviewHandler = (evt: Event) => {
    evt.stopImmediatePropagation();
    this.quickview.next();
  };

  private previousQuickviewHandler = (evt: Event) => {
    evt.stopImmediatePropagation();
    this.quickview.previous();
  };

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

    new Schema({
      sandbox: new StringValue({
        required: true,
        regex: /allow-same-origin/,
      }),
    }).validate({sandbox: this.sandbox});
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

  updated() {
    this.addQuickviewModalIfNeeded();
    if (this.quickviewState) {
      this.updateModalContent();
    }
    if (this.buttonRef.value && this.buttonFocusTarget) {
      this.buttonFocusTarget.setTarget(this.buttonRef.value);
    }
  }

  render() {
    return when(
      this.quickviewState?.resultHasPreview,
      () =>
        renderButton({
          props: {
            part: 'button',
            title: this.bindings.i18n.t('quickview'),
            style: 'outline-primary',
            class: 'p-2',
            onClick: (event) => this.onClick(event),
            ref: this.buttonRef,
          },
        })(
          html`<atomic-icon
            part="icon"
            class="flex w-5 justify-center"
            icon=${QuickviewIcon}
          ></atomic-icon>`
        ),
      () => nothing
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-quickview': AtomicQuickview;
  }
}

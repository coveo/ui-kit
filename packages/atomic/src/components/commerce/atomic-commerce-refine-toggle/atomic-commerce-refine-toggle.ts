import {
  buildProductListing,
  buildSearch,
  Summary,
  SearchSummaryState,
  ProductListingSummaryState,
} from '@coveo/headless/commerce';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {bindings} from '@/src/decorators/bindings';
import {bindStateToController} from '@/src/decorators/bind-state';
import {InitializableComponent} from '@/src/decorators/types';
import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import {renderRefineToggleButton} from '../../common/refine-modal/button';
import {refineToggleGuard} from '../../common/refine-modal/guard';
import {errorGuard} from '@/src/decorators/error-guard';
import {bindingGuard} from '@/src/decorators/binding-guard';

/**
 * The `atomic-commerce-refine-toggle` component displays a button that opens a modal containing the facets and the sort components.
 *
 * When this component is added to the `atomic-commerce-interface`, an `atomic-commerce-refine-modal` component is automatically created.
 *
 * @part button - The refine toggle button.
 * @part placeholder - The placeholder shown while the first request is being executed.
 *
 * @alpha
 */
@customElement('atomic-commerce-refine-toggle')
@bindings()
@withTailwindStyles
export class AtomicCommerceRefineToggle
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  @state()
  bindings!: CommerceBindings;

  @state()
  error!: Error;

  public summary!: Summary;

  @bindStateToController('summary')
  @state()
  private summaryState!: SearchSummaryState | ProductListingSummaryState;

  private modalRef?: HTMLAtomicCommerceRefineModalElement;
  private buttonRef?: HTMLButtonElement;

  public initialize() {
    const searchOrListing =
      this.bindings.interfaceElement.type === 'search'
        ? buildSearch(this.bindings.engine)
        : buildProductListing(this.bindings.engine);

    this.summary = searchOrListing.summary();
  }

  private loadModal() {
    if (this.modalRef) {
      return;
    }

    this.modalRef = document.createElement('atomic-commerce-refine-modal');
    this.insertAdjacentElement('beforebegin', this.modalRef);
    this.modalRef.openButton = this.buttonRef;
  }

  private enableModal() {
    this.modalRef && (this.modalRef.isOpen = true);
  }

  @errorGuard()
  @bindingGuard()
  render() {
    return html`${refineToggleGuard(
      {
        firstRequestExecuted: this.summaryState.firstRequestExecuted,
        hasError: this.summaryState.hasError,
        hasItems: this.summaryState.hasProducts,
      },
      () =>
        html`${renderRefineToggleButton({
          props: {
            i18n: this.bindings.i18n,
            onClick: () => this.enableModal(),
            refCallback: (button) => {
              if (!button) {
                return;
              }
              this.buttonRef = button as HTMLButtonElement;
              this.loadModal();
            },
          },
        })}`
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-refine-toggle': AtomicCommerceRefineToggle;
  }
}

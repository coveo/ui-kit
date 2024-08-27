import {
  buildProductListing,
  buildSearch,
  Summary,
  SearchSummaryState,
  ProductListingSummaryState,
} from '@coveo/headless/commerce';
import {Component, h, State, Element} from '@stencil/core';
import {
  InitializeBindings,
  InitializableComponent,
  BindStateToController,
} from '../../../utils/initialization-utils';
import {RefineToggleButton} from '../../common/refine-modal/button';
import {RefineToggleGuard} from '../../common/refine-modal/guard';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';

/**
 * The `atomic-commerce-refine-toggle` component displays a button that opens a modal containing the facets and the sort components.
 *
 * When this component is added to the `atomic-commerce-search-interface`, an `atomic-commerce-refine-modal` component is automatically created.

 * @part button - The refine toggle button.
 *
 * @alpha
 */
@Component({
  tag: 'atomic-commerce-refine-toggle',
  styleUrl: 'atomic-commerce-refine-toggle.pcss',
  shadow: true,
})
export class AtomicCommerceRefineToggle
  implements InitializableComponent<CommerceBindings>
{
  public summary!: Summary;
  @BindStateToController('summary')
  @State()
  private summaryState!: SearchSummaryState | ProductListingSummaryState;
  @Element() public host!: HTMLElement;
  private modalRef?: HTMLAtomicCommerceRefineModalElement;
  private buttonRef?: HTMLButtonElement;

  @InitializeBindings() public bindings!: CommerceBindings;
  @State() public error!: Error;

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
    this.host.insertAdjacentElement('beforebegin', this.modalRef);
    this.modalRef.openButton = this.buttonRef;
  }

  private enableModal() {
    this.modalRef && (this.modalRef.isOpen = true);
  }

  public render() {
    return (
      <RefineToggleGuard
        firstRequestExecuted={this.summaryState.firstRequestExecuted}
        hasError={this.summaryState.hasError}
        hasItems={this.summaryState.hasProducts}
      >
        <RefineToggleButton
          i18n={this.bindings.i18n}
          onClick={() => this.enableModal()}
          setRef={(button) => {
            if (!button) {
              return;
            }
            this.buttonRef = button;
            this.loadModal();
          }}
        />
      </RefineToggleGuard>
    );
  }
}

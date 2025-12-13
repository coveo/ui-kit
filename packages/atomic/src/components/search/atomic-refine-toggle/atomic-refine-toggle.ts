import {
  buildSearchStatus,
  type SearchStatus,
  type SearchStatusState,
} from '@coveo/headless';
import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {renderRefineToggleButton} from '../../common/refine-modal/button';
import {refineToggleGuard} from '../../common/refine-modal/guard';
import type {Bindings} from '../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-refine-toggle` component displays a button that opens a modal containing the facets and the sort components.
 *
 * When this component is added to the `atomic-search-interface`, an `atomic-refine-modal` component is automatically created.
 *
 * @part button - The refine toggle button.
 * @part placeholder - The placeholder shown while the first request is being executed.
 */
@customElement('atomic-refine-toggle')
@bindings()
@withTailwindStyles
export class AtomicRefineToggle
  extends LitElement
  implements InitializableComponent<Bindings>
{
  @state()
  bindings!: Bindings;

  @state()
  error!: Error;

  public searchStatus!: SearchStatus;

  @bindStateToController('searchStatus')
  @state()
  private searchStatusState!: SearchStatusState;

  /**
   * The number of expanded facets inside the refine modal.
   * Remaining facets are automatically collapsed.
   *
   * Using the value `0` collapses all facets.
   */
  @property({type: Number, reflect: true, attribute: 'collapse-facets-after'})
  collapseFacetsAfter = 0;

  private modalRef?: HTMLAtomicRefineModalElement;
  private buttonRef?: HTMLButtonElement;

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
  }

  private loadModal() {
    if (this.modalRef) {
      return;
    }

    this.modalRef = document.createElement('atomic-refine-modal');
    this.insertAdjacentElement('beforebegin', this.modalRef);
    this.modalRef.openButton = this.buttonRef;
    this.modalRef.collapseFacetsAfter = this.collapseFacetsAfter;
  }

  private enableModal() {
    if (this.modalRef) {
      this.modalRef.isOpen = true;
    }
  }

  @errorGuard()
  @bindingGuard()
  render() {
    return html`${refineToggleGuard(
      {
        firstRequestExecuted: this.searchStatusState.firstSearchExecuted,
        hasError: this.searchStatusState.hasError,
        hasItems: this.searchStatusState.hasResults,
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
    'atomic-refine-toggle': AtomicRefineToggle;
  }
}

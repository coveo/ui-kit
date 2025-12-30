import {
  buildSearchStatus,
  type SearchStatus,
  type SearchStatusState,
} from '@coveo/headless/insight';
import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {renderRefineToggleButton} from '../../common/refine-modal/button';
import {refineToggleGuard} from '../../common/refine-modal/guard';
import type {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

/**
 * The `atomic-insight-refine-toggle` component displays a button that opens a modal containing the facets and the sort components.
 *
 * When this component is added to the `atomic-insight-interface`, an `atomic-insight-refine-modal` component is automatically created.
 *
 * @part button - The refine toggle button.
 * @part placeholder - The placeholder shown while the first request is being executed.
 */
@customElement('atomic-insight-refine-toggle')
@bindings()
@withTailwindStyles
export class AtomicInsightRefineToggle
  extends LitElement
  implements InitializableComponent<InsightBindings>
{
  @state()
  bindings!: InsightBindings;

  @state()
  error!: Error;

  public searchStatus!: SearchStatus;

  @bindStateToController('searchStatus')
  @state()
  private searchStatusState!: SearchStatusState;

  private modalRef?: HTMLAtomicInsightRefineModalElement;
  private buttonRef?: HTMLButtonElement;

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
  }

  private loadModal() {
    if (this.modalRef) {
      return;
    }

    this.modalRef = document.createElement('atomic-insight-refine-modal');
    this.insertAdjacentElement('beforebegin', this.modalRef);
    this.modalRef.openButton = this.buttonRef;
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
    'atomic-insight-refine-toggle': AtomicInsightRefineToggle;
  }
}

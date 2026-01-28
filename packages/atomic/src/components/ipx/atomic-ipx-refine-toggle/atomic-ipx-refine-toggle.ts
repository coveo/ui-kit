import {
  type BreadcrumbManager,
  type BreadcrumbManagerState,
  buildBreadcrumbManager,
  buildSearchStatus,
  type SearchStatus,
  type SearchStatusState,
} from '@coveo/headless';
import {css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {ref} from 'lit/directives/ref.js';
import {when} from 'lit/directives/when.js';
import {renderIconButton} from '@/src/components/common/icon-button';
import type {Bindings} from '@/src/components/search/atomic-search-interface/atomic-search-interface';
import {bindStateToController} from '@/src/decorators/bind-state-to-controller';
import {bindings} from '@/src/decorators/bindings';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import FilterIcon from '../../../images/filter.svg';

/**
 * The `atomic-ipx-refine-toggle` component is a button that toggles the refine modal in the In-Product Experience interface.
 *
 * @internal
 *
 * @part ipx-refine-toggle-container - The container div element.
 * @part ipx-refine-toggle-button - The button element.
 * @part ipx-refine-toggle-icon - The filter icon within the button.
 * @part ipx-refine-toggle-badge - The badge element displaying the number of active filters.
 */
@customElement('atomic-ipx-refine-toggle')
@bindings()
@withTailwindStyles
export class AtomicIpxRefineToggle
  extends LitElement
  implements InitializableComponent<Bindings>
{
  static styles = css`
    @reference '../../../utils/tailwind.global.tw.css';

    :host {
      [part='ipx-refine-toggle-button'] {
        @apply h-full w-auto;
      }

      [part='ipx-refine-toggle-badge'] {
        @apply h-5 w-5 text-xs leading-5;
      }

      [part='ipx-refine-toggle-icon'] {
        @apply h-5 w-5;
      }
    }
  `;

  /**
   * The number of expanded facets inside the refine modal.
   * Remaining facets are automatically collapsed.
   *
   * Using the value `0` collapses all facets.
   */
  @property({type: Number, reflect: true, attribute: 'collapse-facets-after'})
  public collapseFacetsAfter = 0;

  @state() public bindings!: Bindings;
  @state() public error!: Error;

  @bindStateToController('breadcrumbManager')
  @state()
  private breadcrumbManagerState!: BreadcrumbManagerState;
  public breadcrumbManager!: BreadcrumbManager;

  @bindStateToController('searchStatus')
  @state()
  private searchStatusState!: SearchStatusState;
  public searchStatus!: SearchStatus;

  private modalRef?: HTMLAtomicIpxRefineModalElement;
  private buttonRef?: HTMLButtonElement;

  private get numberOfBreadcrumbs(): number {
    return [
      ...this.breadcrumbManagerState.facetBreadcrumbs,
      ...this.breadcrumbManagerState.categoryFacetBreadcrumbs,
      ...this.breadcrumbManagerState.numericFacetBreadcrumbs,
      ...this.breadcrumbManagerState.dateFacetBreadcrumbs,
      ...this.breadcrumbManagerState.staticFilterBreadcrumbs,
    ].length;
  }

  public initialize() {
    this.breadcrumbManager = buildBreadcrumbManager(this.bindings.engine);
    this.searchStatus = buildSearchStatus(this.bindings.engine);
  }

  private enableModal() {
    if (this.modalRef) {
      this.modalRef.isOpen = true;
    }
  }

  private loadModal() {
    if (this.modalRef) {
      return;
    }

    this.modalRef = document.createElement('atomic-ipx-refine-modal');
    this.parentElement?.insertBefore(this.modalRef, this);
    if (this.buttonRef) {
      this.modalRef.openButton = this.buttonRef;
    }
    this.modalRef.collapseFacetsAfter = this.collapseFacetsAfter;
  }

  private handleButtonRef(button?: Element) {
    if (!button || !(button instanceof HTMLButtonElement)) {
      return;
    }
    this.buttonRef = button;
    this.loadModal();
  }

  private handleClick() {
    this.bindings.store.waitUntilAppLoaded(() => {
      this.enableModal();
    });
  }

  render() {
    return renderIconButton({
      props: {
        partPrefix: 'ipx-refine-toggle',
        class: 'icon-button',
        style: 'outline-neutral',
        title: this.bindings.i18n.t('filters'),
        icon: FilterIcon,
        disabled:
          !this.searchStatusState.hasResults && !this.numberOfBreadcrumbs,
        ariaLabel: this.bindings.i18n.t('sort'),
        onClick: () => this.handleClick(),
        buttonRef: ref((el) => this.handleButtonRef(el)),
        badge: when(
          this.breadcrumbManagerState.hasBreadcrumbs,
          () => html`<slot>${this.numberOfBreadcrumbs.toString()}</slot>`
        ),
      },
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-ipx-refine-toggle': AtomicIpxRefineToggle;
  }
}

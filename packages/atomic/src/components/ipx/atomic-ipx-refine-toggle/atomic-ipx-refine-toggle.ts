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
import {renderIconButton} from '@/src/components/common/icon-button';
import type {Bindings} from '@/src/components/search/atomic-search-interface/atomic-search-interface';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import FilterIcon from '../../../images/filter.svg';
// import '@/src/components/ipx/atomic-ipx-refine-modal/atomic-ipx-refine-modal'; // TODO: uncomment when KIT-5352 is done

/**
 * The `atomic-ipx-refine-toggle` component displays a button that, when clicked, opens a refine modal containing facets.
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
    const state = this.breadcrumbManagerState;
    return (
      state.facetBreadcrumbs.length +
      state.categoryFacetBreadcrumbs.length +
      state.numericFacetBreadcrumbs.length +
      state.dateFacetBreadcrumbs.length +
      state.staticFilterBreadcrumbs.length +
      state.automaticFacetBreadcrumbs.length
    );
  }

  public initialize() {
    this.breadcrumbManager = buildBreadcrumbManager(this.bindings.engine);
    this.searchStatus = buildSearchStatus(this.bindings.engine);
  }

  private ensureModal() {
    if (this.modalRef) {
      return;
    }

    const searchRoot =
      this.closest('atomic-search-interface') ?? this.parentElement;
    const existingModal =
      searchRoot?.querySelector<HTMLAtomicIpxRefineModalElement>(
        'atomic-ipx-refine-modal'
      );

    if (existingModal) {
      this.modalRef = existingModal;
    } else {
      this.modalRef = document.createElement('atomic-ipx-refine-modal');
      this.parentElement?.parentElement?.insertBefore(
        this.modalRef,
        this.parentElement
      );
    }

    this.modalRef.openButton = this.buttonRef;
    this.modalRef.collapseFacetsAfter = this.collapseFacetsAfter;
  }

  private handleClick() {
    this.bindings.store.waitUntilAppLoaded(() => {
      this.ensureModal();
      if (this.modalRef) {
        this.modalRef.isOpen = true;
      }
    });
  }

  @errorGuard()
  @bindingGuard()
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
        ariaLabel: this.bindings.i18n.t('filters'),
        onClick: () => this.handleClick(),
        buttonRef: (button) => {
          if (!button) {
            return;
          }
          this.buttonRef = button as HTMLButtonElement;
        },
        badge: this.breadcrumbManagerState.hasBreadcrumbs
          ? html`<slot>${this.numberOfBreadcrumbs}</slot>`
          : undefined,
      },
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-ipx-refine-toggle': AtomicIpxRefineToggle;
  }
}

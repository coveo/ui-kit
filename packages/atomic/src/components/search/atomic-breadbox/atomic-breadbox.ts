import {NumberValue, Schema} from '@coveo/bueno';
import {
  type BreadcrumbManager,
  type BreadcrumbManagerState,
  buildBreadcrumbManager,
  buildFacetManager,
  type FacetManager,
  type FacetManagerState,
} from '@coveo/headless';
import {type CSSResultGroup, css, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {renderBreadcrumbButton} from '@/src/components/common/breadbox/breadcrumb-button';
import {renderBreadcrumbClearAll} from '@/src/components/common/breadbox/breadcrumb-clear-all';
import {renderBreadcrumbContainer} from '@/src/components/common/breadbox/breadcrumb-container';
import {renderBreadcrumbContent} from '@/src/components/common/breadbox/breadcrumb-content';
import {renderBreadcrumbShowLess} from '@/src/components/common/breadbox/breadcrumb-show-less';
import {renderBreadcrumbShowMore} from '@/src/components/common/breadbox/breadcrumb-show-more';
import type {Breadcrumb as BreadboxBreadcrumb} from '@/src/components/common/breadbox/breadcrumb-types';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import type {Bindings} from '@/src/components/search/atomic-search-interface/atomic-search-interface';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {
  AriaLiveRegionController,
  FocusTargetController,
} from '@/src/utils/accessibility-utils';
import {getFieldValueCaption} from '@/src/utils/field-utils';

/**
 * The `atomic-breadbox` component creates breadcrumbs that display a summary of the currently active facet values.
 *
 * @part container - The container of the whole component, list & label.
 * @part breadcrumb-list-container - The container of the list of breadcrumb buttons.
 * @part breadcrumb-list - The list of breadcrumb buttons.
 * @part breadcrumb-button - A single breadcrumb button.
 * @part breadcrumb-label - The breadcrumb label, associated with the facet.
 * @part breadcrumb-value - The breadcrumb formatted value.
 * @part breadcrumb-clear - The button to clear individual filters.
 * @part show-more - The button to display all breadcrumbs.
 * @part show-less - The button to display less breadcrumbs.
 * @part label - The "Filters" label.
 * @part clear - The button to clear all filters.
 */
@customElement('atomic-breadbox')
@bindings()
@withTailwindStyles
export class AtomicBreadbox
  extends LitElement
  implements InitializableComponent<Bindings>
{
  static styles: CSSResultGroup = [
    css`
      [part='breadcrumb-label'].excluded,
      [part='breadcrumb-value'].excluded {
        text-decoration: line-through;
        @apply text-error;
      }
    `,
  ];

  private resizeObserver?: ResizeObserver;
  private lastRemovedBreadcrumbIndex = 0;
  private numberOfBreadcrumbs = 0;
  private numberOfCollapsedBreadcrumbs = 0;
  private firstExpandedBreadcrumbIndex?: number;
  private breadcrumbRemovedFocus!: FocusTargetController;
  private breadcrumbShowMoreFocus!: FocusTargetController;
  private breadcrumbShowLessFocus!: FocusTargetController;

  public bindings!: Bindings;
  public breadcrumbManager!: BreadcrumbManager;
  public facetManager!: FacetManager;

  @bindStateToController('breadcrumbManager')
  @state()
  public breadcrumbManagerState!: BreadcrumbManagerState;

  @bindStateToController('facetManager')
  @state()
  public facetManagerState!: FacetManagerState;

  @state() public error!: Error;
  @state() private isCollapsed = true;
  @state() private showMoreText = '';

  private breadboxAriaMessage = new AriaLiveRegionController(
    this,
    'breadbox',
    true
  );

  /**
   * This prop allows you to control the display depth
   * of the path by specifying the number of parent or ancestor
   * breadcrumbs links relative to the currently selected value.
   *
   * If the path size is equal to or less than the pathLimit, all values in
   * the path will be displayed without truncation.
   *
   * If the path size exceeds the pathLimit, it will truncate the path by
   * replacing the middle values with ellipses ('...').
   *
   * Minimum: `1`
   * @defaultValue `3`
   */
  @property({type: Number, attribute: 'path-limit'}) pathLimit = 3;

  constructor() {
    super();

    new ValidatePropsController(
      this,
      () => ({pathLimit: this.pathLimit}),
      new Schema({
        pathLimit: new NumberValue({
          default: 3,
          min: 1,
          required: false,
        }),
      })
    );
  }

  public initialize() {
    this.breadcrumbManager = buildBreadcrumbManager(this.bindings.engine);
    this.facetManager = buildFacetManager(this.bindings.engine);

    if (window.ResizeObserver && this.parentElement) {
      this.resizeObserver = new ResizeObserver(() => this.adaptBreadcrumbs());
      this.resizeObserver.observe(this.parentElement);
    }

    this.breadcrumbRemovedFocus = new FocusTargetController(
      this,
      this.bindings
    );
    this.breadcrumbShowMoreFocus = new FocusTargetController(
      this,
      this.bindings
    );
    this.breadcrumbShowLessFocus = new FocusTargetController(
      this,
      this.bindings
    );
  }

  public updated() {
    this.adaptBreadcrumbs();
  }

  @bindingGuard()
  @errorGuard()
  render() {
    const breadcrumbs = this.allBreadcrumbs;

    if (!breadcrumbs.length) {
      return html`${nothing}`;
    }

    return html`${renderBreadcrumbContainer({
      props: {
        isCollapsed: this.isCollapsed,
        i18n: this.bindings.i18n,
      },
    })(
      html`${this.renderBreadcrumbs(breadcrumbs)}
      ${renderBreadcrumbShowMore({
        props: {
          refCallback: async (el) => {
            await this.breadcrumbShowLessFocus.setTarget(el!);
          },
          onShowMore: () => {
            this.firstExpandedBreadcrumbIndex =
              this.numberOfBreadcrumbs - this.numberOfCollapsedBreadcrumbs;
            this.breadcrumbShowMoreFocus.focusOnNextTarget();
            this.isCollapsed = false;
          },
          isCollapsed: this.isCollapsed,
          i18n: this.bindings.i18n,
          numberOfCollapsedBreadcrumbs: this.numberOfCollapsedBreadcrumbs,
          value: this.showMoreText,
          ariaLabel: this.bindings.i18n.t('show-n-more-filters', {
            value: this.numberOfCollapsedBreadcrumbs,
          }),
        },
      })}
      ${renderBreadcrumbShowLess({
        props: {
          onShowLess: () => {
            this.breadcrumbShowLessFocus.focusOnNextTarget();
            this.isCollapsed = true;
          },
          isCollapsed: this.isCollapsed,
          i18n: this.bindings.i18n,
        },
      })}
      ${renderBreadcrumbClearAll({
        props: {
          refCallback: async (ref) => {
            const isFocusTarget =
              this.lastRemovedBreadcrumbIndex === this.numberOfBreadcrumbs;

            if (isFocusTarget) {
              await this.breadcrumbRemovedFocus.setTarget(ref);
            }
          },
          onClick: () => {
            this.breadcrumbManager.deselectAll();
            this.bindings.store.state.resultList?.focusOnFirstResultAfterNextSearch();
          },
          isCollapsed: this.isCollapsed,
          i18n: this.bindings.i18n,
        },
      })} `
    )}`;
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
  }

  private get breadcrumbs() {
    return Array.from(
      this.shadowRoot!.querySelectorAll('li.breadcrumb')
    ) as HTMLElement[];
  }

  private get showMoreButton() {
    return this.shadowRoot!.querySelector(
      'button[part="show-more"]'
    ) as HTMLButtonElement;
  }

  private get showLessButton() {
    return this.shadowRoot!.querySelector(
      'button[part="show-less"]'
    ) as HTMLButtonElement;
  }

  private hide(element: HTMLElement) {
    element.style.display = 'none';
  }

  private show(element: HTMLElement) {
    element.style.display = '';
  }

  private showAllBreadcrumbs() {
    this.breadcrumbs.forEach((breadcrumb) => this.show(breadcrumb));
  }

  private adaptBreadcrumbs() {
    if (!this.breadcrumbs.length) {
      return;
    }
    this.showAllBreadcrumbs();

    if (!this.isCollapsed) {
      this.updateShowLessDisplay();
      return;
    }

    this.hideOverflowingBreadcrumbs();
  }

  private updateShowLessDisplay() {
    this.show(this.showLessButton);
    if (this.showLessButton.offsetTop === 0) {
      this.hide(this.showLessButton);
    }
  }

  private hideOverflowingBreadcrumbs() {
    let hiddenBreadcrumbs = 0;
    for (
      let i = this.breadcrumbs.length - 1;
      this.isOverflowing && i >= 0;
      i--
    ) {
      this.hide(this.breadcrumbs[i]);
      hiddenBreadcrumbs++;
    }
    this.updateShowMoreValue(hiddenBreadcrumbs);
  }

  private get isOverflowing() {
    const listElement = this.shadowRoot!.querySelector('ul');
    if (!listElement) {
      return false;
    }
    return listElement.scrollWidth > listElement.clientWidth;
  }

  private updateShowMoreValue(value: number) {
    this.numberOfCollapsedBreadcrumbs = value;
    if (value === 0) {
      this.hide(this.showMoreButton);
      return;
    }
    this.show(this.showMoreButton);

    this.showMoreText = `+ ${value.toLocaleString(
      this.bindings.i18n.language
    )}`;
  }

  private get facetBreadcrumbs(): BreadboxBreadcrumb[] {
    return this.breadcrumbManagerState.facetBreadcrumbs
      .flatMap(({facetId, field, values}) =>
        values.map((value) => ({value, facetId, field}))
      )
      .filter(({facetId}) => this.bindings.store.state.facets[facetId])
      .map(({value, facetId, field}) => ({
        facetId,
        label: this.bindings.store.state.facets[facetId]?.label(),
        state: value.value.state,
        deselect: value.deselect,
        formattedValue: [
          getFieldValueCaption(field, value.value.value, this.bindings.i18n),
        ],
      }));
  }

  private get categoryFacetBreadcrumbs(): BreadboxBreadcrumb[] {
    return this.breadcrumbManagerState.categoryFacetBreadcrumbs.map(
      ({facetId, field, path, deselect}) => ({
        facetId,
        label: this.bindings.store.state.categoryFacets[facetId].label(),
        deselect: deselect,
        formattedValue: path.map((pathValue) =>
          getFieldValueCaption(field, pathValue.value, this.bindings.i18n)
        ),
      })
    );
  }

  private get numericFacetBreadcrumbs(): BreadboxBreadcrumb[] {
    return this.breadcrumbManagerState.numericFacetBreadcrumbs
      .flatMap(({facetId, field, values}) =>
        values.map((value) => ({value, facetId, field}))
      )
      .map(({value, facetId}) => ({
        facetId,
        label: this.bindings.store.state.numericFacets[facetId].label(),
        state: value.value.state,
        deselect: value.deselect,
        formattedValue: [
          this.bindings.store.state.numericFacets[facetId].format(value.value),
        ],
        content: this.bindings.store.state.numericFacets[facetId].content?.(
          value.value
        ),
      }));
  }

  private get dateFacetBreadcrumbs(): BreadboxBreadcrumb[] {
    return this.breadcrumbManagerState.dateFacetBreadcrumbs
      .flatMap(({facetId, field, values}) =>
        values.map((value) => ({value, facetId, field}))
      )
      .map(({value, facetId}) => ({
        facetId,
        label: this.bindings.store.state.dateFacets[facetId].label(),
        state: value.value.state,
        deselect: value.deselect,
        formattedValue: [
          this.bindings.store.state.dateFacets[facetId].format(value.value),
        ],
      }));
  }

  private get automaticFacetBreadcrumbs(): BreadboxBreadcrumb[] {
    return this.breadcrumbManagerState.automaticFacetBreadcrumbs
      .flatMap(({facetId, field, label, values}) =>
        values.map((value) => ({value, facetId, field, label}))
      )
      .map(({value, facetId, field, label}) => ({
        facetId,
        state: value.value.state,
        label: label ? label : field,
        deselect: value.deselect,
        formattedValue: [
          getFieldValueCaption(field, value.value.value, this.bindings.i18n),
        ],
      }));
  }

  private get allBreadcrumbs(): BreadboxBreadcrumb[] {
    return [
      ...this.facetBreadcrumbs,
      ...this.categoryFacetBreadcrumbs,
      ...this.numericFacetBreadcrumbs,
      ...this.dateFacetBreadcrumbs,
      ...this.automaticFacetBreadcrumbs,
    ];
  }

  private renderBreadcrumbs(breadcrumbs: BreadboxBreadcrumb[]) {
    const sortedBreadcrumbs = breadcrumbs.sort((a, b) => {
      const indexA = this.facetManagerState.facetIds.indexOf(a.facetId);
      const indexB = this.facetManagerState.facetIds.indexOf(b.facetId);
      return indexA - indexB;
    });
    this.numberOfBreadcrumbs = sortedBreadcrumbs.length;

    return sortedBreadcrumbs.map((breadcrumb, index) => {
      const isLastBreadcrumb = this.allBreadcrumbs.length === 1;

      return html`${renderBreadcrumbButton({
        props: {
          pathLimit: this.pathLimit,
          breadcrumb,
          i18n: this.bindings.i18n,
          onSelectBreadcrumb: () => {
            if (isLastBreadcrumb) {
              this.bindings.store.state.resultList?.focusOnFirstResultAfterNextSearch();
            } else if (this.numberOfBreadcrumbs > 1) {
              this.breadcrumbRemovedFocus.focusAfterSearch();
            }

            this.lastRemovedBreadcrumbIndex = index;
            breadcrumb.deselect();
          },
          refCallback: async (ref) => {
            if (this.lastRemovedBreadcrumbIndex === index) {
              await this.breadcrumbRemovedFocus.setTarget(ref);
            }
            if (this.firstExpandedBreadcrumbIndex === index) {
              await this.breadcrumbShowMoreFocus.setTarget(ref);
            }
          },
          ariaController: this.breadboxAriaMessage,
        },
      })(
        html`${renderBreadcrumbContent({
          props: {
            pathLimit: this.pathLimit,
            isCollapsed: this.isCollapsed,
            i18n: this.bindings.i18n,
            breadcrumb,
          },
        })}`
      )}`;
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-breadbox': AtomicBreadbox;
  }
}

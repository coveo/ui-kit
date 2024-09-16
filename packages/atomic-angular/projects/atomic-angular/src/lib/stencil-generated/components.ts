/* tslint:disable */
/* auto-generated angular directive proxies */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, NgZone } from '@angular/core';

import { ProxyCmp, proxyOutputs } from './angular-component-lib/utils';

import { Components } from '@coveo/atomic';


@ProxyCmp({
})
@Component({
  selector: 'atomic-aria-live',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicAriaLive {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicAriaLive extends Components.AtomicAriaLive {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-automatic-facet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicAutomaticFacet {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicAutomaticFacet extends Components.AtomicAutomaticFacet {}


@ProxyCmp({
  inputs: ['desiredCount', 'numberOfValues'],
  methods: ['updateCollapseFacetsDependingOnFacetsVisibility']
})
@Component({
  selector: 'atomic-automatic-facet-generator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['desiredCount', 'numberOfValues'],
})
export class AtomicAutomaticFacetGenerator {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicAutomaticFacetGenerator extends Components.AtomicAutomaticFacetGenerator {}


@ProxyCmp({
  inputs: ['pathLimit']
})
@Component({
  selector: 'atomic-breadbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['pathLimit'],
})
export class AtomicBreadbox {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicBreadbox extends Components.AtomicBreadbox {}


@ProxyCmp({
  inputs: ['basePath', 'delimitingCharacter', 'dependsOn', 'facetId', 'field', 'filterByBasePath', 'filterFacetCount', 'headingLevel', 'injectionDepth', 'isCollapsed', 'label', 'numberOfValues', 'sortCriteria', 'tabsExcluded', 'tabsIncluded', 'withSearch']
})
@Component({
  selector: 'atomic-category-facet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['basePath', 'delimitingCharacter', 'dependsOn', 'facetId', 'field', 'filterByBasePath', 'filterFacetCount', 'headingLevel', 'injectionDepth', 'isCollapsed', 'label', 'numberOfValues', 'sortCriteria', 'tabsExcluded', 'tabsIncluded', 'withSearch'],
})
export class AtomicCategoryFacet {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicCategoryFacet extends Components.AtomicCategoryFacet {}


@ProxyCmp({
  inputs: ['allowedValues', 'customSort', 'dependsOn', 'displayValuesAs', 'facetId', 'field', 'filterFacetCount', 'headingLevel', 'injectionDepth', 'isCollapsed', 'label', 'numberOfValues', 'resultsMustMatch', 'sortCriteria', 'tabsExcluded', 'tabsIncluded', 'withSearch']
})
@Component({
  selector: 'atomic-color-facet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['allowedValues', 'customSort', 'dependsOn', 'displayValuesAs', 'facetId', 'field', 'filterFacetCount', 'headingLevel', 'injectionDepth', 'isCollapsed', 'label', 'numberOfValues', 'resultsMustMatch', 'sortCriteria', 'tabsExcluded', 'tabsIncluded', 'withSearch'],
})
export class AtomicColorFacet {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicColorFacet extends Components.AtomicColorFacet {}


@ProxyCmp({
  inputs: ['pathLimit']
})
@Component({
  selector: 'atomic-commerce-breadbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['pathLimit'],
})
export class AtomicCommerceBreadbox {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicCommerceBreadbox extends Components.AtomicCommerceBreadbox {}


@ProxyCmp({
  inputs: ['facet', 'field', 'isCollapsed', 'summary']
})
@Component({
  selector: 'atomic-commerce-category-facet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['facet', 'field', 'isCollapsed', 'summary'],
})
export class AtomicCommerceCategoryFacet {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicCommerceCategoryFacet extends Components.AtomicCommerceCategoryFacet {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-commerce-did-you-mean',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicCommerceDidYouMean {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicCommerceDidYouMean extends Components.AtomicCommerceDidYouMean {}


@ProxyCmp({
  inputs: ['facet', 'field', 'isCollapsed', 'summary']
})
@Component({
  selector: 'atomic-commerce-facet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['facet', 'field', 'isCollapsed', 'summary'],
})
export class AtomicCommerceFacet {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicCommerceFacet extends Components.AtomicCommerceFacet {}


@ProxyCmp({
  inputs: ['bindings', 'facet', 'label', 'range']
})
@Component({
  selector: 'atomic-commerce-facet-number-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['bindings', 'facet', 'label', 'range'],
})
export class AtomicCommerceFacetNumberInput {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
    proxyOutputs(this, this.el, ['atomic/numberInputApply']);
  }
}


export declare interface AtomicCommerceFacetNumberInput extends Components.AtomicCommerceFacetNumberInput {

  'atomic/numberInputApply': EventEmitter<CustomEvent<any>>;
}


@ProxyCmp({
  inputs: ['collapseFacetsAfter']
})
@Component({
  selector: 'atomic-commerce-facets',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['collapseFacetsAfter'],
})
export class AtomicCommerceFacets {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicCommerceFacets extends Components.AtomicCommerceFacets {}


@ProxyCmp({
  inputs: ['CspNonce', 'analytics', 'engine', 'i18n', 'iconAssetsPath', 'language', 'languageAssetsPath', 'logLevel', 'reflectStateInUrl', 'scrollContainer', 'type'],
  methods: ['initialize', 'initializeWithEngine', 'executeFirstRequest']
})
@Component({
  selector: 'atomic-commerce-interface',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['CspNonce', 'analytics', 'engine', 'i18n', 'iconAssetsPath', 'language', 'languageAssetsPath', 'logLevel', 'reflectStateInUrl', 'scrollContainer', 'type'],
})
export class AtomicCommerceInterface {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicCommerceInterface extends Components.AtomicCommerceInterface {}


@ProxyCmp({
  inputs: ['mobileBreakpoint']
})
@Component({
  selector: 'atomic-commerce-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['mobileBreakpoint'],
})
export class AtomicCommerceLayout {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicCommerceLayout extends Components.AtomicCommerceLayout {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-commerce-load-more-products',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicCommerceLoadMoreProducts {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicCommerceLoadMoreProducts extends Components.AtomicCommerceLoadMoreProducts {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-commerce-no-products',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicCommerceNoProducts {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicCommerceNoProducts extends Components.AtomicCommerceNoProducts {}


@ProxyCmp({
  inputs: ['facet', 'field', 'isCollapsed', 'summary']
})
@Component({
  selector: 'atomic-commerce-numeric-facet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['facet', 'field', 'isCollapsed', 'summary'],
})
export class AtomicCommerceNumericFacet {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicCommerceNumericFacet extends Components.AtomicCommerceNumericFacet {}


@ProxyCmp({
  inputs: ['nextButtonIcon', 'numberOfPages', 'previousButtonIcon']
})
@Component({
  selector: 'atomic-commerce-pager',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['nextButtonIcon', 'numberOfPages', 'previousButtonIcon'],
})
export class AtomicCommercePager {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
    proxyOutputs(this, this.el, ['atomic/scrollToTop']);
  }
}


export declare interface AtomicCommercePager extends Components.AtomicCommercePager {

  'atomic/scrollToTop': EventEmitter<CustomEvent<any>>;
}


@ProxyCmp({
  inputs: ['density', 'display', 'gridCellLinkTarget', 'imageSize', 'numberOfPlaceholders'],
  methods: ['setRenderFunction']
})
@Component({
  selector: 'atomic-commerce-product-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['density', 'display', 'gridCellLinkTarget', 'imageSize', 'numberOfPlaceholders'],
})
export class AtomicCommerceProductList {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicCommerceProductList extends Components.AtomicCommerceProductList {}


@ProxyCmp({
  inputs: ['choicesDisplayed', 'initialChoice']
})
@Component({
  selector: 'atomic-commerce-products-per-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['choicesDisplayed', 'initialChoice'],
})
export class AtomicCommerceProductsPerPage {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
    proxyOutputs(this, this.el, ['atomic/scrollToTop']);
  }
}


export declare interface AtomicCommerceProductsPerPage extends Components.AtomicCommerceProductsPerPage {

  'atomic/scrollToTop': EventEmitter<CustomEvent<any>>;
}


@ProxyCmp({
})
@Component({
  selector: 'atomic-commerce-query-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicCommerceQueryError {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicCommerceQueryError extends Components.AtomicCommerceQueryError {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-commerce-query-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicCommerceQuerySummary {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicCommerceQuerySummary extends Components.AtomicCommerceQuerySummary {}


@ProxyCmp({
  inputs: ['CspNonce', 'analytics', 'engine', 'i18n', 'iconAssetsPath', 'language', 'languageAssetsPath', 'scrollContainer'],
  methods: ['initializeWithEngine', 'getOrganizationEndpoints']
})
@Component({
  selector: 'atomic-commerce-recommendation-interface',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['CspNonce', 'analytics', 'engine', 'i18n', 'iconAssetsPath', 'language', 'languageAssetsPath', 'scrollContainer'],
})
export class AtomicCommerceRecommendationInterface {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicCommerceRecommendationInterface extends Components.AtomicCommerceRecommendationInterface {}


@ProxyCmp({
  inputs: ['density', 'display', 'gridCellLinkTarget', 'headingLevel', 'imageSize', 'productId', 'productsPerPage', 'slotId'],
  methods: ['setRenderFunction', 'previousPage', 'nextPage']
})
@Component({
  selector: 'atomic-commerce-recommendation-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['density', 'display', 'gridCellLinkTarget', 'headingLevel', 'imageSize', 'productId', 'productsPerPage', 'slotId'],
})
export class AtomicCommerceRecommendationList {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicCommerceRecommendationList extends Components.AtomicCommerceRecommendationList {}


@ProxyCmp({
  inputs: ['collapseFacetsAfter', 'isOpen', 'openButton']
})
@Component({
  selector: 'atomic-commerce-refine-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['collapseFacetsAfter', 'isOpen', 'openButton'],
})
export class AtomicCommerceRefineModal {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicCommerceRefineModal extends Components.AtomicCommerceRefineModal {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-commerce-refine-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicCommerceRefineToggle {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicCommerceRefineToggle extends Components.AtomicCommerceRefineToggle {}


@ProxyCmp({
  inputs: ['clearFilters', 'disableSearch', 'minimumQueryLength', 'numberOfQueries', 'redirectionUrl', 'suggestionDelay', 'suggestionTimeout']
})
@Component({
  selector: 'atomic-commerce-search-box',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['clearFilters', 'disableSearch', 'minimumQueryLength', 'numberOfQueries', 'redirectionUrl', 'suggestionDelay', 'suggestionTimeout'],
})
export class AtomicCommerceSearchBox {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
    proxyOutputs(this, this.el, ['redirect']);
  }
}


import type { RedirectionPayload as IAtomicCommerceSearchBoxRedirectionPayload } from '@coveo/atomic';

export declare interface AtomicCommerceSearchBox extends Components.AtomicCommerceSearchBox {
  /**
   * Event that is emitted when a standalone search box redirection is triggered. By default, the search box will directly change the URL and redirect accordingly, so if you want to handle the redirection differently, use this event.

Example:
```html
<script>
  document.querySelector('atomic-commerce-search-box').addEventListener((e) => {
    e.preventDefault();
    // handle redirection
  });
</script>
...
<atomic-commerce-search-box redirection-url="/search"></atomic-commerce-search-box>
```
   */
  redirect: EventEmitter<CustomEvent<IAtomicCommerceSearchBoxRedirectionPayload>>;
}


@ProxyCmp({
  inputs: ['ariaLabelGenerator', 'density', 'imageSize'],
  methods: ['setRenderFunction']
})
@Component({
  selector: 'atomic-commerce-search-box-instant-products',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['ariaLabelGenerator', 'density', 'imageSize'],
})
export class AtomicCommerceSearchBoxInstantProducts {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicCommerceSearchBoxInstantProducts extends Components.AtomicCommerceSearchBoxInstantProducts {}


@ProxyCmp({
  inputs: ['icon', 'maxWithQuery', 'maxWithoutQuery']
})
@Component({
  selector: 'atomic-commerce-search-box-query-suggestions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['icon', 'maxWithQuery', 'maxWithoutQuery'],
})
export class AtomicCommerceSearchBoxQuerySuggestions {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicCommerceSearchBoxQuerySuggestions extends Components.AtomicCommerceSearchBoxQuerySuggestions {}


@ProxyCmp({
  inputs: ['icon', 'maxWithQuery', 'maxWithoutQuery']
})
@Component({
  selector: 'atomic-commerce-search-box-recent-queries',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['icon', 'maxWithQuery', 'maxWithoutQuery'],
})
export class AtomicCommerceSearchBoxRecentQueries {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicCommerceSearchBoxRecentQueries extends Components.AtomicCommerceSearchBoxRecentQueries {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-commerce-sort-dropdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicCommerceSortDropdown {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicCommerceSortDropdown extends Components.AtomicCommerceSortDropdown {}


@ProxyCmp({
  inputs: ['count', 'value']
})
@Component({
  selector: 'atomic-commerce-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['count', 'value'],
})
export class AtomicCommerceText {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicCommerceText extends Components.AtomicCommerceText {}


@ProxyCmp({
  inputs: ['facet', 'field', 'isCollapsed', 'summary']
})
@Component({
  selector: 'atomic-commerce-timeframe-facet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['facet', 'field', 'isCollapsed', 'summary'],
})
export class AtomicCommerceTimeframeFacet {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicCommerceTimeframeFacet extends Components.AtomicCommerceTimeframeFacet {}


@ProxyCmp({
  inputs: ['element', 'error']
})
@Component({
  selector: 'atomic-component-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['element', 'error'],
})
export class AtomicComponentError {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicComponentError extends Components.AtomicComponentError {}


@ProxyCmp({
  inputs: ['automaticallyCorrectQuery', 'queryCorrectionMode']
})
@Component({
  selector: 'atomic-did-you-mean',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['automaticallyCorrectQuery', 'queryCorrectionMode'],
})
export class AtomicDidYouMean {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicDidYouMean extends Components.AtomicDidYouMean {}


@ProxyCmp({
  inputs: ['boundInterface', 'selector']
})
@Component({
  selector: 'atomic-external',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['boundInterface', 'selector'],
})
export class AtomicExternal {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicExternal extends Components.AtomicExternal {}


@ProxyCmp({
  inputs: ['allowedValues', 'customSort', 'dependsOn', 'displayValuesAs', 'enableExclusion', 'facetId', 'field', 'filterFacetCount', 'headingLevel', 'injectionDepth', 'isCollapsed', 'label', 'numberOfValues', 'resultsMustMatch', 'sortCriteria', 'tabsExcluded', 'tabsIncluded', 'withSearch']
})
@Component({
  selector: 'atomic-facet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['allowedValues', 'customSort', 'dependsOn', 'displayValuesAs', 'enableExclusion', 'facetId', 'field', 'filterFacetCount', 'headingLevel', 'injectionDepth', 'isCollapsed', 'label', 'numberOfValues', 'resultsMustMatch', 'sortCriteria', 'tabsExcluded', 'tabsIncluded', 'withSearch'],
})
export class AtomicFacet {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicFacet extends Components.AtomicFacet {}


@ProxyCmp({
  inputs: ['collapseFacetsAfter']
})
@Component({
  selector: 'atomic-facet-manager',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['collapseFacetsAfter'],
})
export class AtomicFacetManager {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicFacetManager extends Components.AtomicFacetManager {}


@ProxyCmp({
  inputs: ['ifDefined', 'ifNotDefined']
})
@Component({
  selector: 'atomic-field-condition',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['ifDefined', 'ifNotDefined'],
})
export class AtomicFieldCondition {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicFieldCondition extends Components.AtomicFieldCondition {}


@ProxyCmp({
  inputs: ['childField', 'collectionField', 'density', 'imageSize', 'numberOfFoldedResults', 'parentField', 'tabsExcluded', 'tabsIncluded'],
  methods: ['setRenderFunction']
})
@Component({
  selector: 'atomic-folded-result-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['childField', 'collectionField', 'density', 'imageSize', 'numberOfFoldedResults', 'parentField', 'tabsExcluded', 'tabsIncluded'],
})
export class AtomicFoldedResultList {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicFoldedResultList extends Components.AtomicFoldedResultList {}


@ProxyCmp({
  inputs: ['currency']
})
@Component({
  selector: 'atomic-format-currency',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['currency'],
})
export class AtomicFormatCurrency {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicFormatCurrency extends Components.AtomicFormatCurrency {}


@ProxyCmp({
  inputs: ['maximumFractionDigits', 'maximumSignificantDigits', 'minimumFractionDigits', 'minimumIntegerDigits', 'minimumSignificantDigits']
})
@Component({
  selector: 'atomic-format-number',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['maximumFractionDigits', 'maximumSignificantDigits', 'minimumFractionDigits', 'minimumIntegerDigits', 'minimumSignificantDigits'],
})
export class AtomicFormatNumber {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicFormatNumber extends Components.AtomicFormatNumber {}


@ProxyCmp({
  inputs: ['unit', 'unitDisplay']
})
@Component({
  selector: 'atomic-format-unit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['unit', 'unitDisplay'],
})
export class AtomicFormatUnit {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicFormatUnit extends Components.AtomicFormatUnit {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-frequently-bought-together',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicFrequentlyBoughtTogether {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicFrequentlyBoughtTogether extends Components.AtomicFrequentlyBoughtTogether {}


@ProxyCmp({
  inputs: ['answerStyle', 'collapsible', 'withRephraseButtons', 'withToggle']
})
@Component({
  selector: 'atomic-generated-answer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['answerStyle', 'collapsible', 'withRephraseButtons', 'withToggle'],
})
export class AtomicGeneratedAnswer {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicGeneratedAnswer extends Components.AtomicGeneratedAnswer {}


@ProxyCmp({
  inputs: ['sanitize', 'value']
})
@Component({
  selector: 'atomic-html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['sanitize', 'value'],
})
export class AtomicHtml {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicHtml extends Components.AtomicHtml {}


@ProxyCmp({
  inputs: ['icon']
})
@Component({
  selector: 'atomic-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['icon'],
})
export class AtomicIcon {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicIcon extends Components.AtomicIcon {}


@ProxyCmp({
  inputs: ['ticketCreationDateTime', 'userId']
})
@Component({
  selector: 'atomic-insight-user-actions-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['ticketCreationDateTime', 'userId'],
})
export class AtomicInsightUserActionsTimeline {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicInsightUserActionsTimeline extends Components.AtomicInsightUserActionsTimeline {}


@ProxyCmp({
  inputs: ['maxWidth', 'minWidth', 'section']
})
@Component({
  selector: 'atomic-layout-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['maxWidth', 'minWidth', 'section'],
})
export class AtomicLayoutSection {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicLayoutSection extends Components.AtomicLayoutSection {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-load-more-results',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicLoadMoreResults {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicLoadMoreResults extends Components.AtomicLoadMoreResults {}


@ProxyCmp({
  inputs: ['enableCancelLastAction']
})
@Component({
  selector: 'atomic-no-results',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['enableCancelLastAction'],
})
export class AtomicNoResults {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicNoResults extends Components.AtomicNoResults {}


@ProxyCmp({
  inputs: ['headingLevel', 'icon']
})
@Component({
  selector: 'atomic-notifications',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['headingLevel', 'icon'],
})
export class AtomicNotifications {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicNotifications extends Components.AtomicNotifications {}


@ProxyCmp({
  inputs: ['dependsOn', 'displayValuesAs', 'facetId', 'field', 'filterFacetCount', 'headingLevel', 'injectionDepth', 'isCollapsed', 'label', 'numberOfValues', 'rangeAlgorithm', 'sortCriteria', 'tabsExcluded', 'tabsIncluded', 'withInput']
})
@Component({
  selector: 'atomic-numeric-facet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['dependsOn', 'displayValuesAs', 'facetId', 'field', 'filterFacetCount', 'headingLevel', 'injectionDepth', 'isCollapsed', 'label', 'numberOfValues', 'rangeAlgorithm', 'sortCriteria', 'tabsExcluded', 'tabsIncluded', 'withInput'],
})
export class AtomicNumericFacet {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicNumericFacet extends Components.AtomicNumericFacet {}


@ProxyCmp({
  inputs: ['end', 'endInclusive', 'label', 'start']
})
@Component({
  selector: 'atomic-numeric-range',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['end', 'endInclusive', 'label', 'start'],
})
export class AtomicNumericRange {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicNumericRange extends Components.AtomicNumericRange {}


@ProxyCmp({
  inputs: ['nextButtonIcon', 'numberOfPages', 'previousButtonIcon']
})
@Component({
  selector: 'atomic-pager',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['nextButtonIcon', 'numberOfPages', 'previousButtonIcon'],
})
export class AtomicPager {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
    proxyOutputs(this, this.el, ['atomic/scrollToTop']);
  }
}


export declare interface AtomicPager extends Components.AtomicPager {

  'atomic/scrollToTop': EventEmitter<CustomEvent<any>>;
}


@ProxyCmp({
})
@Component({
  selector: 'atomic-popover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicPopover {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicPopover extends Components.AtomicPopover {}


@ProxyCmp({
  inputs: ['classes', 'content', 'density', 'display', 'imageSize', 'interactiveProduct', 'linkContent', 'loadingFlag', 'product', 'renderingFunction', 'stopPropagation', 'store']
})
@Component({
  selector: 'atomic-product',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['classes', 'content', 'density', 'display', 'imageSize', 'interactiveProduct', 'linkContent', 'loadingFlag', 'product', 'renderingFunction', 'stopPropagation', 'store'],
})
export class AtomicProduct {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicProduct extends Components.AtomicProduct {}


@ProxyCmp({
  inputs: ['fallback', 'field', 'label']
})
@Component({
  selector: 'atomic-product-children',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['fallback', 'field', 'label'],
})
export class AtomicProductChildren {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
    proxyOutputs(this, this.el, ['atomic/selectChildProduct']);
  }
}


import type { SelectChildProductEventArgs as IAtomicProductChildrenSelectChildProductEventArgs } from '@coveo/atomic';

export declare interface AtomicProductChildren extends Components.AtomicProductChildren {

  'atomic/selectChildProduct': EventEmitter<CustomEvent<IAtomicProductChildrenSelectChildProductEventArgs>>;
}


@ProxyCmp({
  inputs: ['field', 'truncateAfter']
})
@Component({
  selector: 'atomic-product-description',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['field', 'truncateAfter'],
})
export class AtomicProductDescription {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicProductDescription extends Components.AtomicProductDescription {}


@ProxyCmp({
  inputs: ['ifDefined', 'ifNotDefined']
})
@Component({
  selector: 'atomic-product-field-condition',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['ifDefined', 'ifNotDefined'],
})
export class AtomicProductFieldCondition {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicProductFieldCondition extends Components.AtomicProductFieldCondition {}


@ProxyCmp({
  inputs: ['fallback', 'field', 'imageAltField'],
  methods: ['previousImage', 'nextImage', 'navigateToImage']
})
@Component({
  selector: 'atomic-product-image',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['fallback', 'field', 'imageAltField'],
})
export class AtomicProductImage {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicProductImage extends Components.AtomicProductImage {}


@ProxyCmp({
  inputs: ['hrefTemplate']
})
@Component({
  selector: 'atomic-product-link',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['hrefTemplate'],
})
export class AtomicProductLink {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicProductLink extends Components.AtomicProductLink {}


@ProxyCmp({
  inputs: ['field']
})
@Component({
  selector: 'atomic-product-numeric-field-value',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['field'],
})
export class AtomicProductNumericFieldValue {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicProductNumericFieldValue extends Components.AtomicProductNumericFieldValue {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-product-price',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicProductPrice {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicProductPrice extends Components.AtomicProductPrice {}


@ProxyCmp({
  inputs: ['field', 'icon', 'maxValueInIndex', 'ratingDetailsField']
})
@Component({
  selector: 'atomic-product-rating',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['field', 'icon', 'maxValueInIndex', 'ratingDetailsField'],
})
export class AtomicProductRating {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicProductRating extends Components.AtomicProductRating {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-product-section-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicProductSectionActions {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicProductSectionActions extends Components.AtomicProductSectionActions {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-product-section-badges',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicProductSectionBadges {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicProductSectionBadges extends Components.AtomicProductSectionBadges {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-product-section-bottom-metadata',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicProductSectionBottomMetadata {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicProductSectionBottomMetadata extends Components.AtomicProductSectionBottomMetadata {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-product-section-children',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicProductSectionChildren {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicProductSectionChildren extends Components.AtomicProductSectionChildren {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-product-section-description',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicProductSectionDescription {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicProductSectionDescription extends Components.AtomicProductSectionDescription {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-product-section-emphasized',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicProductSectionEmphasized {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicProductSectionEmphasized extends Components.AtomicProductSectionEmphasized {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-product-section-metadata',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicProductSectionMetadata {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicProductSectionMetadata extends Components.AtomicProductSectionMetadata {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-product-section-name',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicProductSectionName {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicProductSectionName extends Components.AtomicProductSectionName {}


@ProxyCmp({
  inputs: ['imageSize']
})
@Component({
  selector: 'atomic-product-section-visual',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['imageSize'],
})
export class AtomicProductSectionVisual {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicProductSectionVisual extends Components.AtomicProductSectionVisual {}


@ProxyCmp({
  inputs: ['conditions', 'mustMatch', 'mustNotMatch'],
  methods: ['getTemplate']
})
@Component({
  selector: 'atomic-product-template',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['conditions', 'mustMatch', 'mustNotMatch'],
})
export class AtomicProductTemplate {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicProductTemplate extends Components.AtomicProductTemplate {}


@ProxyCmp({
  inputs: ['default', 'field', 'shouldHighlight']
})
@Component({
  selector: 'atomic-product-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['default', 'field', 'shouldHighlight'],
})
export class AtomicProductText {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicProductText extends Components.AtomicProductText {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-query-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicQueryError {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicQueryError extends Components.AtomicQueryError {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-query-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicQuerySummary {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicQuerySummary extends Components.AtomicQuerySummary {}


@ProxyCmp({
  inputs: ['sandbox']
})
@Component({
  selector: 'atomic-quickview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['sandbox'],
})
export class AtomicQuickview {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicQuickview extends Components.AtomicQuickview {}


@ProxyCmp({
  inputs: ['content', 'current', 'modalCloseCallback', 'result', 'sandbox', 'total'],
  methods: ['reset']
})
@Component({
  selector: 'atomic-quickview-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['content', 'current', 'modalCloseCallback', 'result', 'sandbox', 'total'],
})
export class AtomicQuickviewModal {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
    proxyOutputs(this, this.el, ['atomic/quickview/next', 'atomic/quickview/previous']);
  }
}


export declare interface AtomicQuickviewModal extends Components.AtomicQuickviewModal {

  'atomic/quickview/next': EventEmitter<CustomEvent<any>>;

  'atomic/quickview/previous': EventEmitter<CustomEvent<any>>;
}


@ProxyCmp({
  inputs: ['dependsOn', 'displayValuesAs', 'facetId', 'field', 'filterFacetCount', 'headingLevel', 'icon', 'injectionDepth', 'isCollapsed', 'label', 'maxValueInIndex', 'minValueInIndex', 'numberOfIntervals', 'tabsExcluded', 'tabsIncluded']
})
@Component({
  selector: 'atomic-rating-facet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['dependsOn', 'displayValuesAs', 'facetId', 'field', 'filterFacetCount', 'headingLevel', 'icon', 'injectionDepth', 'isCollapsed', 'label', 'maxValueInIndex', 'minValueInIndex', 'numberOfIntervals', 'tabsExcluded', 'tabsIncluded'],
})
export class AtomicRatingFacet {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicRatingFacet extends Components.AtomicRatingFacet {}


@ProxyCmp({
  inputs: ['dependsOn', 'facetId', 'field', 'filterFacetCount', 'headingLevel', 'icon', 'injectionDepth', 'isCollapsed', 'label', 'maxValueInIndex', 'minValueInIndex', 'numberOfIntervals', 'tabsExcluded', 'tabsIncluded']
})
@Component({
  selector: 'atomic-rating-range-facet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['dependsOn', 'facetId', 'field', 'filterFacetCount', 'headingLevel', 'icon', 'injectionDepth', 'isCollapsed', 'label', 'maxValueInIndex', 'minValueInIndex', 'numberOfIntervals', 'tabsExcluded', 'tabsIncluded'],
})
export class AtomicRatingRangeFacet {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicRatingRangeFacet extends Components.AtomicRatingRangeFacet {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-recs-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicRecsError {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicRecsError extends Components.AtomicRecsError {}


@ProxyCmp({
  inputs: ['CspNonce', 'analytics', 'engine', 'fieldsToInclude', 'i18n', 'iconAssetsPath', 'language', 'languageAssetsPath', 'logLevel', 'pipeline', 'searchHub', 'timezone'],
  methods: ['initialize', 'initializeWithRecommendationEngine', 'getRecommendations', 'getOrganizationEndpoints']
})
@Component({
  selector: 'atomic-recs-interface',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['CspNonce', 'analytics', 'engine', 'fieldsToInclude', 'i18n', 'iconAssetsPath', 'language', 'languageAssetsPath', 'logLevel', 'pipeline', 'searchHub', 'timezone'],
})
export class AtomicRecsInterface {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicRecsInterface extends Components.AtomicRecsInterface {}


@ProxyCmp({
  inputs: ['density', 'display', 'gridCellLinkTarget', 'headingLevel', 'imageSize', 'label', 'numberOfRecommendations', 'numberOfRecommendationsPerPage', 'recommendation'],
  methods: ['setRenderFunction', 'previousPage', 'nextPage']
})
@Component({
  selector: 'atomic-recs-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['density', 'display', 'gridCellLinkTarget', 'headingLevel', 'imageSize', 'label', 'numberOfRecommendations', 'numberOfRecommendationsPerPage', 'recommendation'],
})
export class AtomicRecsList {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicRecsList extends Components.AtomicRecsList {}


@ProxyCmp({
  inputs: ['classes', 'content', 'density', 'display', 'imageSize', 'result', 'stopPropagation']
})
@Component({
  selector: 'atomic-recs-result',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['classes', 'content', 'density', 'display', 'imageSize', 'result', 'stopPropagation'],
})
export class AtomicRecsResult {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicRecsResult extends Components.AtomicRecsResult {}


@ProxyCmp({
  inputs: ['conditions', 'ifDefined', 'ifNotDefined'],
  methods: ['getTemplate']
})
@Component({
  selector: 'atomic-recs-result-template',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['conditions', 'ifDefined', 'ifNotDefined'],
})
export class AtomicRecsResultTemplate {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicRecsResultTemplate extends Components.AtomicRecsResultTemplate {}


@ProxyCmp({
  inputs: ['collapseFacetsAfter', 'isOpen', 'openButton']
})
@Component({
  selector: 'atomic-refine-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['collapseFacetsAfter', 'isOpen', 'openButton'],
})
export class AtomicRefineModal {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicRefineModal extends Components.AtomicRefineModal {}


@ProxyCmp({
  inputs: ['collapseFacetsAfter']
})
@Component({
  selector: 'atomic-refine-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['collapseFacetsAfter'],
})
export class AtomicRefineToggle {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicRefineToggle extends Components.AtomicRefineToggle {}


@ProxyCmp({
  inputs: ['bindings', 'open']
})
@Component({
  selector: 'atomic-relevance-inspector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['bindings', 'open'],
})
export class AtomicRelevanceInspector {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
    proxyOutputs(this, this.el, ['atomic/relevanceInspector/close']);
  }
}


export declare interface AtomicRelevanceInspector extends Components.AtomicRelevanceInspector {

  'atomic/relevanceInspector/close': EventEmitter<CustomEvent<any>>;
}


@ProxyCmp({
  inputs: ['classes', 'content', 'density', 'display', 'imageSize', 'linkContent', 'result', 'stopPropagation']
})
@Component({
  selector: 'atomic-result',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['classes', 'content', 'density', 'display', 'imageSize', 'linkContent', 'result', 'stopPropagation'],
})
export class AtomicResult {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResult extends Components.AtomicResult {}


@ProxyCmp({
  inputs: ['field', 'icon', 'label']
})
@Component({
  selector: 'atomic-result-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['field', 'icon', 'label'],
})
export class AtomicResultBadge {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultBadge extends Components.AtomicResultBadge {}


@ProxyCmp({
  inputs: ['imageSize', 'inheritTemplates', 'noResultText']
})
@Component({
  selector: 'atomic-result-children',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['imageSize', 'inheritTemplates', 'noResultText'],
})
export class AtomicResultChildren {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultChildren extends Components.AtomicResultChildren {}


@ProxyCmp({
  inputs: ['conditions'],
  methods: ['getTemplate']
})
@Component({
  selector: 'atomic-result-children-template',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['conditions'],
})
export class AtomicResultChildrenTemplate {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultChildrenTemplate extends Components.AtomicResultChildrenTemplate {}


@ProxyCmp({
  inputs: ['field', 'format', 'relativeTime']
})
@Component({
  selector: 'atomic-result-date',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['field', 'format', 'relativeTime'],
})
export class AtomicResultDate {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultDate extends Components.AtomicResultDate {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-result-fields-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicResultFieldsList {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultFieldsList extends Components.AtomicResultFieldsList {}


@ProxyCmp({
  inputs: ['field', 'sanitize']
})
@Component({
  selector: 'atomic-result-html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['field', 'sanitize'],
})
export class AtomicResultHtml {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultHtml extends Components.AtomicResultHtml {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-result-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicResultIcon {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultIcon extends Components.AtomicResultIcon {}


@ProxyCmp({
  inputs: ['fallback', 'field', 'imageAltField']
})
@Component({
  selector: 'atomic-result-image',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['fallback', 'field', 'imageAltField'],
})
export class AtomicResultImage {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultImage extends Components.AtomicResultImage {}


@ProxyCmp({
  inputs: ['hrefTemplate']
})
@Component({
  selector: 'atomic-result-link',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['hrefTemplate'],
})
export class AtomicResultLink {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultLink extends Components.AtomicResultLink {}


@ProxyCmp({
  inputs: ['density', 'display', 'gridCellLinkTarget', 'imageSize', 'tabsExcluded', 'tabsIncluded'],
  methods: ['setRenderFunction']
})
@Component({
  selector: 'atomic-result-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['density', 'display', 'gridCellLinkTarget', 'imageSize', 'tabsExcluded', 'tabsIncluded'],
})
export class AtomicResultList {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultList extends Components.AtomicResultList {}


@ProxyCmp({
  inputs: ['fieldCount', 'localeKey']
})
@Component({
  selector: 'atomic-result-localized-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['fieldCount', 'localeKey'],
})
export class AtomicResultLocalizedText {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultLocalizedText extends Components.AtomicResultLocalizedText {}


@ProxyCmp({
  inputs: ['delimiter', 'field', 'maxValuesToDisplay']
})
@Component({
  selector: 'atomic-result-multi-value-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['delimiter', 'field', 'maxValuesToDisplay'],
})
export class AtomicResultMultiValueText {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultMultiValueText extends Components.AtomicResultMultiValueText {}


@ProxyCmp({
  inputs: ['field']
})
@Component({
  selector: 'atomic-result-number',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['field'],
})
export class AtomicResultNumber {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultNumber extends Components.AtomicResultNumber {}


@ProxyCmp({
  inputs: ['maxNumberOfParts']
})
@Component({
  selector: 'atomic-result-printable-uri',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['maxNumberOfParts'],
})
export class AtomicResultPrintableUri {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultPrintableUri extends Components.AtomicResultPrintableUri {}


@ProxyCmp({
  inputs: ['field', 'icon', 'maxValueInIndex']
})
@Component({
  selector: 'atomic-result-rating',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['field', 'icon', 'maxValueInIndex'],
})
export class AtomicResultRating {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultRating extends Components.AtomicResultRating {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-result-section-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicResultSectionActions {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultSectionActions extends Components.AtomicResultSectionActions {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-result-section-badges',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicResultSectionBadges {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultSectionBadges extends Components.AtomicResultSectionBadges {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-result-section-bottom-metadata',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicResultSectionBottomMetadata {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultSectionBottomMetadata extends Components.AtomicResultSectionBottomMetadata {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-result-section-children',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicResultSectionChildren {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultSectionChildren extends Components.AtomicResultSectionChildren {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-result-section-emphasized',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicResultSectionEmphasized {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultSectionEmphasized extends Components.AtomicResultSectionEmphasized {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-result-section-excerpt',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicResultSectionExcerpt {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultSectionExcerpt extends Components.AtomicResultSectionExcerpt {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-result-section-title',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicResultSectionTitle {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultSectionTitle extends Components.AtomicResultSectionTitle {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-result-section-title-metadata',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicResultSectionTitleMetadata {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultSectionTitleMetadata extends Components.AtomicResultSectionTitleMetadata {}


@ProxyCmp({
  inputs: ['imageSize']
})
@Component({
  selector: 'atomic-result-section-visual',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['imageSize'],
})
export class AtomicResultSectionVisual {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultSectionVisual extends Components.AtomicResultSectionVisual {}


@ProxyCmp({
  inputs: ['conditions'],
  methods: ['getTemplate']
})
@Component({
  selector: 'atomic-result-template',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['conditions'],
})
export class AtomicResultTemplate {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultTemplate extends Components.AtomicResultTemplate {}


@ProxyCmp({
  inputs: ['default', 'field', 'shouldHighlight']
})
@Component({
  selector: 'atomic-result-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['default', 'field', 'shouldHighlight'],
})
export class AtomicResultText {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultText extends Components.AtomicResultText {}


@ProxyCmp({
  inputs: ['field', 'format', 'unit']
})
@Component({
  selector: 'atomic-result-timespan',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['field', 'format', 'unit'],
})
export class AtomicResultTimespan {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultTimespan extends Components.AtomicResultTimespan {}


@ProxyCmp({
  inputs: ['choicesDisplayed', 'initialChoice']
})
@Component({
  selector: 'atomic-results-per-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['choicesDisplayed', 'initialChoice'],
})
export class AtomicResultsPerPage {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
    proxyOutputs(this, this.el, ['atomic/scrollToTop']);
  }
}


export declare interface AtomicResultsPerPage extends Components.AtomicResultsPerPage {

  'atomic/scrollToTop': EventEmitter<CustomEvent<any>>;
}


@ProxyCmp({
  inputs: ['clearFilters', 'disableSearch', 'enableQuerySyntax', 'minimumQueryLength', 'numberOfQueries', 'redirectionUrl', 'suggestionDelay', 'suggestionTimeout']
})
@Component({
  selector: 'atomic-search-box',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['clearFilters', 'disableSearch', 'enableQuerySyntax', 'minimumQueryLength', 'numberOfQueries', 'redirectionUrl', 'suggestionDelay', 'suggestionTimeout'],
})
export class AtomicSearchBox {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
    proxyOutputs(this, this.el, ['redirect']);
  }
}


import type { RedirectionPayload as IAtomicSearchBoxRedirectionPayload } from '@coveo/atomic';

export declare interface AtomicSearchBox extends Components.AtomicSearchBox {
  /**
   * Event that is emitted when a standalone search box redirection is triggered. By default, the search box will directly change the URL and redirect accordingly, so if you want to handle the redirection differently, use this event.

Example:
```html
<script>
  document.querySelector('atomic-search-box').addEventListener((e) => {
    e.preventDefault();
    // handle redirection
  });
</script>
...
<atomic-search-box redirection-url="/search"></atomic-search-box>
```
   */
  redirect: EventEmitter<CustomEvent<IAtomicSearchBoxRedirectionPayload>>;
}


@ProxyCmp({
  inputs: ['ariaLabelGenerator', 'density', 'imageSize', 'maxResultsPerQuery'],
  methods: ['setRenderFunction']
})
@Component({
  selector: 'atomic-search-box-instant-results',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['ariaLabelGenerator', 'density', 'imageSize', 'maxResultsPerQuery'],
})
export class AtomicSearchBoxInstantResults {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicSearchBoxInstantResults extends Components.AtomicSearchBoxInstantResults {}


@ProxyCmp({
  inputs: ['icon', 'maxWithQuery', 'maxWithoutQuery']
})
@Component({
  selector: 'atomic-search-box-query-suggestions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['icon', 'maxWithQuery', 'maxWithoutQuery'],
})
export class AtomicSearchBoxQuerySuggestions {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicSearchBoxQuerySuggestions extends Components.AtomicSearchBoxQuerySuggestions {}


@ProxyCmp({
  inputs: ['icon', 'maxWithQuery', 'maxWithoutQuery']
})
@Component({
  selector: 'atomic-search-box-recent-queries',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['icon', 'maxWithQuery', 'maxWithoutQuery'],
})
export class AtomicSearchBoxRecentQueries {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicSearchBoxRecentQueries extends Components.AtomicSearchBoxRecentQueries {}


@ProxyCmp({
  inputs: ['CspNonce', 'analytics', 'enableRelevanceInspector', 'engine', 'fieldsToInclude', 'i18n', 'iconAssetsPath', 'language', 'languageAssetsPath', 'logLevel', 'pipeline', 'reflectStateInUrl', 'scrollContainer', 'searchHub', 'timezone'],
  methods: ['initialize', 'initializeWithSearchEngine', 'executeFirstSearch', 'getOrganizationEndpoints']
})
@Component({
  selector: 'atomic-search-interface',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['CspNonce', 'analytics', 'enableRelevanceInspector', 'engine', 'fieldsToInclude', 'i18n', 'iconAssetsPath', 'language', 'languageAssetsPath', 'logLevel', 'pipeline', 'reflectStateInUrl', 'scrollContainer', 'searchHub', 'timezone'],
})
export class AtomicSearchInterface {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicSearchInterface extends Components.AtomicSearchInterface {}


@ProxyCmp({
  inputs: ['mobileBreakpoint']
})
@Component({
  selector: 'atomic-search-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['mobileBreakpoint'],
})
export class AtomicSearchLayout {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicSearchLayout extends Components.AtomicSearchLayout {}


@ProxyCmp({
  inputs: ['allowedValues', 'customSort', 'dependsOn', 'facetId', 'field', 'filterFacetCount', 'injectionDepth', 'label', 'numberOfValues', 'sortCriteria', 'tabsExcluded', 'tabsIncluded']
})
@Component({
  selector: 'atomic-segmented-facet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['allowedValues', 'customSort', 'dependsOn', 'facetId', 'field', 'filterFacetCount', 'injectionDepth', 'label', 'numberOfValues', 'sortCriteria', 'tabsExcluded', 'tabsIncluded'],
})
export class AtomicSegmentedFacet {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicSegmentedFacet extends Components.AtomicSegmentedFacet {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-segmented-facet-scrollable',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicSegmentedFacetScrollable {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicSegmentedFacetScrollable extends Components.AtomicSegmentedFacetScrollable {}


@ProxyCmp({
  inputs: ['collapsedHeight', 'headingLevel', 'maximumHeight', 'snippetCollapsedHeight', 'snippetMaximumHeight', 'snippetStyle', 'tabsExcluded', 'tabsIncluded']
})
@Component({
  selector: 'atomic-smart-snippet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['collapsedHeight', 'headingLevel', 'maximumHeight', 'snippetCollapsedHeight', 'snippetMaximumHeight', 'snippetStyle', 'tabsExcluded', 'tabsIncluded'],
})
export class AtomicSmartSnippet {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicSmartSnippet extends Components.AtomicSmartSnippet {}


@ProxyCmp({
  inputs: ['isOpen', 'source']
})
@Component({
  selector: 'atomic-smart-snippet-feedback-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['isOpen', 'source'],
})
export class AtomicSmartSnippetFeedbackModal {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
    proxyOutputs(this, this.el, ['feedbackSent']);
  }
}


export declare interface AtomicSmartSnippetFeedbackModal extends Components.AtomicSmartSnippetFeedbackModal {

  feedbackSent: EventEmitter<CustomEvent<any>>;
}


@ProxyCmp({
  inputs: ['headingLevel', 'snippetStyle']
})
@Component({
  selector: 'atomic-smart-snippet-suggestions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['headingLevel', 'snippetStyle'],
})
export class AtomicSmartSnippetSuggestions {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicSmartSnippetSuggestions extends Components.AtomicSmartSnippetSuggestions {}


@ProxyCmp({
})
@Component({
  selector: 'atomic-sort-dropdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class AtomicSortDropdown {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicSortDropdown extends Components.AtomicSortDropdown {}


@ProxyCmp({
  inputs: ['expression', 'label', 'tabsExcluded', 'tabsIncluded']
})
@Component({
  selector: 'atomic-sort-expression',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['expression', 'label', 'tabsExcluded', 'tabsIncluded'],
})
export class AtomicSortExpression {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicSortExpression extends Components.AtomicSortExpression {}


@ProxyCmp({
  inputs: ['clearFiltersOnTabChange']
})
@Component({
  selector: 'atomic-tab-manager',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['clearFiltersOnTabChange'],
})
export class AtomicTabManager {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicTabManager extends Components.AtomicTabManager {}


@ProxyCmp({
  inputs: ['label']
})
@Component({
  selector: 'atomic-table-element',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['label'],
})
export class AtomicTableElement {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicTableElement extends Components.AtomicTableElement {}


@ProxyCmp({
  inputs: ['count', 'value']
})
@Component({
  selector: 'atomic-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['count', 'value'],
})
export class AtomicText {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicText extends Components.AtomicText {}


@ProxyCmp({
  inputs: ['amount', 'label', 'period', 'unit']
})
@Component({
  selector: 'atomic-timeframe',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['amount', 'label', 'period', 'unit'],
})
export class AtomicTimeframe {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicTimeframe extends Components.AtomicTimeframe {}


@ProxyCmp({
  inputs: ['dependsOn', 'facetId', 'field', 'filterFacetCount', 'headingLevel', 'injectionDepth', 'isCollapsed', 'label', 'max', 'min', 'sortCriteria', 'tabsExcluded', 'tabsIncluded', 'withDatePicker']
})
@Component({
  selector: 'atomic-timeframe-facet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['dependsOn', 'facetId', 'field', 'filterFacetCount', 'headingLevel', 'injectionDepth', 'isCollapsed', 'label', 'max', 'min', 'sortCriteria', 'tabsExcluded', 'tabsIncluded', 'withDatePicker'],
})
export class AtomicTimeframeFacet {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicTimeframeFacet extends Components.AtomicTimeframeFacet {}



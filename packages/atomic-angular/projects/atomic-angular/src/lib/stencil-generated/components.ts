/* tslint:disable */
/* auto-generated angular directive proxies */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, NgZone } from '@angular/core';

import { ProxyCmp, proxyOutputs } from './angular-component-lib/utils';

import { Components } from '@coveo/atomic';


@ProxyCmp({defineCustomElementFn: defineCustomElementAtomicAriaLive})
@Component({standalone:false,
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


@ProxyCmp({defineCustomElementFn: defineCustomElementAtomicAutomaticFacet})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicAutomaticFacetGenerator})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicBreadbox})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicCategoryFacet})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicColorFacet})
@Component({standalone:false,
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
  inputs: ['facet', 'field', 'isCollapsed', 'summary']
, defineCustomElementFn: defineCustomElementAtomicCommerceCategoryFacet})
@Component({standalone:false,
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
  inputs: ['facet', 'field', 'isCollapsed', 'summary']
, defineCustomElementFn: defineCustomElementAtomicCommerceFacet})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicCommerceFacetNumberInput})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicCommerceFacets})
@Component({standalone:false,
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
  inputs: ['facet', 'field', 'isCollapsed', 'summary']
, defineCustomElementFn: defineCustomElementAtomicCommerceNumericFacet})
@Component({standalone:false,
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


@ProxyCmp({defineCustomElementFn: defineCustomElementAtomicCommerceQueryError})
@Component({standalone:false,
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
  inputs: ['collapseFacetsAfter', 'isOpen', 'openButton']
, defineCustomElementFn: defineCustomElementAtomicCommerceRefineModal})
@Component({standalone:false,
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
  inputs: ['facet', 'field', 'isCollapsed', 'summary']
, defineCustomElementFn: defineCustomElementAtomicCommerceTimeframeFacet})
@Component({standalone:false,
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
  inputs: ['automaticallyCorrectQuery', 'queryCorrectionMode']
, defineCustomElementFn: defineCustomElementAtomicDidYouMean})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicExternal})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicFacet})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicFacetManager})
@Component({standalone:false,
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
  inputs: ['ifDefined', 'ifNotDefined', 'mustMatch', 'mustNotMatch']
, defineCustomElementFn: defineCustomElementAtomicFieldCondition})
@Component({standalone:false,
  selector: 'atomic-field-condition',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['ifDefined', 'ifNotDefined', 'mustMatch', 'mustNotMatch'],
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
, defineCustomElementFn: defineCustomElementAtomicFoldedResultList})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicFormatCurrency})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicFormatNumber})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicFormatUnit})
@Component({standalone:false,
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
  inputs: ['answerConfigurationId', 'collapsible', 'fieldsToIncludeInCitations', 'maxCollapsedHeight', 'tabsExcluded', 'tabsIncluded', 'withToggle']
, defineCustomElementFn: defineCustomElementAtomicGeneratedAnswer})
@Component({standalone:false,
  selector: 'atomic-generated-answer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['answerConfigurationId', 'collapsible', 'fieldsToIncludeInCitations', 'maxCollapsedHeight', 'tabsExcluded', 'tabsIncluded', 'withToggle'],
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
, defineCustomElementFn: defineCustomElementAtomicHtml})
@Component({standalone:false,
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


@ProxyCmp({defineCustomElementFn: defineCustomElementAtomicLoadMoreResults})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicNoResults})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicNotifications})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicNumericFacet})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicNumericRange})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicPager})
@Component({standalone:false,
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


@ProxyCmp({defineCustomElementFn: defineCustomElementAtomicPopover})
@Component({standalone:false,
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
  inputs: ['fallback', 'field', 'label']
, defineCustomElementFn: defineCustomElementAtomicProductChildren})
@Component({standalone:false,
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
  inputs: ['field', 'isCollapsible', 'truncateAfter']
, defineCustomElementFn: defineCustomElementAtomicProductDescription})
@Component({standalone:false,
  selector: 'atomic-product-description',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['field', 'isCollapsible', 'truncateAfter'],
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
  inputs: ['isCollapsible', 'truncateAfter']
, defineCustomElementFn: defineCustomElementAtomicProductExcerpt})
@Component({standalone:false,
  selector: 'atomic-product-excerpt',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['isCollapsible', 'truncateAfter'],
})
export class AtomicProductExcerpt {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicProductExcerpt extends Components.AtomicProductExcerpt {}


@ProxyCmp({
  inputs: ['ifDefined', 'ifNotDefined', 'mustMatch', 'mustNotMatch']
, defineCustomElementFn: defineCustomElementAtomicProductFieldCondition})
@Component({standalone:false,
  selector: 'atomic-product-field-condition',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['ifDefined', 'ifNotDefined', 'mustMatch', 'mustNotMatch'],
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
, defineCustomElementFn: defineCustomElementAtomicProductImage})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicProductLink})
@Component({standalone:false,
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
  inputs: ['delimiter', 'field', 'maxValuesToDisplay']
, defineCustomElementFn: defineCustomElementAtomicProductMultiValueText})
@Component({standalone:false,
  selector: 'atomic-product-multi-value-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['delimiter', 'field', 'maxValuesToDisplay'],
})
export class AtomicProductMultiValueText {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicProductMultiValueText extends Components.AtomicProductMultiValueText {}


@ProxyCmp({
  inputs: ['field']
, defineCustomElementFn: defineCustomElementAtomicProductNumericFieldValue})
@Component({standalone:false,
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


@ProxyCmp({defineCustomElementFn: defineCustomElementAtomicProductPrice})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicProductRating})
@Component({standalone:false,
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


@ProxyCmp({defineCustomElementFn: defineCustomElementAtomicProductSectionActions})
@Component({standalone:false,
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


@ProxyCmp({defineCustomElementFn: defineCustomElementAtomicProductSectionBadges})
@Component({standalone:false,
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


@ProxyCmp({defineCustomElementFn: defineCustomElementAtomicProductSectionBottomMetadata})
@Component({standalone:false,
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


@ProxyCmp({defineCustomElementFn: defineCustomElementAtomicProductSectionChildren})
@Component({standalone:false,
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


@ProxyCmp({defineCustomElementFn: defineCustomElementAtomicProductSectionDescription})
@Component({standalone:false,
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


@ProxyCmp({defineCustomElementFn: defineCustomElementAtomicProductSectionEmphasized})
@Component({standalone:false,
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


@ProxyCmp({defineCustomElementFn: defineCustomElementAtomicProductSectionMetadata})
@Component({standalone:false,
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


@ProxyCmp({defineCustomElementFn: defineCustomElementAtomicProductSectionName})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicProductSectionVisual})
@Component({standalone:false,
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


@ProxyCmp({defineCustomElementFn: defineCustomElementAtomicQueryError})
@Component({standalone:false,
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


@ProxyCmp({defineCustomElementFn: defineCustomElementAtomicQuerySummary})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicQuickview})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicQuickviewModal})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicRatingFacet})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicRatingRangeFacet})
@Component({standalone:false,
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


@ProxyCmp({defineCustomElementFn: defineCustomElementAtomicRecsError})
@Component({standalone:false,
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
  methods: ['initialize', 'initializeWithRecommendationEngine', 'getRecommendations']
, defineCustomElementFn: defineCustomElementAtomicRecsInterface})
@Component({standalone:false,
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
  inputs: ['density', 'display', 'headingLevel', 'imageSize', 'label', 'numberOfRecommendations', 'numberOfRecommendationsPerPage', 'recommendation'],
  methods: ['setRenderFunction', 'previousPage', 'nextPage']
, defineCustomElementFn: defineCustomElementAtomicRecsList})
@Component({standalone:false,
  selector: 'atomic-recs-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['density', 'display', 'headingLevel', 'imageSize', 'label', 'numberOfRecommendations', 'numberOfRecommendationsPerPage', 'recommendation'],
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
  inputs: ['classes', 'content', 'density', 'display', 'imageSize', 'linkContent', 'result', 'stopPropagation']
, defineCustomElementFn: defineCustomElementAtomicRecsResult})
@Component({standalone:false,
  selector: 'atomic-recs-result',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['classes', 'content', 'density', 'display', 'imageSize', 'linkContent', 'result', 'stopPropagation'],
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
  inputs: ['conditions', 'ifDefined', 'ifNotDefined', 'mustMatch', 'mustNotMatch'],
  methods: ['getTemplate']
, defineCustomElementFn: defineCustomElementAtomicRecsResultTemplate})
@Component({standalone:false,
  selector: 'atomic-recs-result-template',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['conditions', 'ifDefined', 'ifNotDefined', 'mustMatch', 'mustNotMatch'],
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
, defineCustomElementFn: defineCustomElementAtomicRefineModal})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicRefineToggle})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicRelevanceInspector})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicResult})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicResultBadge})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicResultChildren})
@Component({standalone:false,
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
  inputs: ['conditions', 'mustMatch', 'mustNotMatch'],
  methods: ['getTemplate']
, defineCustomElementFn: defineCustomElementAtomicResultChildrenTemplate})
@Component({standalone:false,
  selector: 'atomic-result-children-template',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['conditions', 'mustMatch', 'mustNotMatch'],
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
, defineCustomElementFn: defineCustomElementAtomicResultDate})
@Component({standalone:false,
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


@ProxyCmp({defineCustomElementFn: defineCustomElementAtomicResultFieldsList})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicResultHtml})
@Component({standalone:false,
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


@ProxyCmp({defineCustomElementFn: defineCustomElementAtomicResultIcon})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicResultImage})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicResultLink})
@Component({standalone:false,
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
  inputs: ['density', 'display', 'imageSize', 'tabsExcluded', 'tabsIncluded'],
  methods: ['setRenderFunction']
, defineCustomElementFn: defineCustomElementAtomicResultList})
@Component({standalone:false,
  selector: 'atomic-result-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['density', 'display', 'imageSize', 'tabsExcluded', 'tabsIncluded'],
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
  inputs: ['field', 'fieldCount', 'localeKey']
, defineCustomElementFn: defineCustomElementAtomicResultLocalizedText})
@Component({standalone:false,
  selector: 'atomic-result-localized-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['field', 'fieldCount', 'localeKey'],
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
, defineCustomElementFn: defineCustomElementAtomicResultMultiValueText})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicResultNumber})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicResultPrintableUri})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicResultRating})
@Component({standalone:false,
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


@ProxyCmp({defineCustomElementFn: defineCustomElementAtomicResultSectionActions})
@Component({standalone:false,
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


@ProxyCmp({defineCustomElementFn: defineCustomElementAtomicResultSectionBadges})
@Component({standalone:false,
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


@ProxyCmp({defineCustomElementFn: defineCustomElementAtomicResultSectionBottomMetadata})
@Component({standalone:false,
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


@ProxyCmp({defineCustomElementFn: defineCustomElementAtomicResultSectionChildren})
@Component({standalone:false,
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


@ProxyCmp({defineCustomElementFn: defineCustomElementAtomicResultSectionEmphasized})
@Component({standalone:false,
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


@ProxyCmp({defineCustomElementFn: defineCustomElementAtomicResultSectionExcerpt})
@Component({standalone:false,
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


@ProxyCmp({defineCustomElementFn: defineCustomElementAtomicResultSectionTitle})
@Component({standalone:false,
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


@ProxyCmp({defineCustomElementFn: defineCustomElementAtomicResultSectionTitleMetadata})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicResultSectionVisual})
@Component({standalone:false,
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
  inputs: ['conditions', 'mustMatch', 'mustNotMatch'],
  methods: ['getTemplate']
, defineCustomElementFn: defineCustomElementAtomicResultTemplate})
@Component({standalone:false,
  selector: 'atomic-result-template',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['conditions', 'mustMatch', 'mustNotMatch'],
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
, defineCustomElementFn: defineCustomElementAtomicResultText})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicResultTimespan})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicResultsPerPage})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicSearchBox})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicSearchBoxInstantResults})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicSearchBoxQuerySuggestions})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicSearchBoxRecentQueries})
@Component({standalone:false,
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
  methods: ['initialize', 'initializeWithSearchEngine', 'executeFirstSearch']
, defineCustomElementFn: defineCustomElementAtomicSearchInterface})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicSearchLayout})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicSegmentedFacet})
@Component({standalone:false,
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


@ProxyCmp({defineCustomElementFn: defineCustomElementAtomicSegmentedFacetScrollable})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicSmartSnippet})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicSmartSnippetFeedbackModal})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicSmartSnippetSuggestions})
@Component({standalone:false,
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


@ProxyCmp({defineCustomElementFn: defineCustomElementAtomicSortDropdown})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicSortExpression})
@Component({standalone:false,
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
  inputs: ['expression', 'label', 'name']
, defineCustomElementFn: defineCustomElementAtomicTab})
@Component({standalone:false,
  selector: 'atomic-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['expression', 'label', 'name'],
})
export class AtomicTab {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicTab extends Components.AtomicTab {}


@ProxyCmp({
  inputs: ['clearFiltersOnTabChange']
, defineCustomElementFn: defineCustomElementAtomicTabManager})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicTableElement})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicText})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicTimeframe})
@Component({standalone:false,
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
, defineCustomElementFn: defineCustomElementAtomicTimeframeFacet})
@Component({standalone:false,
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

//#region Lit Declarations

@ProxyCmp({
  inputs: ['pathLimit'],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-commerce-breadbox') || customElements.define('atomic-commerce-breadbox', LitAtomicCommerceBreadbox);}
})
@Component({
  selector: 'atomic-commerce-breadbox',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['pathLimit']
})
export class AtomicCommerceBreadbox {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicCommerceBreadbox extends LitAtomicCommerceBreadbox {

}

@ProxyCmp({
  inputs: [],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-commerce-did-you-mean') || customElements.define('atomic-commerce-did-you-mean', LitAtomicCommerceDidYouMean);}
})
@Component({
  selector: 'atomic-commerce-did-you-mean',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: []
})
export class AtomicCommerceDidYouMean {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicCommerceDidYouMean extends LitAtomicCommerceDidYouMean {

}

@ProxyCmp({
  inputs: ['type', 'analytics', 'logLevel', 'i18n', 'language', 'engine', 'reflectStateInUrl', 'scrollContainer', 'languageAssetsPath', 'iconAssetsPath'],
  methods: ['toggleAnalytics', 'updateLanguage', 'updateIconAssetsPath', 'scrollToTop', 'initialize', 'initializeWithEngine', 'executeFirstRequest', 'getUpdateComplete'],
  defineCustomElementFn: () => {customElements.get('atomic-commerce-interface') || customElements.define('atomic-commerce-interface', LitAtomicCommerceInterface);}
})
@Component({
  selector: 'atomic-commerce-interface',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['type', 'analytics', 'logLevel', 'i18n', 'language', 'engine', 'reflectStateInUrl', 'scrollContainer', 'languageAssetsPath', 'iconAssetsPath']
})
export class AtomicCommerceInterface {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicCommerceInterface extends LitAtomicCommerceInterface {

}

@ProxyCmp({
  inputs: ['mobileBreakpoint'],
  methods: ['styles'],
  defineCustomElementFn: () => {customElements.get('atomic-commerce-layout') || customElements.define('atomic-commerce-layout', LitAtomicCommerceLayout);}
})
@Component({
  selector: 'atomic-commerce-layout',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['mobileBreakpoint']
})
export class AtomicCommerceLayout {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicCommerceLayout extends LitAtomicCommerceLayout {

}

@ProxyCmp({
  inputs: [],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-commerce-load-more-products') || customElements.define('atomic-commerce-load-more-products', LitAtomicCommerceLoadMoreProducts);}
})
@Component({
  selector: 'atomic-commerce-load-more-products',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: []
})
export class AtomicCommerceLoadMoreProducts {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicCommerceLoadMoreProducts extends LitAtomicCommerceLoadMoreProducts {

}

@ProxyCmp({
  inputs: [],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-commerce-no-products') || customElements.define('atomic-commerce-no-products', LitAtomicCommerceNoProducts);}
})
@Component({
  selector: 'atomic-commerce-no-products',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: []
})
export class AtomicCommerceNoProducts {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicCommerceNoProducts extends LitAtomicCommerceNoProducts {

}

@ProxyCmp({
  inputs: ['numberOfPages', 'previousButtonIcon', 'nextButtonIcon'],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-commerce-pager') || customElements.define('atomic-commerce-pager', LitAtomicCommercePager);}
})
@Component({
  selector: 'atomic-commerce-pager',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['numberOfPages', 'previousButtonIcon', 'nextButtonIcon']
})
export class AtomicCommercePager {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    proxyOutputs(this, this.el, ['atomic/scrollToTop']);
  }
}

export declare interface AtomicCommercePager extends LitAtomicCommercePager {
  'atomic/scrollToTop': EventEmitter<CustomEvent<any>>;
}

@ProxyCmp({
  inputs: ['density', 'display', 'imageSize', 'numberOfPlaceholders'],
  methods: ['setRenderFunction', 'initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-commerce-product-list') || customElements.define('atomic-commerce-product-list', LitAtomicCommerceProductList);}
})
@Component({
  selector: 'atomic-commerce-product-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['density', 'display', 'imageSize', 'numberOfPlaceholders']
})
export class AtomicCommerceProductList {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicCommerceProductList extends LitAtomicCommerceProductList {

}

@ProxyCmp({
  inputs: ['choicesDisplayed', 'initialChoice'],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-commerce-products-per-page') || customElements.define('atomic-commerce-products-per-page', LitAtomicCommerceProductsPerPage);}
})
@Component({
  selector: 'atomic-commerce-products-per-page',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['choicesDisplayed', 'initialChoice']
})
export class AtomicCommerceProductsPerPage {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    proxyOutputs(this, this.el, ['atomic/scrollToTop']);
  }
}

export declare interface AtomicCommerceProductsPerPage extends LitAtomicCommerceProductsPerPage {
  'atomic/scrollToTop': EventEmitter<CustomEvent<any>>;
}

@ProxyCmp({
  inputs: [],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-commerce-query-summary') || customElements.define('atomic-commerce-query-summary', LitAtomicCommerceQuerySummary);}
})
@Component({
  selector: 'atomic-commerce-query-summary',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: []
})
export class AtomicCommerceQuerySummary {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicCommerceQuerySummary extends LitAtomicCommerceQuerySummary {

}

@ProxyCmp({
  inputs: ['i18n', 'engine', 'scrollContainer', 'languageAssetsPath', 'iconAssetsPath', 'language', 'analytics'],
  methods: ['initializeWithEngine', 'updateLocale', 'toggleAnalytics', 'updateIconAssetsPath', 'updateLanguage', 'getUpdateComplete'],
  defineCustomElementFn: () => {customElements.get('atomic-commerce-recommendation-interface') || customElements.define('atomic-commerce-recommendation-interface', LitAtomicCommerceRecommendationInterface);}
})
@Component({
  selector: 'atomic-commerce-recommendation-interface',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['i18n', 'engine', 'scrollContainer', 'languageAssetsPath', 'iconAssetsPath', 'language', 'analytics']
})
export class AtomicCommerceRecommendationInterface {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicCommerceRecommendationInterface extends LitAtomicCommerceRecommendationInterface {

}

@ProxyCmp({
  inputs: ['slotId', 'productId', 'display', 'density', 'imageSize', 'productsPerPage', 'headingLevel'],
  methods: ['watchNumberOfRecommendationsPerPage', 'setRenderFunction', 'previousPage', 'nextPage', 'initialize', 'initBindings'],
  defineCustomElementFn: () => {customElements.get('atomic-commerce-recommendation-list') || customElements.define('atomic-commerce-recommendation-list', LitAtomicCommerceRecommendationList);}
})
@Component({
  selector: 'atomic-commerce-recommendation-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['slotId', 'productId', 'display', 'density', 'imageSize', 'productsPerPage', 'headingLevel']
})
export class AtomicCommerceRecommendationList {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicCommerceRecommendationList extends LitAtomicCommerceRecommendationList {

}

@ProxyCmp({
  inputs: [],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-commerce-refine-toggle') || customElements.define('atomic-commerce-refine-toggle', LitAtomicCommerceRefineToggle);}
})
@Component({
  selector: 'atomic-commerce-refine-toggle',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: []
})
export class AtomicCommerceRefineToggle {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicCommerceRefineToggle extends LitAtomicCommerceRefineToggle {

}

@ProxyCmp({
  inputs: ['density', 'imageSize', 'ariaLabelGenerator'],
  methods: ['setRenderFunction', 'initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-commerce-search-box-instant-products') || customElements.define('atomic-commerce-search-box-instant-products', LitAtomicCommerceSearchBoxInstantProducts);}
})
@Component({
  selector: 'atomic-commerce-search-box-instant-products',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['density', 'imageSize', 'ariaLabelGenerator']
})
export class AtomicCommerceSearchBoxInstantProducts {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicCommerceSearchBoxInstantProducts extends LitAtomicCommerceSearchBoxInstantProducts {

}

@ProxyCmp({
  inputs: ['icon', 'maxWithQuery', 'maxWithoutQuery'],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-commerce-search-box-query-suggestions') || customElements.define('atomic-commerce-search-box-query-suggestions', LitAtomicCommerceSearchBoxQuerySuggestions);}
})
@Component({
  selector: 'atomic-commerce-search-box-query-suggestions',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['icon', 'maxWithQuery', 'maxWithoutQuery']
})
export class AtomicCommerceSearchBoxQuerySuggestions {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicCommerceSearchBoxQuerySuggestions extends LitAtomicCommerceSearchBoxQuerySuggestions {

}

@ProxyCmp({
  inputs: ['icon', 'maxWithQuery', 'maxWithoutQuery'],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-commerce-search-box-recent-queries') || customElements.define('atomic-commerce-search-box-recent-queries', LitAtomicCommerceSearchBoxRecentQueries);}
})
@Component({
  selector: 'atomic-commerce-search-box-recent-queries',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['icon', 'maxWithQuery', 'maxWithoutQuery']
})
export class AtomicCommerceSearchBoxRecentQueries {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicCommerceSearchBoxRecentQueries extends LitAtomicCommerceSearchBoxRecentQueries {

}

@ProxyCmp({
  inputs: ['numberOfQueries', 'redirectionUrl', 'suggestionTimeout', 'suggestionDelay', 'disableSearch', 'minimumQueryLength', 'clearFilters'],
  methods: ['initialize', 'watchRedirectionUrl'],
  defineCustomElementFn: () => {customElements.get('atomic-commerce-search-box') || customElements.define('atomic-commerce-search-box', LitAtomicCommerceSearchBox);}
})
@Component({
  selector: 'atomic-commerce-search-box',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['numberOfQueries', 'redirectionUrl', 'suggestionTimeout', 'suggestionDelay', 'disableSearch', 'minimumQueryLength', 'clearFilters']
})
export class AtomicCommerceSearchBox {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    proxyOutputs(this, this.el, ['redirect']);
  }
}

export declare interface AtomicCommerceSearchBox extends LitAtomicCommerceSearchBox {
  'redirect': EventEmitter<CustomEvent<any>>;
}

@ProxyCmp({
  inputs: [],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-commerce-sort-dropdown') || customElements.define('atomic-commerce-sort-dropdown', LitAtomicCommerceSortDropdown);}
})
@Component({
  selector: 'atomic-commerce-sort-dropdown',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: []
})
export class AtomicCommerceSortDropdown {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicCommerceSortDropdown extends LitAtomicCommerceSortDropdown {

}

@ProxyCmp({
  inputs: ['value', 'count'],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-commerce-text') || customElements.define('atomic-commerce-text', LitAtomicCommerceText);}
})
@Component({
  selector: 'atomic-commerce-text',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['value', 'count']
})
export class AtomicCommerceText {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicCommerceText extends LitAtomicCommerceText {

}

@ProxyCmp({
  inputs: ['conditions', 'mustMatch', 'mustNotMatch'],
  methods: ['getTemplate'],
  defineCustomElementFn: () => {customElements.get('atomic-product-template') || customElements.define('atomic-product-template', LitAtomicProductTemplate);}
})
@Component({
  selector: 'atomic-product-template',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['conditions', 'mustMatch', 'mustNotMatch']
})
export class AtomicProductTemplate {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicProductTemplate extends LitAtomicProductTemplate {

}

@ProxyCmp({
  inputs: ['field', 'shouldHighlight', 'default'],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-product-text') || customElements.define('atomic-product-text', LitAtomicProductText);}
})
@Component({
  selector: 'atomic-product-text',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['field', 'shouldHighlight', 'default']
})
export class AtomicProductText {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicProductText extends LitAtomicProductText {

}

@ProxyCmp({
  inputs: ['stopPropagation', 'product', 'interactiveProduct', 'store', 'content', 'linkContent', 'display', 'density', 'imageSize', 'classes'],
  methods: ['getUpdateComplete'],
  defineCustomElementFn: () => {customElements.get('atomic-product') || customElements.define('atomic-product', LitAtomicProduct);}
})
@Component({
  selector: 'atomic-product',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['stopPropagation', 'product', 'interactiveProduct', 'store', 'content', 'linkContent', 'display', 'density', 'imageSize', 'classes']
})
export class AtomicProduct {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicProduct extends LitAtomicProduct {

}

@ProxyCmp({
  inputs: ['element', 'error'],
  methods: [],
  defineCustomElementFn: () => {customElements.get('atomic-component-error') || customElements.define('atomic-component-error', LitAtomicComponentError);}
})
@Component({
  selector: 'atomic-component-error',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['element', 'error']
})
export class AtomicComponentError {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicComponentError extends LitAtomicComponentError {

}

@ProxyCmp({
  inputs: ['icon'],
  methods: ['updateIcon', 'initialize', 'initBindings'],
  defineCustomElementFn: () => {customElements.get('atomic-icon') || customElements.define('atomic-icon', LitAtomicIcon);}
})
@Component({
  selector: 'atomic-icon',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['icon']
})
export class AtomicIcon {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicIcon extends LitAtomicIcon {

}

@ProxyCmp({
  inputs: ['section', 'minWidth', 'maxWidth'],
  methods: [],
  defineCustomElementFn: () => {customElements.get('atomic-layout-section') || customElements.define('atomic-layout-section', LitAtomicLayoutSection);}
})
@Component({
  selector: 'atomic-layout-section',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['section', 'minWidth', 'maxWidth']
})
export class AtomicLayoutSection {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicLayoutSection extends LitAtomicLayoutSection {

}

import {AtomicCommerceBreadbox as LitAtomicCommerceBreadbox, AtomicCommerceDidYouMean as LitAtomicCommerceDidYouMean, AtomicCommerceInterface as LitAtomicCommerceInterface, AtomicCommerceLayout as LitAtomicCommerceLayout, AtomicCommerceLoadMoreProducts as LitAtomicCommerceLoadMoreProducts, AtomicCommerceNoProducts as LitAtomicCommerceNoProducts, AtomicCommercePager as LitAtomicCommercePager, AtomicCommerceProductList as LitAtomicCommerceProductList, AtomicCommerceProductsPerPage as LitAtomicCommerceProductsPerPage, AtomicCommerceQuerySummary as LitAtomicCommerceQuerySummary, AtomicCommerceRecommendationInterface as LitAtomicCommerceRecommendationInterface, AtomicCommerceRecommendationList as LitAtomicCommerceRecommendationList, AtomicCommerceRefineToggle as LitAtomicCommerceRefineToggle, AtomicCommerceSearchBox as LitAtomicCommerceSearchBox, AtomicCommerceSearchBoxInstantProducts as LitAtomicCommerceSearchBoxInstantProducts, AtomicCommerceSearchBoxQuerySuggestions as LitAtomicCommerceSearchBoxQuerySuggestions, AtomicCommerceSearchBoxRecentQueries as LitAtomicCommerceSearchBoxRecentQueries, AtomicCommerceSortDropdown as LitAtomicCommerceSortDropdown, AtomicCommerceText as LitAtomicCommerceText, AtomicComponentError as LitAtomicComponentError, AtomicIcon as LitAtomicIcon, AtomicLayoutSection as LitAtomicLayoutSection, AtomicProduct as LitAtomicProduct, AtomicProductTemplate as LitAtomicProductTemplate, AtomicProductText as LitAtomicProductText} from '@coveo/atomic/components';

import {defineCustomElementAtomicAriaLive, defineCustomElementAtomicAutomaticFacet, defineCustomElementAtomicAutomaticFacetGenerator, defineCustomElementAtomicBreadbox, defineCustomElementAtomicCategoryFacet, defineCustomElementAtomicColorFacet, defineCustomElementAtomicCommerceCategoryFacet, defineCustomElementAtomicCommerceFacet, defineCustomElementAtomicCommerceFacetNumberInput, defineCustomElementAtomicCommerceFacets, defineCustomElementAtomicCommerceNumericFacet, defineCustomElementAtomicCommerceQueryError, defineCustomElementAtomicCommerceRefineModal, defineCustomElementAtomicCommerceTimeframeFacet, defineCustomElementAtomicDidYouMean, defineCustomElementAtomicExternal, defineCustomElementAtomicFacet, defineCustomElementAtomicFacetManager, defineCustomElementAtomicFieldCondition, defineCustomElementAtomicFoldedResultList, defineCustomElementAtomicFormatCurrency, defineCustomElementAtomicFormatNumber, defineCustomElementAtomicFormatUnit, defineCustomElementAtomicGeneratedAnswer, defineCustomElementAtomicHtml, defineCustomElementAtomicLoadMoreResults, defineCustomElementAtomicNoResults, defineCustomElementAtomicNotifications, defineCustomElementAtomicNumericFacet, defineCustomElementAtomicNumericRange, defineCustomElementAtomicPager, defineCustomElementAtomicPopover, defineCustomElementAtomicProductChildren, defineCustomElementAtomicProductDescription, defineCustomElementAtomicProductExcerpt, defineCustomElementAtomicProductFieldCondition, defineCustomElementAtomicProductImage, defineCustomElementAtomicProductLink, defineCustomElementAtomicProductMultiValueText, defineCustomElementAtomicProductNumericFieldValue, defineCustomElementAtomicProductPrice, defineCustomElementAtomicProductRating, defineCustomElementAtomicProductSectionActions, defineCustomElementAtomicProductSectionBadges, defineCustomElementAtomicProductSectionBottomMetadata, defineCustomElementAtomicProductSectionChildren, defineCustomElementAtomicProductSectionDescription, defineCustomElementAtomicProductSectionEmphasized, defineCustomElementAtomicProductSectionMetadata, defineCustomElementAtomicProductSectionName, defineCustomElementAtomicProductSectionVisual, defineCustomElementAtomicQueryError, defineCustomElementAtomicQuerySummary, defineCustomElementAtomicQuickview, defineCustomElementAtomicQuickviewModal, defineCustomElementAtomicRatingFacet, defineCustomElementAtomicRatingRangeFacet, defineCustomElementAtomicRecsError, defineCustomElementAtomicRecsInterface, defineCustomElementAtomicRecsList, defineCustomElementAtomicRecsResult, defineCustomElementAtomicRecsResultTemplate, defineCustomElementAtomicRefineModal, defineCustomElementAtomicRefineToggle, defineCustomElementAtomicRelevanceInspector, defineCustomElementAtomicResult, defineCustomElementAtomicResultBadge, defineCustomElementAtomicResultChildren, defineCustomElementAtomicResultChildrenTemplate, defineCustomElementAtomicResultDate, defineCustomElementAtomicResultFieldsList, defineCustomElementAtomicResultHtml, defineCustomElementAtomicResultIcon, defineCustomElementAtomicResultImage, defineCustomElementAtomicResultLink, defineCustomElementAtomicResultList, defineCustomElementAtomicResultLocalizedText, defineCustomElementAtomicResultMultiValueText, defineCustomElementAtomicResultNumber, defineCustomElementAtomicResultPrintableUri, defineCustomElementAtomicResultRating, defineCustomElementAtomicResultSectionActions, defineCustomElementAtomicResultSectionBadges, defineCustomElementAtomicResultSectionBottomMetadata, defineCustomElementAtomicResultSectionChildren, defineCustomElementAtomicResultSectionEmphasized, defineCustomElementAtomicResultSectionExcerpt, defineCustomElementAtomicResultSectionTitle, defineCustomElementAtomicResultSectionTitleMetadata, defineCustomElementAtomicResultSectionVisual, defineCustomElementAtomicResultTemplate, defineCustomElementAtomicResultText, defineCustomElementAtomicResultTimespan, defineCustomElementAtomicResultsPerPage, defineCustomElementAtomicSearchBox, defineCustomElementAtomicSearchBoxInstantResults, defineCustomElementAtomicSearchBoxQuerySuggestions, defineCustomElementAtomicSearchBoxRecentQueries, defineCustomElementAtomicSearchInterface, defineCustomElementAtomicSearchLayout, defineCustomElementAtomicSegmentedFacet, defineCustomElementAtomicSegmentedFacetScrollable, defineCustomElementAtomicSmartSnippet, defineCustomElementAtomicSmartSnippetFeedbackModal, defineCustomElementAtomicSmartSnippetSuggestions, defineCustomElementAtomicSortDropdown, defineCustomElementAtomicSortExpression, defineCustomElementAtomicTab, defineCustomElementAtomicTabManager, defineCustomElementAtomicTableElement, defineCustomElementAtomicText, defineCustomElementAtomicTimeframe, defineCustomElementAtomicTimeframeFacet} from '@coveo/atomic/components';
//#endregion Lit Declarations
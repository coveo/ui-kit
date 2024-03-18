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
  inputs: ['basePath', 'delimitingCharacter', 'dependsOn', 'facetId', 'field', 'filterByBasePath', 'filterFacetCount', 'headingLevel', 'injectionDepth', 'isCollapsed', 'label', 'numberOfValues', 'sortCriteria', 'withSearch']
})
@Component({
  selector: 'atomic-category-facet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['basePath', 'delimitingCharacter', 'dependsOn', 'facetId', 'field', 'filterByBasePath', 'filterFacetCount', 'headingLevel', 'injectionDepth', 'isCollapsed', 'label', 'numberOfValues', 'sortCriteria', 'withSearch'],
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
  inputs: ['allowedValues', 'customSort', 'dependsOn', 'displayValuesAs', 'facetId', 'field', 'filterFacetCount', 'headingLevel', 'injectionDepth', 'isCollapsed', 'label', 'numberOfValues', 'resultsMustMatch', 'sortCriteria', 'withSearch']
})
@Component({
  selector: 'atomic-color-facet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['allowedValues', 'customSort', 'dependsOn', 'displayValuesAs', 'facetId', 'field', 'filterFacetCount', 'headingLevel', 'injectionDepth', 'isCollapsed', 'label', 'numberOfValues', 'resultsMustMatch', 'sortCriteria', 'withSearch'],
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
  inputs: ['selector']
})
@Component({
  selector: 'atomic-external',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['selector'],
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
  inputs: ['allowedValues', 'customSort', 'dependsOn', 'displayValuesAs', 'enableExclusion', 'facetId', 'field', 'filterFacetCount', 'headingLevel', 'injectionDepth', 'isCollapsed', 'label', 'numberOfValues', 'resultsMustMatch', 'sortCriteria', 'withSearch']
})
@Component({
  selector: 'atomic-facet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['allowedValues', 'customSort', 'dependsOn', 'displayValuesAs', 'enableExclusion', 'facetId', 'field', 'filterFacetCount', 'headingLevel', 'injectionDepth', 'isCollapsed', 'label', 'numberOfValues', 'resultsMustMatch', 'sortCriteria', 'withSearch'],
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
  inputs: ['conditions', 'ifDefined', 'ifNotDefined']
})
@Component({
  selector: 'atomic-field-condition',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['conditions', 'ifDefined', 'ifNotDefined'],
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
  inputs: ['childField', 'collectionField', 'density', 'imageSize', 'numberOfFoldedResults', 'parentField'],
  methods: ['setRenderFunction']
})
@Component({
  selector: 'atomic-folded-result-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['childField', 'collectionField', 'density', 'imageSize', 'numberOfFoldedResults', 'parentField'],
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
  inputs: ['answerStyle']
})
@Component({
  selector: 'atomic-generated-answer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['answerStyle'],
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
  inputs: ['label']
})
@Component({
  selector: 'atomic-load-more-children-results',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['label'],
})
export class AtomicLoadMoreChildrenResults {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicLoadMoreChildrenResults extends Components.AtomicLoadMoreChildrenResults {}


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
  inputs: ['dependsOn', 'displayValuesAs', 'facetId', 'field', 'filterFacetCount', 'headingLevel', 'injectionDepth', 'isCollapsed', 'label', 'numberOfValues', 'rangeAlgorithm', 'sortCriteria', 'withInput']
})
@Component({
  selector: 'atomic-numeric-facet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['dependsOn', 'displayValuesAs', 'facetId', 'field', 'filterFacetCount', 'headingLevel', 'injectionDepth', 'isCollapsed', 'label', 'numberOfValues', 'rangeAlgorithm', 'sortCriteria', 'withInput'],
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
  inputs: ['dependsOn', 'displayValuesAs', 'facetId', 'field', 'filterFacetCount', 'headingLevel', 'icon', 'injectionDepth', 'isCollapsed', 'label', 'maxValueInIndex', 'minValueInIndex', 'numberOfIntervals']
})
@Component({
  selector: 'atomic-rating-facet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['dependsOn', 'displayValuesAs', 'facetId', 'field', 'filterFacetCount', 'headingLevel', 'icon', 'injectionDepth', 'isCollapsed', 'label', 'maxValueInIndex', 'minValueInIndex', 'numberOfIntervals'],
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
  inputs: ['dependsOn', 'facetId', 'field', 'filterFacetCount', 'headingLevel', 'icon', 'injectionDepth', 'isCollapsed', 'label', 'maxValueInIndex', 'minValueInIndex', 'numberOfIntervals']
})
@Component({
  selector: 'atomic-rating-range-facet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['dependsOn', 'facetId', 'field', 'filterFacetCount', 'headingLevel', 'icon', 'injectionDepth', 'isCollapsed', 'label', 'maxValueInIndex', 'minValueInIndex', 'numberOfIntervals'],
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
  inputs: ['analytics', 'engine', 'fieldsToInclude', 'i18n', 'iconAssetsPath', 'language', 'languageAssetsPath', 'localizationCompatibilityVersion', 'logLevel', 'pipeline', 'searchHub', 'timezone'],
  methods: ['initialize', 'initializeWithRecommendationEngine', 'getRecommendations', 'getOrganizationEndpoints']
})
@Component({
  selector: 'atomic-recs-interface',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['analytics', 'engine', 'fieldsToInclude', 'i18n', 'iconAssetsPath', 'language', 'languageAssetsPath', 'localizationCompatibilityVersion', 'logLevel', 'pipeline', 'searchHub', 'timezone'],
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
  inputs: ['classes', 'content', 'density', 'display', 'imageSize', 'result', 'stopPropagation']
})
@Component({
  selector: 'atomic-result',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['classes', 'content', 'density', 'display', 'imageSize', 'result', 'stopPropagation'],
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
  inputs: ['fallback', 'field']
})
@Component({
  selector: 'atomic-result-image',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['fallback', 'field'],
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
  inputs: ['density', 'display', 'gridCellLinkTarget', 'imageSize'],
  methods: ['setRenderFunction']
})
@Component({
  selector: 'atomic-result-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['density', 'display', 'gridCellLinkTarget', 'imageSize'],
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
  inputs: ['clearFilters', 'disableSearch', 'enableQuerySyntax', 'minimumQueryLength', 'numberOfQueries', 'redirectionUrl', 'suggestionDelay', 'suggestionTimeout', 'textarea']
})
@Component({
  selector: 'atomic-search-box',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['clearFilters', 'disableSearch', 'enableQuerySyntax', 'minimumQueryLength', 'numberOfQueries', 'redirectionUrl', 'suggestionDelay', 'suggestionTimeout', 'textarea'],
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
  inputs: ['analytics', 'enableRelevanceInspector', 'engine', 'fieldsToInclude', 'i18n', 'iconAssetsPath', 'language', 'languageAssetsPath', 'localizationCompatibilityVersion', 'logLevel', 'pipeline', 'reflectStateInUrl', 'scrollContainer', 'searchHub', 'timezone'],
  methods: ['initialize', 'initializeWithSearchEngine', 'executeFirstSearch', 'getOrganizationEndpoints']
})
@Component({
  selector: 'atomic-search-interface',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['analytics', 'enableRelevanceInspector', 'engine', 'fieldsToInclude', 'i18n', 'iconAssetsPath', 'language', 'languageAssetsPath', 'localizationCompatibilityVersion', 'logLevel', 'pipeline', 'reflectStateInUrl', 'scrollContainer', 'searchHub', 'timezone'],
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
  inputs: ['allowedValues', 'customSort', 'dependsOn', 'facetId', 'field', 'filterFacetCount', 'injectionDepth', 'label', 'numberOfValues', 'sortCriteria']
})
@Component({
  selector: 'atomic-segmented-facet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['allowedValues', 'customSort', 'dependsOn', 'facetId', 'field', 'filterFacetCount', 'injectionDepth', 'label', 'numberOfValues', 'sortCriteria'],
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
  inputs: ['collapsedHeight', 'headingLevel', 'maximumHeight', 'snippetCollapsedHeight', 'snippetMaximumHeight', 'snippetStyle']
})
@Component({
  selector: 'atomic-smart-snippet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['collapsedHeight', 'headingLevel', 'maximumHeight', 'snippetCollapsedHeight', 'snippetMaximumHeight', 'snippetStyle'],
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
  inputs: ['expression', 'label']
})
@Component({
  selector: 'atomic-sort-expression',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['expression', 'label'],
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
  inputs: ['dependsOn', 'facetId', 'field', 'filterFacetCount', 'headingLevel', 'injectionDepth', 'isCollapsed', 'label', 'max', 'min', 'sortCriteria', 'withDatePicker']
})
@Component({
  selector: 'atomic-timeframe-facet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['dependsOn', 'facetId', 'field', 'filterFacetCount', 'headingLevel', 'injectionDepth', 'isCollapsed', 'label', 'max', 'min', 'sortCriteria', 'withDatePicker'],
})
export class AtomicTimeframeFacet {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicTimeframeFacet extends Components.AtomicTimeframeFacet {}



/* tslint:disable */
/* auto-generated angular directive proxies */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, NgZone } from '@angular/core';
import { ProxyCmp, proxyOutputs } from './angular-component-lib/utils';

import { Components } from '@coveo/atomic';




export declare interface AtomicBreadbox extends Components.AtomicBreadbox {}

@ProxyCmp({
  defineCustomElementFn: undefined
})
@Component({
  selector: 'atomic-breadbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class AtomicBreadbox {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicCategoryFacet extends Components.AtomicCategoryFacet {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['basePath', 'delimitingCharacter', 'facetId', 'field', 'filterByBasePath', 'filterFacetCount', 'injectionDepth', 'isCollapsed', 'label', 'numberOfValues', 'sortCriteria', 'withSearch']
})
@Component({
  selector: 'atomic-category-facet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['basePath', 'delimitingCharacter', 'facetId', 'field', 'filterByBasePath', 'filterFacetCount', 'injectionDepth', 'isCollapsed', 'label', 'numberOfValues', 'sortCriteria', 'withSearch']
})
export class AtomicCategoryFacet {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicColorFacet extends Components.AtomicColorFacet {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['displayValuesAs', 'facetId', 'field', 'filterFacetCount', 'injectionDepth', 'isCollapsed', 'label', 'numberOfValues', 'sortCriteria', 'withSearch']
})
@Component({
  selector: 'atomic-color-facet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['displayValuesAs', 'facetId', 'field', 'filterFacetCount', 'injectionDepth', 'isCollapsed', 'label', 'numberOfValues', 'sortCriteria', 'withSearch']
})
export class AtomicColorFacet {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicComponentError extends Components.AtomicComponentError {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['element', 'error']
})
@Component({
  selector: 'atomic-component-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['element', 'error']
})
export class AtomicComponentError {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicDidYouMean extends Components.AtomicDidYouMean {}

@ProxyCmp({
  defineCustomElementFn: undefined
})
@Component({
  selector: 'atomic-did-you-mean',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class AtomicDidYouMean {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicExternal extends Components.AtomicExternal {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['selector']
})
@Component({
  selector: 'atomic-external',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['selector']
})
export class AtomicExternal {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicFacet extends Components.AtomicFacet {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['displayValuesAs', 'facetId', 'field', 'filterFacetCount', 'injectionDepth', 'isCollapsed', 'label', 'numberOfValues', 'sortCriteria', 'withSearch']
})
@Component({
  selector: 'atomic-facet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['displayValuesAs', 'facetId', 'field', 'filterFacetCount', 'injectionDepth', 'isCollapsed', 'label', 'numberOfValues', 'sortCriteria', 'withSearch']
})
export class AtomicFacet {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicFacetManager extends Components.AtomicFacetManager {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['collapseFacetsAfter']
})
@Component({
  selector: 'atomic-facet-manager',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['collapseFacetsAfter']
})
export class AtomicFacetManager {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicFieldCondition extends Components.AtomicFieldCondition {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['conditions', 'ifDefined', 'ifNotDefined']
})
@Component({
  selector: 'atomic-field-condition',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['conditions', 'ifDefined', 'ifNotDefined']
})
export class AtomicFieldCondition {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicFormatCurrency extends Components.AtomicFormatCurrency {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['currency']
})
@Component({
  selector: 'atomic-format-currency',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['currency']
})
export class AtomicFormatCurrency {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicFormatNumber extends Components.AtomicFormatNumber {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['maximumFractionDigits', 'maximumSignificantDigits', 'minimumFractionDigits', 'minimumIntegerDigits', 'minimumSignificantDigits']
})
@Component({
  selector: 'atomic-format-number',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['maximumFractionDigits', 'maximumSignificantDigits', 'minimumFractionDigits', 'minimumIntegerDigits', 'minimumSignificantDigits']
})
export class AtomicFormatNumber {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicFormatUnit extends Components.AtomicFormatUnit {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['unit', 'unitDisplay']
})
@Component({
  selector: 'atomic-format-unit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['unit', 'unitDisplay']
})
export class AtomicFormatUnit {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicFrequentlyBoughtTogether extends Components.AtomicFrequentlyBoughtTogether {}

@ProxyCmp({
  defineCustomElementFn: undefined
})
@Component({
  selector: 'atomic-frequently-bought-together',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class AtomicFrequentlyBoughtTogether {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicIcon extends Components.AtomicIcon {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['icon']
})
@Component({
  selector: 'atomic-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['icon']
})
export class AtomicIcon {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicLoadMoreResults extends Components.AtomicLoadMoreResults {}

@ProxyCmp({
  defineCustomElementFn: undefined
})
@Component({
  selector: 'atomic-load-more-results',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class AtomicLoadMoreResults {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicNoResults extends Components.AtomicNoResults {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['enableCancelLastAction']
})
@Component({
  selector: 'atomic-no-results',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['enableCancelLastAction']
})
export class AtomicNoResults {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicNumericFacet extends Components.AtomicNumericFacet {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['displayValuesAs', 'facetId', 'field', 'filterFacetCount', 'injectionDepth', 'isCollapsed', 'label', 'numberOfValues', 'rangeAlgorithm', 'sortCriteria', 'withInput']
})
@Component({
  selector: 'atomic-numeric-facet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['displayValuesAs', 'facetId', 'field', 'filterFacetCount', 'injectionDepth', 'isCollapsed', 'label', 'numberOfValues', 'rangeAlgorithm', 'sortCriteria', 'withInput']
})
export class AtomicNumericFacet {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicNumericRange extends Components.AtomicNumericRange {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['end', 'endInclusive', 'label', 'start']
})
@Component({
  selector: 'atomic-numeric-range',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['end', 'endInclusive', 'label', 'start']
})
export class AtomicNumericRange {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicPager extends Components.AtomicPager {
  /**
   *  
   */
  'atomic/scrollToTop': EventEmitter<CustomEvent<any>>;

}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['numberOfPages']
})
@Component({
  selector: 'atomic-pager',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['numberOfPages']
})
export class AtomicPager {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
    proxyOutputs(this, this.el, ['atomic/scrollToTop']);
  }
}


export declare interface AtomicQueryError extends Components.AtomicQueryError {}

@ProxyCmp({
  defineCustomElementFn: undefined
})
@Component({
  selector: 'atomic-query-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class AtomicQueryError {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicQuerySummary extends Components.AtomicQuerySummary {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['enableDuration']
})
@Component({
  selector: 'atomic-query-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['enableDuration']
})
export class AtomicQuerySummary {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicRatingFacet extends Components.AtomicRatingFacet {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['displayValuesAs', 'facetId', 'field', 'filterFacetCount', 'icon', 'injectionDepth', 'isCollapsed', 'label', 'maxValueInIndex', 'minValueInIndex', 'numberOfIntervals']
})
@Component({
  selector: 'atomic-rating-facet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['displayValuesAs', 'facetId', 'field', 'filterFacetCount', 'icon', 'injectionDepth', 'isCollapsed', 'label', 'maxValueInIndex', 'minValueInIndex', 'numberOfIntervals']
})
export class AtomicRatingFacet {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicRatingRangeFacet extends Components.AtomicRatingRangeFacet {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['facetId', 'field', 'filterFacetCount', 'icon', 'injectionDepth', 'isCollapsed', 'label', 'maxValueInIndex', 'minValueInIndex', 'numberOfIntervals']
})
@Component({
  selector: 'atomic-rating-range-facet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['facetId', 'field', 'filterFacetCount', 'icon', 'injectionDepth', 'isCollapsed', 'label', 'maxValueInIndex', 'minValueInIndex', 'numberOfIntervals']
})
export class AtomicRatingRangeFacet {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicRefineModal extends Components.AtomicRefineModal {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['modalStatus', 'openButton']
})
@Component({
  selector: 'atomic-refine-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['modalStatus', 'openButton']
})
export class AtomicRefineModal {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicRefineToggle extends Components.AtomicRefineToggle {}

@ProxyCmp({
  defineCustomElementFn: undefined
})
@Component({
  selector: 'atomic-refine-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class AtomicRefineToggle {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicRelevanceInspector extends Components.AtomicRelevanceInspector {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['bindings']
})
@Component({
  selector: 'atomic-relevance-inspector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['bindings']
})
export class AtomicRelevanceInspector {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResult extends Components.AtomicResult {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['content', 'density', 'display', 'engine', 'image', 'imageSize', 'result']
})
@Component({
  selector: 'atomic-result',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['content', 'density', 'display', 'engine', 'image', 'imageSize', 'result']
})
export class AtomicResult {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultBadge extends Components.AtomicResultBadge {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['field', 'icon', 'label']
})
@Component({
  selector: 'atomic-result-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['field', 'icon', 'label']
})
export class AtomicResultBadge {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultDate extends Components.AtomicResultDate {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['field', 'format']
})
@Component({
  selector: 'atomic-result-date',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['field', 'format']
})
export class AtomicResultDate {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultFieldsList extends Components.AtomicResultFieldsList {}

@ProxyCmp({
  defineCustomElementFn: undefined
})
@Component({
  selector: 'atomic-result-fields-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class AtomicResultFieldsList {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultIcon extends Components.AtomicResultIcon {}

@ProxyCmp({
  defineCustomElementFn: undefined
})
@Component({
  selector: 'atomic-result-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class AtomicResultIcon {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultImage extends Components.AtomicResultImage {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['field']
})
@Component({
  selector: 'atomic-result-image',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['field']
})
export class AtomicResultImage {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultLink extends Components.AtomicResultLink {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['target']
})
@Component({
  selector: 'atomic-result-link',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['target']
})
export class AtomicResultLink {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultList extends Components.AtomicResultList {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['density', 'display', 'fieldsToInclude', 'image', 'imageSize'],
  methods: ['setRenderFunction']
})
@Component({
  selector: 'atomic-result-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['density', 'display', 'fieldsToInclude', 'image', 'imageSize']
})
export class AtomicResultList {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultMultiValueText extends Components.AtomicResultMultiValueText {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['delimiter', 'field', 'maxValuesToDisplay']
})
@Component({
  selector: 'atomic-result-multi-value-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['delimiter', 'field', 'maxValuesToDisplay']
})
export class AtomicResultMultiValueText {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultNumber extends Components.AtomicResultNumber {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['field']
})
@Component({
  selector: 'atomic-result-number',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['field']
})
export class AtomicResultNumber {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultPrintableUri extends Components.AtomicResultPrintableUri {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['maxNumberOfParts', 'target']
})
@Component({
  selector: 'atomic-result-printable-uri',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['maxNumberOfParts', 'target']
})
export class AtomicResultPrintableUri {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultRating extends Components.AtomicResultRating {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['field', 'icon', 'maxValueInIndex']
})
@Component({
  selector: 'atomic-result-rating',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['field', 'icon', 'maxValueInIndex']
})
export class AtomicResultRating {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultSectionActions extends Components.AtomicResultSectionActions {}

@ProxyCmp({
  defineCustomElementFn: undefined
})
@Component({
  selector: 'atomic-result-section-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class AtomicResultSectionActions {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultSectionBadges extends Components.AtomicResultSectionBadges {}

@ProxyCmp({
  defineCustomElementFn: undefined
})
@Component({
  selector: 'atomic-result-section-badges',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class AtomicResultSectionBadges {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultSectionBottomMetadata extends Components.AtomicResultSectionBottomMetadata {}

@ProxyCmp({
  defineCustomElementFn: undefined
})
@Component({
  selector: 'atomic-result-section-bottom-metadata',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class AtomicResultSectionBottomMetadata {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultSectionEmphasized extends Components.AtomicResultSectionEmphasized {}

@ProxyCmp({
  defineCustomElementFn: undefined
})
@Component({
  selector: 'atomic-result-section-emphasized',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class AtomicResultSectionEmphasized {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultSectionExcerpt extends Components.AtomicResultSectionExcerpt {}

@ProxyCmp({
  defineCustomElementFn: undefined
})
@Component({
  selector: 'atomic-result-section-excerpt',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class AtomicResultSectionExcerpt {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultSectionTitle extends Components.AtomicResultSectionTitle {}

@ProxyCmp({
  defineCustomElementFn: undefined
})
@Component({
  selector: 'atomic-result-section-title',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class AtomicResultSectionTitle {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultSectionTitleMetadata extends Components.AtomicResultSectionTitleMetadata {}

@ProxyCmp({
  defineCustomElementFn: undefined
})
@Component({
  selector: 'atomic-result-section-title-metadata',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class AtomicResultSectionTitleMetadata {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultSectionVisual extends Components.AtomicResultSectionVisual {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['imageSize']
})
@Component({
  selector: 'atomic-result-section-visual',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['imageSize']
})
export class AtomicResultSectionVisual {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultTemplate extends Components.AtomicResultTemplate {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['conditions'],
  methods: ['getTemplate']
})
@Component({
  selector: 'atomic-result-template',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['conditions']
})
export class AtomicResultTemplate {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultText extends Components.AtomicResultText {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['default', 'field', 'shouldHighlight']
})
@Component({
  selector: 'atomic-result-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['default', 'field', 'shouldHighlight']
})
export class AtomicResultText {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicResultsPerPage extends Components.AtomicResultsPerPage {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['choicesDisplayed', 'initialChoice']
})
@Component({
  selector: 'atomic-results-per-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['choicesDisplayed', 'initialChoice']
})
export class AtomicResultsPerPage {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicSearchBox extends Components.AtomicSearchBox {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['numberOfQueries', 'redirectionUrl']
})
@Component({
  selector: 'atomic-search-box',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['numberOfQueries', 'redirectionUrl']
})
export class AtomicSearchBox {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicSearchBoxQuerySuggestions extends Components.AtomicSearchBoxQuerySuggestions {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['maxWithQuery', 'maxWithoutQuery']
})
@Component({
  selector: 'atomic-search-box-query-suggestions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['maxWithQuery', 'maxWithoutQuery']
})
export class AtomicSearchBoxQuerySuggestions {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicSearchBoxRecentQueries extends Components.AtomicSearchBoxRecentQueries {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['maxWithQuery', 'maxWithoutQuery']
})
@Component({
  selector: 'atomic-search-box-recent-queries',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['maxWithQuery', 'maxWithoutQuery']
})
export class AtomicSearchBoxRecentQueries {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicSearchInterface extends Components.AtomicSearchInterface {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['analytics', 'engine', 'i18n', 'language', 'logLevel', 'pipeline', 'reflectStateInUrl', 'scrollContainer', 'searchHub', 'timezone'],
  methods: ['initialize', 'executeFirstSearch']
})
@Component({
  selector: 'atomic-search-interface',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['analytics', 'engine', 'i18n', 'language', 'logLevel', 'pipeline', 'reflectStateInUrl', 'scrollContainer', 'searchHub', 'timezone']
})
export class AtomicSearchInterface {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicSortDropdown extends Components.AtomicSortDropdown {}

@ProxyCmp({
  defineCustomElementFn: undefined
})
@Component({
  selector: 'atomic-sort-dropdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class AtomicSortDropdown {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicSortExpression extends Components.AtomicSortExpression {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['expression', 'label']
})
@Component({
  selector: 'atomic-sort-expression',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['expression', 'label']
})
export class AtomicSortExpression {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicTableElement extends Components.AtomicTableElement {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['label']
})
@Component({
  selector: 'atomic-table-element',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['label']
})
export class AtomicTableElement {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicText extends Components.AtomicText {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['count', 'value']
})
@Component({
  selector: 'atomic-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['count', 'value']
})
export class AtomicText {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicTimeframe extends Components.AtomicTimeframe {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['amount', 'label', 'period', 'unit']
})
@Component({
  selector: 'atomic-timeframe',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['amount', 'label', 'period', 'unit']
})
export class AtomicTimeframe {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicTimeframeFacet extends Components.AtomicTimeframeFacet {}

@ProxyCmp({
  defineCustomElementFn: undefined,
  inputs: ['facetId', 'field', 'filterFacetCount', 'injectionDepth', 'isCollapsed', 'label', 'withDatePicker']
})
@Component({
  selector: 'atomic-timeframe-facet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['facetId', 'field', 'filterFacetCount', 'injectionDepth', 'isCollapsed', 'label', 'withDatePicker']
})
export class AtomicTimeframeFacet {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

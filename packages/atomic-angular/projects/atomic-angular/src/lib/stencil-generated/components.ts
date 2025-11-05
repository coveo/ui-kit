/* tslint:disable */
/* auto-generated angular directive proxies */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, NgZone } from '@angular/core';

import { ProxyCmp, proxyOutputs } from './angular-component-lib/utils';

import { Components } from '@coveo/atomic';


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
  inputs: ['citation', 'disableCitationAnchoring', 'index', 'interactiveCitation', 'sendHoverEndEvent']
, defineCustomElementFn: defineCustomElementAtomicCitation})
@Component({standalone:false,
  selector: 'atomic-citation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['citation', 'disableCitationAnchoring', 'index', 'interactiveCitation', 'sendHoverEndEvent'],
})
export class AtomicCitation {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicCitation extends Components.AtomicCitation {}


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
  inputs: ['answerConfigurationId', 'collapsible', 'disableCitationAnchoring', 'fieldsToIncludeInCitations', 'maxCollapsedHeight', 'tabsExcluded', 'tabsIncluded', 'withToggle']
, defineCustomElementFn: defineCustomElementAtomicGeneratedAnswer})
@Component({standalone:false,
  selector: 'atomic-generated-answer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['answerConfigurationId', 'collapsible', 'disableCitationAnchoring', 'fieldsToIncludeInCitations', 'maxCollapsedHeight', 'tabsExcluded', 'tabsIncluded', 'withToggle'],
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
  inputs: ['generatedAnswer', 'helpful', 'isOpen']
, defineCustomElementFn: defineCustomElementAtomicGeneratedAnswerFeedbackModal})
@Component({standalone:false,
  selector: 'atomic-generated-answer-feedback-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['generatedAnswer', 'helpful', 'isOpen'],
})
export class AtomicGeneratedAnswerFeedbackModal {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
    proxyOutputs(this, this.el, ['feedbackSent']);
  }
}


export declare interface AtomicGeneratedAnswerFeedbackModal extends Components.AtomicGeneratedAnswerFeedbackModal {

  feedbackSent: EventEmitter<CustomEvent<any>>;
}


@ProxyCmp({
  inputs: ['excludedCustomActions', 'ticketCreationDateTime', 'userId']
, defineCustomElementFn: defineCustomElementAtomicInsightUserActionsTimeline})
@Component({standalone:false,
  selector: 'atomic-insight-user-actions-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['excludedCustomActions', 'ticketCreationDateTime', 'userId'],
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
  inputs: ['excludedCustomActions', 'ticketCreationDateTime', 'userId']
, defineCustomElementFn: defineCustomElementAtomicInsightUserActionsToggle})
@Component({standalone:false,
  selector: 'atomic-insight-user-actions-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['excludedCustomActions', 'ticketCreationDateTime', 'userId'],
})
export class AtomicInsightUserActionsToggle {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AtomicInsightUserActionsToggle extends Components.AtomicInsightUserActionsToggle {}


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
  inputs: ['isCollapsed', 'field'],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-commerce-category-facet') || customElements.define('atomic-commerce-category-facet', LitAtomicCommerceCategoryFacet);}
})
@Component({
  selector: 'atomic-commerce-category-facet',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['isCollapsed', 'field']
})
export class AtomicCommerceCategoryFacet {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicCommerceCategoryFacet extends LitAtomicCommerceCategoryFacet {

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
  inputs: ['isCollapsed', 'field'],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-commerce-facet') || customElements.define('atomic-commerce-facet', LitAtomicCommerceFacet);}
})
@Component({
  selector: 'atomic-commerce-facet',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['isCollapsed', 'field']
})
export class AtomicCommerceFacet {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicCommerceFacet extends LitAtomicCommerceFacet {

}

@ProxyCmp({
  inputs: ['collapseFacetsAfter'],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-commerce-facets') || customElements.define('atomic-commerce-facets', LitAtomicCommerceFacets);}
})
@Component({
  selector: 'atomic-commerce-facets',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['collapseFacetsAfter']
})
export class AtomicCommerceFacets {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicCommerceFacets extends LitAtomicCommerceFacets {

}

@ProxyCmp({
  inputs: ['type', 'analytics', 'logLevel', 'language', 'reflectStateInUrl', 'disableStateReflectionInUrl', 'scrollContainer', 'languageAssetsPath', 'iconAssetsPath'],
  methods: ['initialize', 'initializeWithEngine', 'executeFirstRequest', 'updateLocale', 'toggleAnalytics', 'updateLanguage', 'updateIconAssetsPath', 'scrollToTop'],
  defineCustomElementFn: () => {customElements.get('atomic-commerce-interface') || customElements.define('atomic-commerce-interface', LitAtomicCommerceInterface);}
})
@Component({
  selector: 'atomic-commerce-interface',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['type', 'analytics', 'logLevel', 'language', 'reflectStateInUrl', 'disableStateReflectionInUrl', 'scrollContainer', 'languageAssetsPath', 'iconAssetsPath']
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
  methods: ['onMobileBreakpointChange'],
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
    proxyOutputs(this, this.el, ['atomic-layout-breakpoint-change']);
  }
}

export declare interface AtomicCommerceLayout extends LitAtomicCommerceLayout {
  'atomic-layout-breakpoint-change': EventEmitter<CustomEvent<any>>;
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
  inputs: ['isCollapsed', 'field'],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-commerce-numeric-facet') || customElements.define('atomic-commerce-numeric-facet', LitAtomicCommerceNumericFacet);}
})
@Component({
  selector: 'atomic-commerce-numeric-facet',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['isCollapsed', 'field']
})
export class AtomicCommerceNumericFacet {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicCommerceNumericFacet extends LitAtomicCommerceNumericFacet {

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
  defineCustomElementFn: () => {customElements.get('atomic-commerce-query-error') || customElements.define('atomic-commerce-query-error', LitAtomicCommerceQueryError);}
})
@Component({
  selector: 'atomic-commerce-query-error',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: []
})
export class AtomicCommerceQueryError {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicCommerceQueryError extends LitAtomicCommerceQueryError {

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
  inputs: ['scrollContainer', 'languageAssetsPath', 'iconAssetsPath', 'language', 'analytics'],
  methods: ['initializeWithEngine', 'updateLocale', 'toggleAnalytics', 'updateIconAssetsPath', 'updateLanguage'],
  defineCustomElementFn: () => {customElements.get('atomic-commerce-recommendation-interface') || customElements.define('atomic-commerce-recommendation-interface', LitAtomicCommerceRecommendationInterface);}
})
@Component({
  selector: 'atomic-commerce-recommendation-interface',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['scrollContainer', 'languageAssetsPath', 'iconAssetsPath', 'language', 'analytics']
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
  methods: ['watchNumberOfRecommendationsPerPage', 'setRenderFunction', 'previousPage', 'nextPage', 'initialize'],
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
  inputs: ['openButton', 'isOpen', 'collapseFacetsAfter'],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-commerce-refine-modal') || customElements.define('atomic-commerce-refine-modal', LitAtomicCommerceRefineModal);}
})
@Component({
  selector: 'atomic-commerce-refine-modal',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['openButton', 'isOpen', 'collapseFacetsAfter']
})
export class AtomicCommerceRefineModal {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicCommerceRefineModal extends LitAtomicCommerceRefineModal {

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
  methods: ['initialize'],
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
  inputs: ['isCollapsed', 'field'],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-commerce-timeframe-facet') || customElements.define('atomic-commerce-timeframe-facet', LitAtomicCommerceTimeframeFacet);}
})
@Component({
  selector: 'atomic-commerce-timeframe-facet',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['isCollapsed', 'field']
})
export class AtomicCommerceTimeframeFacet {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicCommerceTimeframeFacet extends LitAtomicCommerceTimeframeFacet {

}

@ProxyCmp({
  inputs: ['label', 'field', 'fallback'],
  methods: [],
  defineCustomElementFn: () => {customElements.get('atomic-product-children') || customElements.define('atomic-product-children', LitAtomicProductChildren);}
})
@Component({
  selector: 'atomic-product-children',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['label', 'field', 'fallback']
})
export class AtomicProductChildren {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    proxyOutputs(this, this.el, ['atomic/selectChildProduct']);
  }
}

export declare interface AtomicProductChildren extends LitAtomicProductChildren {
  'atomic/selectChildProduct': EventEmitter<CustomEvent<any>>;
}

@ProxyCmp({
  inputs: ['truncateAfter', 'field', 'isCollapsible'],
  methods: [],
  defineCustomElementFn: () => {customElements.get('atomic-product-description') || customElements.define('atomic-product-description', LitAtomicProductDescription);}
})
@Component({
  selector: 'atomic-product-description',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['truncateAfter', 'field', 'isCollapsible']
})
export class AtomicProductDescription {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicProductDescription extends LitAtomicProductDescription {

}

@ProxyCmp({
  inputs: ['truncateAfter', 'isCollapsible'],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-product-excerpt') || customElements.define('atomic-product-excerpt', LitAtomicProductExcerpt);}
})
@Component({
  selector: 'atomic-product-excerpt',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['truncateAfter', 'isCollapsible']
})
export class AtomicProductExcerpt {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicProductExcerpt extends LitAtomicProductExcerpt {

}

@ProxyCmp({
  inputs: ['ifDefined', 'ifNotDefined', 'mustMatch', 'mustNotMatch'],
  methods: [],
  defineCustomElementFn: () => {customElements.get('atomic-product-field-condition') || customElements.define('atomic-product-field-condition', LitAtomicProductFieldCondition);}
})
@Component({
  selector: 'atomic-product-field-condition',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['ifDefined', 'ifNotDefined', 'mustMatch', 'mustNotMatch']
})
export class AtomicProductFieldCondition {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicProductFieldCondition extends LitAtomicProductFieldCondition {

}

@ProxyCmp({
  inputs: ['field', 'imageAltField', 'fallback'],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-product-image') || customElements.define('atomic-product-image', LitAtomicProductImage);}
})
@Component({
  selector: 'atomic-product-image',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['field', 'imageAltField', 'fallback']
})
export class AtomicProductImage {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicProductImage extends LitAtomicProductImage {

}

@ProxyCmp({
  inputs: ['hrefTemplate'],
  methods: ['renderDefaultSlotContent'],
  defineCustomElementFn: () => {customElements.get('atomic-product-link') || customElements.define('atomic-product-link', LitAtomicProductLink);}
})
@Component({
  selector: 'atomic-product-link',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['hrefTemplate']
})
export class AtomicProductLink {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicProductLink extends LitAtomicProductLink {

}

@ProxyCmp({
  inputs: ['field', 'maxValuesToDisplay', 'delimiter'],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-product-multi-value-text') || customElements.define('atomic-product-multi-value-text', LitAtomicProductMultiValueText);}
})
@Component({
  selector: 'atomic-product-multi-value-text',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['field', 'maxValuesToDisplay', 'delimiter']
})
export class AtomicProductMultiValueText {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicProductMultiValueText extends LitAtomicProductMultiValueText {

}

@ProxyCmp({
  inputs: ['field'],
  methods: [],
  defineCustomElementFn: () => {customElements.get('atomic-product-numeric-field-value') || customElements.define('atomic-product-numeric-field-value', LitAtomicProductNumericFieldValue);}
})
@Component({
  selector: 'atomic-product-numeric-field-value',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['field']
})
export class AtomicProductNumericFieldValue {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicProductNumericFieldValue extends LitAtomicProductNumericFieldValue {

}

@ProxyCmp({
  inputs: [],
  methods: [],
  defineCustomElementFn: () => {customElements.get('atomic-product-price') || customElements.define('atomic-product-price', LitAtomicProductPrice);}
})
@Component({
  selector: 'atomic-product-price',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: []
})
export class AtomicProductPrice {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicProductPrice extends LitAtomicProductPrice {

}

@ProxyCmp({
  inputs: ['field', 'ratingDetailsField', 'maxValueInIndex', 'icon'],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-product-rating') || customElements.define('atomic-product-rating', LitAtomicProductRating);}
})
@Component({
  selector: 'atomic-product-rating',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['field', 'ratingDetailsField', 'maxValueInIndex', 'icon']
})
export class AtomicProductRating {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicProductRating extends LitAtomicProductRating {

}

@ProxyCmp({
  inputs: [],
  methods: [],
  defineCustomElementFn: () => {customElements.get('atomic-product-section-actions') || customElements.define('atomic-product-section-actions', LitAtomicProductSectionActions);}
})
@Component({
  selector: 'atomic-product-section-actions',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: []
})
export class AtomicProductSectionActions {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicProductSectionActions extends LitAtomicProductSectionActions {

}

@ProxyCmp({
  inputs: [],
  methods: [],
  defineCustomElementFn: () => {customElements.get('atomic-product-section-badges') || customElements.define('atomic-product-section-badges', LitAtomicProductSectionBadges);}
})
@Component({
  selector: 'atomic-product-section-badges',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: []
})
export class AtomicProductSectionBadges {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicProductSectionBadges extends LitAtomicProductSectionBadges {

}

@ProxyCmp({
  inputs: [],
  methods: [],
  defineCustomElementFn: () => {customElements.get('atomic-product-section-bottom-metadata') || customElements.define('atomic-product-section-bottom-metadata', LitAtomicProductSectionBottomMetadata);}
})
@Component({
  selector: 'atomic-product-section-bottom-metadata',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: []
})
export class AtomicProductSectionBottomMetadata {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicProductSectionBottomMetadata extends LitAtomicProductSectionBottomMetadata {

}

@ProxyCmp({
  inputs: [],
  methods: [],
  defineCustomElementFn: () => {customElements.get('atomic-product-section-children') || customElements.define('atomic-product-section-children', LitAtomicProductSectionChildren);}
})
@Component({
  selector: 'atomic-product-section-children',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: []
})
export class AtomicProductSectionChildren {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicProductSectionChildren extends LitAtomicProductSectionChildren {

}

@ProxyCmp({
  inputs: [],
  methods: [],
  defineCustomElementFn: () => {customElements.get('atomic-product-section-description') || customElements.define('atomic-product-section-description', LitAtomicProductSectionDescription);}
})
@Component({
  selector: 'atomic-product-section-description',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: []
})
export class AtomicProductSectionDescription {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicProductSectionDescription extends LitAtomicProductSectionDescription {

}

@ProxyCmp({
  inputs: [],
  methods: [],
  defineCustomElementFn: () => {customElements.get('atomic-product-section-emphasized') || customElements.define('atomic-product-section-emphasized', LitAtomicProductSectionEmphasized);}
})
@Component({
  selector: 'atomic-product-section-emphasized',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: []
})
export class AtomicProductSectionEmphasized {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicProductSectionEmphasized extends LitAtomicProductSectionEmphasized {

}

@ProxyCmp({
  inputs: [],
  methods: [],
  defineCustomElementFn: () => {customElements.get('atomic-product-section-metadata') || customElements.define('atomic-product-section-metadata', LitAtomicProductSectionMetadata);}
})
@Component({
  selector: 'atomic-product-section-metadata',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: []
})
export class AtomicProductSectionMetadata {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicProductSectionMetadata extends LitAtomicProductSectionMetadata {

}

@ProxyCmp({
  inputs: [],
  methods: [],
  defineCustomElementFn: () => {customElements.get('atomic-product-section-name') || customElements.define('atomic-product-section-name', LitAtomicProductSectionName);}
})
@Component({
  selector: 'atomic-product-section-name',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: []
})
export class AtomicProductSectionName {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicProductSectionName extends LitAtomicProductSectionName {

}

@ProxyCmp({
  inputs: ['imageSize'],
  methods: [],
  defineCustomElementFn: () => {customElements.get('atomic-product-section-visual') || customElements.define('atomic-product-section-visual', LitAtomicProductSectionVisual);}
})
@Component({
  selector: 'atomic-product-section-visual',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['imageSize']
})
export class AtomicProductSectionVisual {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicProductSectionVisual extends LitAtomicProductSectionVisual {

}

@ProxyCmp({
  inputs: ['mustMatch', 'mustNotMatch'],
  methods: ['getTemplate'],
  defineCustomElementFn: () => {customElements.get('atomic-product-template') || customElements.define('atomic-product-template', LitAtomicProductTemplate);}
})
@Component({
  selector: 'atomic-product-template',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['mustMatch', 'mustNotMatch']
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
  inputs: ['field', 'shouldHighlight', 'disableHighlight', 'default'],
  methods: [],
  defineCustomElementFn: () => {customElements.get('atomic-product-text') || customElements.define('atomic-product-text', LitAtomicProductText);}
})
@Component({
  selector: 'atomic-product-text',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['field', 'shouldHighlight', 'disableHighlight', 'default']
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
  methods: [],
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
  inputs: [],
  methods: ['updateMessage', 'registerRegion'],
  defineCustomElementFn: () => {customElements.get('atomic-aria-live') || customElements.define('atomic-aria-live', LitAtomicAriaLive);}
})
@Component({
  selector: 'atomic-aria-live',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: []
})
export class AtomicAriaLive {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    proxyOutputs(this, this.el, ['atomic/accessibility/findAriaLive']);
  }
}

export declare interface AtomicAriaLive extends LitAtomicAriaLive {
  'atomic/accessibility/findAriaLive': EventEmitter<CustomEvent<any>>;
}

@ProxyCmp({
  inputs: ['element'],
  methods: [],
  defineCustomElementFn: () => {customElements.get('atomic-component-error') || customElements.define('atomic-component-error', LitAtomicComponentError);}
})
@Component({
  selector: 'atomic-component-error',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['element']
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
  methods: ['updateIcon', 'initialize'],
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

@ProxyCmp({
  inputs: ['tooltip'],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-insight-generate-answer-button') || customElements.define('atomic-insight-generate-answer-button', LitAtomicInsightGenerateAnswerButton);}
})
@Component({
  selector: 'atomic-insight-generate-answer-button',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['tooltip']
})
export class AtomicInsightGenerateAnswerButton {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicInsightGenerateAnswerButton extends LitAtomicInsightGenerateAnswerButton {

}

@ProxyCmp({
  inputs: ['engine', 'analytics', 'i18n', 'logLevel', 'language', 'languageAssetsPath', 'iconAssetsPath', 'fieldsToInclude', 'resultsPerPage'],
  methods: ['initialize', 'initializeWithInsightEngine', 'executeFirstSearch', 'toggleAnalytics', 'updateIconAssetsPath', 'updateLanguage', 'registerFieldsToInclude'],
  defineCustomElementFn: () => {customElements.get('atomic-insight-interface') || customElements.define('atomic-insight-interface', LitAtomicInsightInterface);}
})
@Component({
  selector: 'atomic-insight-interface',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['engine', 'analytics', 'i18n', 'logLevel', 'language', 'languageAssetsPath', 'iconAssetsPath', 'fieldsToInclude', 'resultsPerPage']
})
export class AtomicInsightInterface {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicInsightInterface extends LitAtomicInsightInterface {

}

@ProxyCmp({
  inputs: ['fieldsToInclude', 'pipeline', 'searchHub', 'analytics', 'timezone', 'logLevel', 'language', 'languageAssetsPath', 'iconAssetsPath'],
  methods: ['initialize', 'initializeWithRecommendationEngine', 'getRecommendations', 'registerFieldsToInclude', 'toggleAnalytics', 'updateLanguage', 'updateIconAssetsPath'],
  defineCustomElementFn: () => {customElements.get('atomic-recs-interface') || customElements.define('atomic-recs-interface', LitAtomicRecsInterface);}
})
@Component({
  selector: 'atomic-recs-interface',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['fieldsToInclude', 'pipeline', 'searchHub', 'analytics', 'timezone', 'logLevel', 'language', 'languageAssetsPath', 'iconAssetsPath']
})
export class AtomicRecsInterface {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicRecsInterface extends LitAtomicRecsInterface {

}

@ProxyCmp({
  inputs: ['selector'],
  methods: [],
  defineCustomElementFn: () => {customElements.get('atomic-external') || customElements.define('atomic-external', LitAtomicExternal);}
})
@Component({
  selector: 'atomic-external',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['selector']
})
export class AtomicExternal {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicExternal extends LitAtomicExternal {

}

@ProxyCmp({
  inputs: ['facetId', 'label', 'field', 'tabsIncluded', 'tabsExcluded', 'numberOfValues', 'withSearch', 'sortCriteria', 'resultsMustMatch', 'displayValuesAs', 'isCollapsed', 'headingLevel', 'filterFacetCount', 'enableExclusion', 'injectionDepth', 'allowedValues', 'customSort', 'dependsOn'],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-facet') || customElements.define('atomic-facet', LitAtomicFacet);}
})
@Component({
  selector: 'atomic-facet',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['facetId', 'label', 'field', 'tabsIncluded', 'tabsExcluded', 'numberOfValues', 'withSearch', 'sortCriteria', 'resultsMustMatch', 'displayValuesAs', 'isCollapsed', 'headingLevel', 'filterFacetCount', 'enableExclusion', 'injectionDepth', 'allowedValues', 'customSort', 'dependsOn']
})
export class AtomicFacet {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicFacet extends LitAtomicFacet {

}

@ProxyCmp({
  inputs: ['value', 'sanitize'],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-html') || customElements.define('atomic-html', LitAtomicHtml);}
})
@Component({
  selector: 'atomic-html',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['value', 'sanitize']
})
export class AtomicHtml {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicHtml extends LitAtomicHtml {

}

@ProxyCmp({
  inputs: [],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-load-more-results') || customElements.define('atomic-load-more-results', LitAtomicLoadMoreResults);}
})
@Component({
  selector: 'atomic-load-more-results',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: []
})
export class AtomicLoadMoreResults {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicLoadMoreResults extends LitAtomicLoadMoreResults {

}

@ProxyCmp({
  inputs: ['numberOfPages', 'previousButtonIcon', 'nextButtonIcon'],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-pager') || customElements.define('atomic-pager', LitAtomicPager);}
})
@Component({
  selector: 'atomic-pager',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['numberOfPages', 'previousButtonIcon', 'nextButtonIcon']
})
export class AtomicPager {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    proxyOutputs(this, this.el, ['atomic/scrollToTop']);
  }
}

export declare interface AtomicPager extends LitAtomicPager {
  'atomic/scrollToTop': EventEmitter<CustomEvent<any>>;
}

@ProxyCmp({
  inputs: [],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-query-summary') || customElements.define('atomic-query-summary', LitAtomicQuerySummary);}
})
@Component({
  selector: 'atomic-query-summary',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: []
})
export class AtomicQuerySummary {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicQuerySummary extends LitAtomicQuerySummary {

}

@ProxyCmp({
  inputs: ['mustMatch', 'mustNotMatch'],
  methods: ['getTemplate'],
  defineCustomElementFn: () => {customElements.get('atomic-result-children-template') || customElements.define('atomic-result-children-template', LitAtomicResultChildrenTemplate);}
})
@Component({
  selector: 'atomic-result-children-template',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['mustMatch', 'mustNotMatch']
})
export class AtomicResultChildrenTemplate {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicResultChildrenTemplate extends LitAtomicResultChildrenTemplate {

}

@ProxyCmp({
  inputs: ['density', 'display', 'imageSize', 'tabsIncluded', 'tabsExcluded'],
  methods: ['setRenderFunction', 'initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-result-list') || customElements.define('atomic-result-list', LitAtomicResultList);}
})
@Component({
  selector: 'atomic-result-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['density', 'display', 'imageSize', 'tabsIncluded', 'tabsExcluded']
})
export class AtomicResultList {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicResultList extends LitAtomicResultList {

}

@ProxyCmp({
  inputs: [],
  methods: [],
  defineCustomElementFn: () => {customElements.get('atomic-result-section-actions') || customElements.define('atomic-result-section-actions', LitAtomicResultSectionActions);}
})
@Component({
  selector: 'atomic-result-section-actions',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: []
})
export class AtomicResultSectionActions {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicResultSectionActions extends LitAtomicResultSectionActions {

}

@ProxyCmp({
  inputs: [],
  methods: [],
  defineCustomElementFn: () => {customElements.get('atomic-result-section-badges') || customElements.define('atomic-result-section-badges', LitAtomicResultSectionBadges);}
})
@Component({
  selector: 'atomic-result-section-badges',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: []
})
export class AtomicResultSectionBadges {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicResultSectionBadges extends LitAtomicResultSectionBadges {

}

@ProxyCmp({
  inputs: [],
  methods: [],
  defineCustomElementFn: () => {customElements.get('atomic-result-section-bottom-metadata') || customElements.define('atomic-result-section-bottom-metadata', LitAtomicResultSectionBottomMetadata);}
})
@Component({
  selector: 'atomic-result-section-bottom-metadata',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: []
})
export class AtomicResultSectionBottomMetadata {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicResultSectionBottomMetadata extends LitAtomicResultSectionBottomMetadata {

}

@ProxyCmp({
  inputs: [],
  methods: [],
  defineCustomElementFn: () => {customElements.get('atomic-result-section-children') || customElements.define('atomic-result-section-children', LitAtomicResultSectionChildren);}
})
@Component({
  selector: 'atomic-result-section-children',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: []
})
export class AtomicResultSectionChildren {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicResultSectionChildren extends LitAtomicResultSectionChildren {

}

@ProxyCmp({
  inputs: [],
  methods: [],
  defineCustomElementFn: () => {customElements.get('atomic-result-section-emphasized') || customElements.define('atomic-result-section-emphasized', LitAtomicResultSectionEmphasized);}
})
@Component({
  selector: 'atomic-result-section-emphasized',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: []
})
export class AtomicResultSectionEmphasized {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicResultSectionEmphasized extends LitAtomicResultSectionEmphasized {

}

@ProxyCmp({
  inputs: [],
  methods: [],
  defineCustomElementFn: () => {customElements.get('atomic-result-section-excerpt') || customElements.define('atomic-result-section-excerpt', LitAtomicResultSectionExcerpt);}
})
@Component({
  selector: 'atomic-result-section-excerpt',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: []
})
export class AtomicResultSectionExcerpt {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicResultSectionExcerpt extends LitAtomicResultSectionExcerpt {

}

@ProxyCmp({
  inputs: [],
  methods: [],
  defineCustomElementFn: () => {customElements.get('atomic-result-section-title-metadata') || customElements.define('atomic-result-section-title-metadata', LitAtomicResultSectionTitleMetadata);}
})
@Component({
  selector: 'atomic-result-section-title-metadata',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: []
})
export class AtomicResultSectionTitleMetadata {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicResultSectionTitleMetadata extends LitAtomicResultSectionTitleMetadata {

}

@ProxyCmp({
  inputs: [],
  methods: [],
  defineCustomElementFn: () => {customElements.get('atomic-result-section-title') || customElements.define('atomic-result-section-title', LitAtomicResultSectionTitle);}
})
@Component({
  selector: 'atomic-result-section-title',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: []
})
export class AtomicResultSectionTitle {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicResultSectionTitle extends LitAtomicResultSectionTitle {

}

@ProxyCmp({
  inputs: ['imageSize'],
  methods: [],
  defineCustomElementFn: () => {customElements.get('atomic-result-section-visual') || customElements.define('atomic-result-section-visual', LitAtomicResultSectionVisual);}
})
@Component({
  selector: 'atomic-result-section-visual',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['imageSize']
})
export class AtomicResultSectionVisual {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicResultSectionVisual extends LitAtomicResultSectionVisual {

}

@ProxyCmp({
  inputs: ['mustMatch', 'mustNotMatch'],
  methods: ['getTemplate'],
  defineCustomElementFn: () => {customElements.get('atomic-result-template') || customElements.define('atomic-result-template', LitAtomicResultTemplate);}
})
@Component({
  selector: 'atomic-result-template',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['mustMatch', 'mustNotMatch']
})
export class AtomicResultTemplate {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicResultTemplate extends LitAtomicResultTemplate {

}

@ProxyCmp({
  inputs: ['field', 'shouldHighlight', 'disableHighlight', 'default'],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-result-text') || customElements.define('atomic-result-text', LitAtomicResultText);}
})
@Component({
  selector: 'atomic-result-text',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['field', 'shouldHighlight', 'disableHighlight', 'default']
})
export class AtomicResultText {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicResultText extends LitAtomicResultText {

}

@ProxyCmp({
  inputs: ['stopPropagation', 'result', 'interactiveResult', 'store', 'content', 'linkContent', 'display', 'density', 'imageSize', 'classes'],
  methods: [],
  defineCustomElementFn: () => {customElements.get('atomic-result') || customElements.define('atomic-result', LitAtomicResult);}
})
@Component({
  selector: 'atomic-result',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['stopPropagation', 'result', 'interactiveResult', 'store', 'content', 'linkContent', 'display', 'density', 'imageSize', 'classes']
})
export class AtomicResult {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicResult extends LitAtomicResult {

}

@ProxyCmp({
  inputs: ['choicesDisplayed', 'initialChoice'],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-results-per-page') || customElements.define('atomic-results-per-page', LitAtomicResultsPerPage);}
})
@Component({
  selector: 'atomic-results-per-page',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['choicesDisplayed', 'initialChoice']
})
export class AtomicResultsPerPage {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    proxyOutputs(this, this.el, ['atomic/scrollToTop']);
  }
}

export declare interface AtomicResultsPerPage extends LitAtomicResultsPerPage {
  'atomic/scrollToTop': EventEmitter<CustomEvent<any>>;
}

@ProxyCmp({
  inputs: ['maxResultsPerQuery', 'density', 'imageSize', 'ariaLabelGenerator'],
  methods: ['setRenderFunction', 'initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-search-box-instant-results') || customElements.define('atomic-search-box-instant-results', LitAtomicSearchBoxInstantResults);}
})
@Component({
  selector: 'atomic-search-box-instant-results',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['maxResultsPerQuery', 'density', 'imageSize', 'ariaLabelGenerator']
})
export class AtomicSearchBoxInstantResults {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicSearchBoxInstantResults extends LitAtomicSearchBoxInstantResults {

}

@ProxyCmp({
  inputs: ['icon', 'maxWithQuery', 'maxWithoutQuery'],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-search-box-query-suggestions') || customElements.define('atomic-search-box-query-suggestions', LitAtomicSearchBoxQuerySuggestions);}
})
@Component({
  selector: 'atomic-search-box-query-suggestions',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['icon', 'maxWithQuery', 'maxWithoutQuery']
})
export class AtomicSearchBoxQuerySuggestions {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicSearchBoxQuerySuggestions extends LitAtomicSearchBoxQuerySuggestions {

}

@ProxyCmp({
  inputs: ['icon', 'maxWithQuery', 'maxWithoutQuery'],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-search-box-recent-queries') || customElements.define('atomic-search-box-recent-queries', LitAtomicSearchBoxRecentQueries);}
})
@Component({
  selector: 'atomic-search-box-recent-queries',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['icon', 'maxWithQuery', 'maxWithoutQuery']
})
export class AtomicSearchBoxRecentQueries {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicSearchBoxRecentQueries extends LitAtomicSearchBoxRecentQueries {

}

@ProxyCmp({
  inputs: ['fieldsToInclude', 'pipeline', 'searchHub', 'analytics', 'timezone', 'logLevel', 'language', 'reflectStateInUrl', 'disableStateReflectionInUrl', 'scrollContainer', 'languageAssetsPath', 'iconAssetsPath', 'enableRelevanceInspector', 'disableRelevanceInspector'],
  methods: ['scrollToTop', 'closeRelevanceInspector', 'initialize', 'initializeWithSearchEngine', 'executeFirstSearch', 'updateSearchConfiguration', 'registerFieldsToInclude', 'updateSearchHub', 'updatePipeline', 'toggleAnalytics', 'updateLanguage', 'updateIconAssetsPath'],
  defineCustomElementFn: () => {customElements.get('atomic-search-interface') || customElements.define('atomic-search-interface', LitAtomicSearchInterface);}
})
@Component({
  selector: 'atomic-search-interface',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['fieldsToInclude', 'pipeline', 'searchHub', 'analytics', 'timezone', 'logLevel', 'language', 'reflectStateInUrl', 'disableStateReflectionInUrl', 'scrollContainer', 'languageAssetsPath', 'iconAssetsPath', 'enableRelevanceInspector', 'disableRelevanceInspector']
})
export class AtomicSearchInterface {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicSearchInterface extends LitAtomicSearchInterface {

}

@ProxyCmp({
  inputs: ['mobileBreakpoint'],
  methods: ['onMobileBreakpointChange'],
  defineCustomElementFn: () => {customElements.get('atomic-search-layout') || customElements.define('atomic-search-layout', LitAtomicSearchLayout);}
})
@Component({
  selector: 'atomic-search-layout',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['mobileBreakpoint']
})
export class AtomicSearchLayout {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    proxyOutputs(this, this.el, ['atomic-layout-breakpoint-change']);
  }
}

export declare interface AtomicSearchLayout extends LitAtomicSearchLayout {
  'atomic-layout-breakpoint-change': EventEmitter<CustomEvent<any>>;
}

@ProxyCmp({
  inputs: ['value', 'count'],
  methods: ['initialize'],
  defineCustomElementFn: () => {customElements.get('atomic-text') || customElements.define('atomic-text', LitAtomicText);}
})
@Component({
  selector: 'atomic-text',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['value', 'count']
})
export class AtomicText {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    
  }
}

export declare interface AtomicText extends LitAtomicText {

}

import {AtomicAriaLive as LitAtomicAriaLive, AtomicCommerceBreadbox as LitAtomicCommerceBreadbox, AtomicCommerceCategoryFacet as LitAtomicCommerceCategoryFacet, AtomicCommerceDidYouMean as LitAtomicCommerceDidYouMean, AtomicCommerceFacet as LitAtomicCommerceFacet, AtomicCommerceFacets as LitAtomicCommerceFacets, AtomicCommerceInterface as LitAtomicCommerceInterface, AtomicCommerceLayout as LitAtomicCommerceLayout, AtomicCommerceLoadMoreProducts as LitAtomicCommerceLoadMoreProducts, AtomicCommerceNoProducts as LitAtomicCommerceNoProducts, AtomicCommerceNumericFacet as LitAtomicCommerceNumericFacet, AtomicCommercePager as LitAtomicCommercePager, AtomicCommerceProductList as LitAtomicCommerceProductList, AtomicCommerceProductsPerPage as LitAtomicCommerceProductsPerPage, AtomicCommerceQueryError as LitAtomicCommerceQueryError, AtomicCommerceQuerySummary as LitAtomicCommerceQuerySummary, AtomicCommerceRecommendationInterface as LitAtomicCommerceRecommendationInterface, AtomicCommerceRecommendationList as LitAtomicCommerceRecommendationList, AtomicCommerceRefineModal as LitAtomicCommerceRefineModal, AtomicCommerceRefineToggle as LitAtomicCommerceRefineToggle, AtomicCommerceSearchBox as LitAtomicCommerceSearchBox, AtomicCommerceSearchBoxInstantProducts as LitAtomicCommerceSearchBoxInstantProducts, AtomicCommerceSearchBoxQuerySuggestions as LitAtomicCommerceSearchBoxQuerySuggestions, AtomicCommerceSearchBoxRecentQueries as LitAtomicCommerceSearchBoxRecentQueries, AtomicCommerceSortDropdown as LitAtomicCommerceSortDropdown, AtomicCommerceText as LitAtomicCommerceText, AtomicCommerceTimeframeFacet as LitAtomicCommerceTimeframeFacet, AtomicComponentError as LitAtomicComponentError, AtomicExternal as LitAtomicExternal, AtomicFacet as LitAtomicFacet, AtomicHtml as LitAtomicHtml, AtomicIcon as LitAtomicIcon, AtomicInsightGenerateAnswerButton as LitAtomicInsightGenerateAnswerButton, AtomicInsightInterface as LitAtomicInsightInterface, AtomicLayoutSection as LitAtomicLayoutSection, AtomicPager as LitAtomicPager, AtomicProduct as LitAtomicProduct, AtomicProductChildren as LitAtomicProductChildren, AtomicProductDescription as LitAtomicProductDescription, AtomicProductExcerpt as LitAtomicProductExcerpt, AtomicProductFieldCondition as LitAtomicProductFieldCondition, AtomicProductImage as LitAtomicProductImage, AtomicProductLink as LitAtomicProductLink, AtomicProductMultiValueText as LitAtomicProductMultiValueText, AtomicProductNumericFieldValue as LitAtomicProductNumericFieldValue, AtomicProductPrice as LitAtomicProductPrice, AtomicProductRating as LitAtomicProductRating, AtomicProductSectionActions as LitAtomicProductSectionActions, AtomicProductSectionBadges as LitAtomicProductSectionBadges, AtomicProductSectionBottomMetadata as LitAtomicProductSectionBottomMetadata, AtomicProductSectionChildren as LitAtomicProductSectionChildren, AtomicProductSectionDescription as LitAtomicProductSectionDescription, AtomicProductSectionEmphasized as LitAtomicProductSectionEmphasized, AtomicProductSectionMetadata as LitAtomicProductSectionMetadata, AtomicProductSectionName as LitAtomicProductSectionName, AtomicProductSectionVisual as LitAtomicProductSectionVisual, AtomicProductTemplate as LitAtomicProductTemplate, AtomicProductText as LitAtomicProductText, AtomicQuerySummary as LitAtomicQuerySummary, AtomicResult as LitAtomicResult, AtomicResultChildrenTemplate as LitAtomicResultChildrenTemplate, AtomicResultList as LitAtomicResultList, AtomicResultSectionActions as LitAtomicResultSectionActions, AtomicResultSectionBadges as LitAtomicResultSectionBadges, AtomicResultSectionBottomMetadata as LitAtomicResultSectionBottomMetadata, AtomicResultSectionChildren as LitAtomicResultSectionChildren, AtomicResultSectionEmphasized as LitAtomicResultSectionEmphasized, AtomicResultSectionExcerpt as LitAtomicResultSectionExcerpt, AtomicResultSectionTitle as LitAtomicResultSectionTitle, AtomicResultSectionTitleMetadata as LitAtomicResultSectionTitleMetadata, AtomicResultSectionVisual as LitAtomicResultSectionVisual, AtomicResultTemplate as LitAtomicResultTemplate, AtomicResultText as LitAtomicResultText, AtomicResultsPerPage as LitAtomicResultsPerPage, AtomicSearchBoxInstantResults as LitAtomicSearchBoxInstantResults, AtomicSearchBoxQuerySuggestions as LitAtomicSearchBoxQuerySuggestions, AtomicSearchBoxRecentQueries as LitAtomicSearchBoxRecentQueries, AtomicSearchInterface as LitAtomicSearchInterface, AtomicSearchLayout as LitAtomicSearchLayout, AtomicText as LitAtomicText} from '@coveo/atomic/components';

import {defineCustomElementAtomicAutomaticFacet, defineCustomElementAtomicAutomaticFacetGenerator, defineCustomElementAtomicBreadbox, defineCustomElementAtomicCategoryFacet, defineCustomElementAtomicCitation, defineCustomElementAtomicColorFacet, defineCustomElementAtomicDidYouMean, defineCustomElementAtomicFacetManager, defineCustomElementAtomicFieldCondition, defineCustomElementAtomicFoldedResultList, defineCustomElementAtomicFormatCurrency, defineCustomElementAtomicFormatNumber, defineCustomElementAtomicFormatUnit, defineCustomElementAtomicGeneratedAnswer, defineCustomElementAtomicGeneratedAnswerFeedbackModal, defineCustomElementAtomicInsightUserActionsTimeline, defineCustomElementAtomicInsightUserActionsToggle, defineCustomElementAtomicNoResults, defineCustomElementAtomicNotifications, defineCustomElementAtomicNumericFacet, defineCustomElementAtomicNumericRange, defineCustomElementAtomicPopover, defineCustomElementAtomicQueryError, defineCustomElementAtomicQuickview, defineCustomElementAtomicQuickviewModal, defineCustomElementAtomicRatingFacet, defineCustomElementAtomicRatingRangeFacet, defineCustomElementAtomicRecsError, defineCustomElementAtomicRecsList, defineCustomElementAtomicRecsResult, defineCustomElementAtomicRecsResultTemplate, defineCustomElementAtomicRefineModal, defineCustomElementAtomicRefineToggle, defineCustomElementAtomicResultBadge, defineCustomElementAtomicResultChildren, defineCustomElementAtomicResultDate, defineCustomElementAtomicResultFieldsList, defineCustomElementAtomicResultHtml, defineCustomElementAtomicResultIcon, defineCustomElementAtomicResultImage, defineCustomElementAtomicResultLink, defineCustomElementAtomicResultLocalizedText, defineCustomElementAtomicResultMultiValueText, defineCustomElementAtomicResultNumber, defineCustomElementAtomicResultPrintableUri, defineCustomElementAtomicResultRating, defineCustomElementAtomicResultTimespan, defineCustomElementAtomicSearchBox, defineCustomElementAtomicSegmentedFacet, defineCustomElementAtomicSegmentedFacetScrollable, defineCustomElementAtomicSmartSnippet, defineCustomElementAtomicSmartSnippetFeedbackModal, defineCustomElementAtomicSmartSnippetSuggestions, defineCustomElementAtomicSortDropdown, defineCustomElementAtomicSortExpression, defineCustomElementAtomicTab, defineCustomElementAtomicTabManager, defineCustomElementAtomicTableElement, defineCustomElementAtomicTimeframe, defineCustomElementAtomicTimeframeFacet} from '@coveo/atomic/components';
//#endregion Lit Declarations
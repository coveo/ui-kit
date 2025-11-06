/* tslint:disable */
/* auto-generated angular module */
import {CommonModule} from '@angular/common';
import {APP_INITIALIZER, ModuleWithProviders, NgModule, Provider} from '@angular/core';

        
import {
AtomicAutomaticFacet,
AtomicAutomaticFacetGenerator,
AtomicBreadbox,
AtomicCategoryFacet,
AtomicCitation,
AtomicColorFacet,
AtomicDidYouMean,
AtomicFacetManager,
AtomicFieldCondition,
AtomicFoldedResultList,
AtomicFormatCurrency,
AtomicFormatNumber,
AtomicFormatUnit,
AtomicGeneratedAnswer,
AtomicGeneratedAnswerFeedbackModal,
AtomicInsightUserActionsTimeline,
AtomicInsightUserActionsToggle,
AtomicNoResults,
AtomicNotifications,
AtomicNumericFacet,
AtomicNumericRange,
AtomicPopover,
AtomicQuickview,
AtomicQuickviewModal,
AtomicRatingFacet,
AtomicRatingRangeFacet,
AtomicRecsError,
AtomicRecsList,
AtomicRecsResult,
AtomicRecsResultTemplate,
AtomicRefineModal,
AtomicRefineToggle,
AtomicResultBadge,
AtomicResultChildren,
AtomicResultDate,
AtomicResultFieldsList,
AtomicResultHtml,
AtomicResultIcon,
AtomicResultImage,
AtomicResultLink,
AtomicResultLocalizedText,
AtomicResultMultiValueText,
AtomicResultNumber,
AtomicResultPrintableUri,
AtomicResultRating,
AtomicResultTimespan,
AtomicSearchBox,
AtomicSegmentedFacet,
AtomicSegmentedFacetScrollable,
AtomicSmartSnippet,
AtomicSmartSnippetFeedbackModal,
AtomicSmartSnippetSuggestions,
AtomicSortDropdown,
AtomicSortExpression,
AtomicTab,
AtomicTabManager,
AtomicTableElement,
AtomicTimeframe,
AtomicTimeframeFacet
} from './components';

        
const DECLARATIONS = [
AtomicAutomaticFacet,
AtomicAutomaticFacetGenerator,
AtomicBreadbox,
AtomicCategoryFacet,
AtomicCitation,
AtomicColorFacet,
AtomicDidYouMean,
AtomicFacetManager,
AtomicFieldCondition,
AtomicFoldedResultList,
AtomicFormatCurrency,
AtomicFormatNumber,
AtomicFormatUnit,
AtomicGeneratedAnswer,
AtomicGeneratedAnswerFeedbackModal,
AtomicInsightUserActionsTimeline,
AtomicInsightUserActionsToggle,
AtomicNoResults,
AtomicNotifications,
AtomicNumericFacet,
AtomicNumericRange,
AtomicPopover,
AtomicQuickview,
AtomicQuickviewModal,
AtomicRatingFacet,
AtomicRatingRangeFacet,
AtomicRecsError,
AtomicRecsList,
AtomicRecsResult,
AtomicRecsResultTemplate,
AtomicRefineModal,
AtomicRefineToggle,
AtomicResultBadge,
AtomicResultChildren,
AtomicResultDate,
AtomicResultFieldsList,
AtomicResultHtml,
AtomicResultIcon,
AtomicResultImage,
AtomicResultLink,
AtomicResultLocalizedText,
AtomicResultMultiValueText,
AtomicResultNumber,
AtomicResultPrintableUri,
AtomicResultRating,
AtomicResultTimespan,
AtomicSearchBox,
AtomicSegmentedFacet,
AtomicSegmentedFacetScrollable,
AtomicSmartSnippet,
AtomicSmartSnippetFeedbackModal,
AtomicSmartSnippetSuggestions,
AtomicSortDropdown,
AtomicSortExpression,
AtomicTab,
AtomicTabManager,
AtomicTableElement,
AtomicTimeframe,
AtomicTimeframeFacet
]

        
const shimTemplates = ()=> {
  // Angular's renderer will add children to a <template> instead of to its
  // content. This shim will force any children added to a <template> to be
  // added to its content instead.
  // https://github.com/angular/angular/issues/15557
  const nativeAppend = HTMLTemplateElement && HTMLTemplateElement.prototype && HTMLTemplateElement.prototype.appendChild;
  if(!nativeAppend) {
    return;
  }
  HTMLTemplateElement.prototype.appendChild = function<T extends Node>(
    childNode: T
  ) {
    if (this.content) {
      return this.content.appendChild(childNode);
    } else {
      return <T>nativeAppend.apply(this, [childNode]);
    }
  };
}

        
const SHIM_TEMPLATES_PROVIDER: Provider = {
  provide: APP_INITIALIZER,
  multi: true,
  useValue: shimTemplates
}

        
@NgModule({
  declarations: DECLARATIONS,
  exports: DECLARATIONS,
  providers: [SHIM_TEMPLATES_PROVIDER],
  imports: [CommonModule],
})
export class AtomicAngularModule {
  static forRoot(): ModuleWithProviders<AtomicAngularModule> {
    return {
      ngModule: AtomicAngularModule,
      providers: [],
    };
  }
}

        
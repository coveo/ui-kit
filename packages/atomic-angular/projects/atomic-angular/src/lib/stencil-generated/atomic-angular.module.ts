/* tslint:disable */
/* auto-generated angular module */
import {CommonModule} from '@angular/common';
import {APP_INITIALIZER, ModuleWithProviders, NgModule, Provider} from '@angular/core';

        
import {
AtomicBreadbox,
AtomicCategoryFacet,
AtomicColorFacet,
AtomicComponentError,
AtomicDidYouMean,
AtomicExternal,
AtomicFacet,
AtomicFacetManager,
AtomicFieldCondition,
AtomicFormatCurrency,
AtomicFormatNumber,
AtomicFormatUnit,
AtomicFrequentlyBoughtTogether,
AtomicIcon,
AtomicLoadMoreResults,
AtomicNoResults,
AtomicNumericFacet,
AtomicNumericRange,
AtomicPager,
AtomicQueryError,
AtomicQuerySummary,
AtomicRatingFacet,
AtomicRatingRangeFacet,
AtomicRefineModal,
AtomicRefineToggle,
AtomicRelevanceInspector,
AtomicResult,
AtomicResultBadge,
AtomicResultDate,
AtomicResultFieldsList,
AtomicResultIcon,
AtomicResultImage,
AtomicResultLink,
AtomicResultList,
AtomicResultMultiValueText,
AtomicResultNumber,
AtomicResultPrintableUri,
AtomicResultRating,
AtomicResultSectionActions,
AtomicResultSectionBadges,
AtomicResultSectionBottomMetadata,
AtomicResultSectionEmphasized,
AtomicResultSectionExcerpt,
AtomicResultSectionTitle,
AtomicResultSectionTitleMetadata,
AtomicResultSectionVisual,
AtomicResultTemplate,
AtomicResultText,
AtomicResultsPerPage,
AtomicSearchBox,
AtomicSearchBoxQuerySuggestions,
AtomicSearchBoxRecentQueries,
AtomicSearchInterface,
AtomicSortDropdown,
AtomicSortExpression,
AtomicTableElement,
AtomicText,
AtomicTimeframe,
AtomicTimeframeFacet
} from './components';

        
import {defineCustomElements} from '@coveo/atomic/loader';
defineCustomElements(window);

        
const DECLARATIONS = [
AtomicBreadbox,
AtomicCategoryFacet,
AtomicColorFacet,
AtomicComponentError,
AtomicDidYouMean,
AtomicExternal,
AtomicFacet,
AtomicFacetManager,
AtomicFieldCondition,
AtomicFormatCurrency,
AtomicFormatNumber,
AtomicFormatUnit,
AtomicFrequentlyBoughtTogether,
AtomicIcon,
AtomicLoadMoreResults,
AtomicNoResults,
AtomicNumericFacet,
AtomicNumericRange,
AtomicPager,
AtomicQueryError,
AtomicQuerySummary,
AtomicRatingFacet,
AtomicRatingRangeFacet,
AtomicRefineModal,
AtomicRefineToggle,
AtomicRelevanceInspector,
AtomicResult,
AtomicResultBadge,
AtomicResultDate,
AtomicResultFieldsList,
AtomicResultIcon,
AtomicResultImage,
AtomicResultLink,
AtomicResultList,
AtomicResultMultiValueText,
AtomicResultNumber,
AtomicResultPrintableUri,
AtomicResultRating,
AtomicResultSectionActions,
AtomicResultSectionBadges,
AtomicResultSectionBottomMetadata,
AtomicResultSectionEmphasized,
AtomicResultSectionExcerpt,
AtomicResultSectionTitle,
AtomicResultSectionTitleMetadata,
AtomicResultSectionVisual,
AtomicResultTemplate,
AtomicResultText,
AtomicResultsPerPage,
AtomicSearchBox,
AtomicSearchBoxQuerySuggestions,
AtomicSearchBoxRecentQueries,
AtomicSearchInterface,
AtomicSortDropdown,
AtomicSortExpression,
AtomicTableElement,
AtomicText,
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

        
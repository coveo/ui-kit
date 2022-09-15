import {
    CategoryFacetMetadata,
    FacetBaseMeta,
    FacetMetadata,
    FacetRangeMetadata,
    FacetSortMeta,
    InterfaceChangeMetadata,
    PagerMetadata,
    QueryErrorMeta,
    ResultsSortMetadata,
    StaticFilterToggleValueMetadata,
} from '../searchPage/searchPageEvents';

export enum InsightEvents {
    /**
     * Identifies the search event that gets logged when the query context is updated as a result of updating one of the case context fields.
     */
    contextChanged = 'contextChanged',
    /**
     * Identifies the event that gets logged when the user opens the full search page from the insight panel.
     */
    expandToFullUI = 'expandToFullUI',
}

export interface CaseMetadata {
    caseId?: string;
    caseNumber?: string;
    caseContext?: Record<string, string>;
}

export interface ExpandToFullUIMetadata extends CaseMetadata {
    fullSearchComponentName: string;
    triggeredBy: string;
}

export interface InsightInterfaceChangeMetadata extends InterfaceChangeMetadata, CaseMetadata {}

export interface InsightFacetMetadata extends FacetMetadata, CaseMetadata {}

export interface InsightStaticFilterToggleValueMetadata extends StaticFilterToggleValueMetadata, CaseMetadata {}

export interface InsightFacetRangeMetadata extends FacetRangeMetadata, CaseMetadata {}

export interface InsightCategoryFacetMetadata extends CategoryFacetMetadata, CaseMetadata {}

export interface InsightFacetSortMeta extends FacetSortMeta, CaseMetadata {}

export interface InsightFacetBaseMeta extends FacetBaseMeta, CaseMetadata {}

export interface InsightQueryErrorMeta extends QueryErrorMeta, CaseMetadata {}

export interface InsightPagerMetadata extends PagerMetadata, CaseMetadata {}

export interface InsightResultsSortMetadata extends ResultsSortMetadata, CaseMetadata {}

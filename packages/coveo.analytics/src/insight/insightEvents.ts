export enum InsightEvents {
    /**
     * Identifies the search event that gets logged when the query context is updated as a result of updating one of the case context fields.
     */
    contextChanged = 'contextChanged',
    /**
     * Identifies the event that gets logged when the user opens the full search page from the insight panell.
     */
    expandToFullUI = 'expandToFullUI',
}

interface CaseMetadata {
    caseId: string;
    caseNumber: string;
    caseContext: Record<string, string>;
}

export interface ContextChangedMetadata extends CaseMetadata {}

export interface ExpandToFullUIMetadata extends CaseMetadata {
    fullSearchComponentName: string;
    triggeredBy: string;
}

export enum InsightEvents {
    /**
     * Identifies the search event that gets logged when the query context is updated as a result of updating one of the case context fields.
     */
    contextChanged = 'contextChanged',
}

export interface ContextChangedMetadata {
    caseId: string;
    caseNumber: string;
    caseContext: Record<string, string>;
}

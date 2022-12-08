export interface AttachedResult {
  articleLanguage?: string;
  articleVersionNumber?: string;
  articlePublishStatus?: string;
  caseId: string;
  knowledgeArticleId?: string;
  name?: string;
  permanentId?: string;
  resultUrl: string;
  source: string;
  title: string;
  uriHash?: string;
}

export interface AttachedResultsState {
  results: AttachedResult[];
  message?: string;
}

export function getAttachedResultsInitialState(): AttachedResultsState {
  return {
    results: [],
  };
}

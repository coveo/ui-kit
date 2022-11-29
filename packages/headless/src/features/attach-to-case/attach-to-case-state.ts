export interface AttachedResult {
  knowledgeArticleId?: string;
  articleLanguage?: string;
  articleVersionNumber?: string;
  articlePublishStatus?: string;
  uriHash?: string;
  permanentId?: string;
  resultUrl: string;
  source: string;
  title: string;
  name?: string;
}

export interface AttachedResultsState {
  attachedResults: AttachedResult[];
}

export function getAttachedResultsInitialState(): AttachedResultsState {
  return {
    attachedResults: [],
  };
}

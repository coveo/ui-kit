export interface AttachedResult {
  /**
   * Specifies the language of an attached Salesforce Knowledge Article.
   */
  articleLanguage?: string;
  /**
   * Specifies the version number of an attached Salesforce Knowledge Article.
   */
  articleVersionNumber?: string;
  /**
   * Specifies the publish status of an attached Salesforce Knowledge Article.
   */
  articlePublishStatus?: string;
  /**
   * The Id of the record (Case) the result is attached to.
   */
  caseId: string;
  /**
   * The Id of an attached Salesforce Knowledge Article.
   */
  knowledgeArticleId?: string;
  /**
   * The permanentId, the identifier of an attached result.
   */
  permanentId?: string;
  /**
   * The url of the attached result.
   */
  resultUrl: string;
  /**
   * The source name where the attached result comes from.
   */
  source?: string;
  /**
   * The title of the attached result.
   */
  title: string;
  /**
   * The uriHash of the attached result.
   */
  uriHash?: string;
}

export interface AttachedResultsState {
  /**
   * The array of results that are attached.
   */
  results: AttachedResult[];
  /**
   * A loading state, used to sync loading the attached results between multiple components.
   * // TODO: SFINT-6404 - Remove the loading property in UI-KIT V4 as its not used.
   */
  loading: boolean;
}

export function getAttachedResultsInitialState(): AttachedResultsState {
  return {
    results: [],
    loading: false,
  };
}

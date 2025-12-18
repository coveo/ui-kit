import {isNullOrUndefined} from '@coveo/bueno';
import type {Result} from '../../../api/search/search/result.js';
import {configuration} from '../../../app/common-reducers.js';
import type {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import {
  attachResult,
  detachResult,
} from '../../../features/attached-results/attached-results-actions.js';
import {
  logCaseDetach,
  logCitationDocumentAttach,
} from '../../../features/attached-results/attached-results-analytics-actions.js';
import {attachedResultsReducer as attachedResults} from '../../../features/attached-results/attached-results-slice.js';
import type {AttachedResult} from '../../../features/attached-results/attached-results-state.js';
import type {
  AttachedResultsSection,
  ConfigurationSection,
} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {
  buildController,
  type Controller,
} from '../../controller/headless-controller.js';
import type {GeneratedAnswerCitation} from '../../generated-answer/headless-generated-answer.js';

export interface AttachedCitationsProps {
  /**
   * The options for the `AttachedCitations` controller.
   */
  options: AttachedCitationsOptions;
}

export interface AttachedCitationsOptions {
  /**
   * The case ID to get attached citations for.
   */
  caseId: string;
}

export interface AttachedCitationsState {
  /**
   * The list of attached results for the specified case.
   */
  results: AttachedResult[];
}

export interface AttachedCitations extends Controller {
  /**
   * Check if a specific citation document is attached to this case.
   * @param citation - The citation to check if attached, with SearchAPI fields such as permanentId or uriHash.
   * @returns A boolean indicating if the citation document is attached.
   */
  isAttached(citation: GeneratedAnswerCitation): boolean;
  /**
   * Attach a new citation document by adding it to the attachedResults state.
   * @param citation - A citation document to add to the list of currently attached results.
   */
  attach(citation: GeneratedAnswerCitation): void;
  /**
   * Detach a citation document by removing it from the attachedResults state.
   * @param citation - A citation document to remove from the list of currently attached results.
   */
  detach(citation: GeneratedAnswerCitation): void;
  /**
   * The state of the `AttachedCitations` controller.
   * Returns all attached citation documents for this case.
   */
  state: AttachedCitationsState;
}

/**
 * Create an AttachedCitations controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `AttachedCitations` controller properties.
 * @returns An AttachedCitations controller instance.
 *
 * @group Controllers
 * @category AttachedCitations
 */
export function buildAttachedCitations(
  engine: InsightEngine,
  props: AttachedCitationsProps
): AttachedCitations {
  if (!loadAttachedResultsReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const controller = buildController(engine);
  const {caseId} = props.options;

  const isCitationAttached = (citation: GeneratedAnswerCitation): boolean => {
    if (isNullOrUndefined(caseId)) {
      return false;
    }

    if (
      isNullOrUndefined(citation.permanentid) &&
      isNullOrUndefined(citation.id)
    ) {
      return false;
    }

    return engine.state.attachedResults.results.some((attached) => {
      const caseIdMatches = attached.caseId === caseId;
      const permanentIdMatches =
        !isNullOrUndefined(citation.permanentid) &&
        attached.permanentId === citation.permanentid;
      const uriHashMatches =
        !isNullOrUndefined(citation.fields?.urihash) &&
        attached.uriHash === citation.fields?.urihash;
      const isCitation = attached.isCitation === true;

      return (
        caseIdMatches && isCitation && (permanentIdMatches || uriHashMatches)
      );
    });
  };

  const getAttachedResultsForRecord = (): AttachedResult[] => {
    return engine.state.attachedResults.results.filter(
      (attached) => attached.caseId === caseId && attached.isCitation === true
    );
  };

  const validateStringOrUndefined = (value: unknown): string | undefined => {
    return typeof value === 'string' ? value : undefined;
  };

  const mapCitationToAttachedResult = (
    citation: GeneratedAnswerCitation
  ): AttachedResult => {
    return {
      caseId,
      permanentId: citation.permanentid,
      resultUrl: citation.clickUri ?? citation.uri,
      title: citation.title,
      uriHash: validateStringOrUndefined(citation.fields?.urihash),
      source:
        citation.source ?? validateStringOrUndefined(citation.fields?.source),
      // Fields needed to support case articles
      knowledgeArticleId: validateStringOrUndefined(
        citation.fields?.knowledgeArticleId ?? citation.fields?.sfkbid
      ),
      articleLanguage: validateStringOrUndefined(citation.fields?.sflanguage),
      articleVersionNumber: validateStringOrUndefined(
        citation.fields?.sfversionnumber
      ),
      articlePublishStatus: validateStringOrUndefined(
        citation.fields?.sfpublishstatus
      ),
      isCitation: true,
    };
  };

  const mapCitationToResult = (citation: GeneratedAnswerCitation): Result => {
    return {
      title: citation.title || '',
      uri: citation.uri || '',
      clickUri: citation.clickUri || citation.uri || '',
      uniqueId: citation.id || '',
      raw: {
        permanentid: citation.permanentid || '',
        urihash: validateStringOrUndefined(citation.fields?.urihash) || '',
        collection:
          validateStringOrUndefined(citation.fields?.collection) || 'default',
        source:
          citation.source ||
          validateStringOrUndefined(citation.fields?.source) ||
          '',
        author: validateStringOrUndefined(citation.fields?.author) || '',
      },
      // Minimal required fields with defaults
      printableUri: '',
      excerpt: '',
      firstSentences: '',
      summary: null,
      flags: '',
      hasHtmlVersion: false,
      score: 0,
      percentScore: 0,
      rankingInfo: null,
      isTopResult: false,
      isRecommendation: false,
      titleHighlights: [],
      firstSentencesHighlights: [],
      excerptHighlights: [],
      printableUriHighlights: [],
      summaryHighlights: [],
      absentTerms: [],
      isUserActionView: false,
      searchUid: '',
    } as Result;
  };

  return {
    ...controller,

    get state() {
      return {
        results: getAttachedResultsForRecord(),
      };
    },

    isAttached(citation: GeneratedAnswerCitation): boolean {
      return isCitationAttached(citation);
    },

    attach(citation: GeneratedAnswerCitation): void {
      const resultToAttach = mapCitationToAttachedResult(citation);
      dispatch(attachResult(resultToAttach));
      dispatch(logCitationDocumentAttach(citation));
    },

    detach(citation: GeneratedAnswerCitation): void {
      const resultToDetach = mapCitationToAttachedResult(citation);
      dispatch(detachResult(resultToDetach));
      // logCaseDetach takes a result as param
      const citationAsResult = mapCitationToResult(citation);
      dispatch(logCaseDetach(citationAsResult));
    },
  };
}

function loadAttachedResultsReducers(
  engine: InsightEngine
): engine is InsightEngine<ConfigurationSection & AttachedResultsSection> {
  engine.addReducers({configuration, attachedResults});
  return true;
}

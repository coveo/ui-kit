import type {
  BaseParam,
  ClientIDParam,
  ContextParam,
  DebugParam,
  LocaleParam,
  NumberOfResultsParam,
} from '../../../platform-service-params.js';
import type {AnalyticsParam} from '../../../search/search-api-params.js';
import {
  baseCaseAssistRequest,
  type CaseAssistIdParam,
  type FieldsParam,
  prepareSuggestionRequestFields,
} from '../case-assist-params.js';

export type GetDocumentSuggestionsRequest = BaseParam &
  CaseAssistIdParam &
  ClientIDParam &
  LocaleParam &
  FieldsParam &
  ContextParam &
  NumberOfResultsParam &
  DebugParam &
  AnalyticsParam;

export const buildGetDocumentSuggestionsRequest = (
  req: GetDocumentSuggestionsRequest
) => {
  const queryStringArguments: Record<string, string> = {};
  if (req.debug) {
    queryStringArguments.debug = '1';
  }
  if (req.numberOfResults) {
    queryStringArguments.numberOfResults = req.numberOfResults.toString();
  }

  return {
    ...baseCaseAssistRequest(
      req,
      'POST',
      'application/json',
      '/documents/suggest',
      queryStringArguments
    ),
    requestParams: prepareRequestParams(req),
  };
};

const prepareRequestParams = (req: GetDocumentSuggestionsRequest) => ({
  clientId: req.clientId,
  locale: req.locale,
  fields: prepareSuggestionRequestFields(req.fields),
  context: req.context,
  analytics: req.analytics,
});

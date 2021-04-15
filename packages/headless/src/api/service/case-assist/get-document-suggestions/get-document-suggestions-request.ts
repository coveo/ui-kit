import {
  BaseParam,
  ContextParam,
  DebugParam,
  LocaleParam,
  NumberOfResultsParam,
  VisitorIDParam,
} from '../../../platform-service-params';
import {
  baseCaseAssistRequest,
  CaseAssistIdParam,
  FieldsParam,
  prepareSuggestionRequestFields,
} from '../case-assist-params';

export type GetDocumentSuggestionsRequest = BaseParam &
  CaseAssistIdParam &
  VisitorIDParam &
  LocaleParam &
  FieldsParam &
  ContextParam &
  NumberOfResultsParam &
  DebugParam;

export const buildGetDocumentSuggestionsRequest = (
  req: GetDocumentSuggestionsRequest
) => {
  const queryStringArguments: Record<string, string> = {};
  if (req.debug) {
    queryStringArguments['debug'] = '1';
  }
  if (req.numberOfResults) {
    queryStringArguments['numberOfResults'] = req.numberOfResults.toString();
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
  visitorId: req.visitorId,
  locale: req.locale,
  fields: prepareSuggestionRequestFields(req.fields),
  context: req.context,
});

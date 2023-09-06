import {
  BaseParam,
  ClientIDParam,
  ContextParam,
  DebugParam,
  LocaleParam,
} from '../../../platform-service-params';
import {
  baseCaseAssistRequest,
  CaseAssistIdParam,
  FieldsParam,
  prepareSuggestionRequestFields,
} from '../case-assist-params';

export type GetCaseClassificationsRequest = BaseParam &
  CaseAssistIdParam &
  ClientIDParam &
  LocaleParam &
  FieldsParam &
  ContextParam &
  DebugParam;

export const buildGetCaseClassificationsRequest = (
  req: GetCaseClassificationsRequest
) => {
  const queryStringArguments: Record<string, string> = req.debug
    ? {debug: '1'}
    : {};

  return {
    ...baseCaseAssistRequest(
      req,
      'POST',
      'application/json',
      '/classify',
      queryStringArguments
    ),
    requestParams: prepareRequestParams(req),
  };
};

const prepareRequestParams = (req: GetCaseClassificationsRequest) => ({
  clientId: req.clientId,
  locale: req.locale,
  fields: prepareSuggestionRequestFields(req.fields),
});

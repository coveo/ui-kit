import type {
  BaseParam,
  ClientIDParam,
  ContextParam,
  DebugParam,
  LocaleParam,
} from '../../../platform-service-params.js';
import {
  baseCaseAssistRequest,
  type CaseAssistIdParam,
  type FieldsParam,
  prepareSuggestionRequestFields,
} from '../case-assist-params.js';

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

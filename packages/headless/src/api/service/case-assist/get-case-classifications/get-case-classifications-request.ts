import {
  BaseParam,
  DebugParam,
  LocaleParam,
  VisitorIDParam,
} from '../../../platform-service-params';
import {
  baseCaseAssistRequest,
  CaseAssistIdParam,
  FieldsParam,
  prepareSuggestionRequestFields,
} from '../case-assist-params';

export type GetCaseClassificationsRequest = BaseParam &
  CaseAssistIdParam &
  VisitorIDParam &
  LocaleParam &
  FieldsParam &
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
  visitorId: req.visitorId,
  locale: req.locale,
  fields: prepareSuggestionRequestFields(req.fields),
});

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

export type ClassifyParam = BaseParam &
  CaseAssistIdParam &
  VisitorIDParam &
  LocaleParam &
  FieldsParam &
  DebugParam;

export const buildClassifyRequest = (req: ClassifyParam) => {
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
    requestParams: prepareClassifyRequestParams(req),
  };
};

export const prepareClassifyRequestParams = (req: ClassifyParam) => ({
  visitorId: req.visitorId,
  locale: req.locale,
  fields: prepareSuggestionRequestFields(req.fields),
});

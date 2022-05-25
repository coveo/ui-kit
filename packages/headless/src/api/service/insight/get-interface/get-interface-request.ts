import {BaseParam} from '../../../platform-service-params';
import {baseInsightRequest, InsightIdParam} from '../insight-params';

export type GetInsightInterfaceRequest = BaseParam & InsightIdParam;

export const buildGetInsightInterfaceRequest = (
  req: GetInsightInterfaceRequest
) => {
  return {
    ...baseInsightRequest(req, 'GET', 'application/json', '/interface'),
    requestParams: {},
  };
};

import {BaseParam} from '../../../platform-service-params';
import {baseInsightRequest, InsightIdParam} from '../insight-params';

export type GetInsightInterfaceConfigRequest = BaseParam & InsightIdParam;

export const buildGetInsightInterfaceConfigRequest = (
  req: GetInsightInterfaceConfigRequest
) => {
  return {
    ...baseInsightRequest(req, 'GET', 'application/json', '/interface'),
    requestParams: {},
  };
};

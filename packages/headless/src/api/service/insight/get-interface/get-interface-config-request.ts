import type {BaseParam} from '../../../platform-service-params.js';
import {baseInsightRequest, type InsightIdParam} from '../insight-params.js';

export type GetInsightInterfaceConfigRequest = BaseParam & InsightIdParam;

export const buildGetInsightInterfaceConfigRequest = (
  req: GetInsightInterfaceConfigRequest
) => {
  return {
    ...baseInsightRequest(req, 'GET', 'application/json', '/interface'),
    requestParams: {},
  };
};

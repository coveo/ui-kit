import type {BaseParam} from '../../../platform-service-params.js';
import {baseInsightUserActionRequest} from '../insight-params.js';

export type InsightUserActionsRequest = BaseParam & UserIdParam;

interface UserIdParam {
  /**
   *  Identifier of the user from which Clicked Documents are shown.
   */
  userId: string;
}

export const buildInsightUserActionsRequest = (
  req: InsightUserActionsRequest
) => {
  return {
    ...baseInsightUserActionRequest(req, 'POST', 'application/json'),
    requestParams: {
      objectId: req.userId,
    },
  };
};

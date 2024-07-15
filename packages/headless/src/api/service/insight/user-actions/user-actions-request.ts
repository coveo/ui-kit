import {BaseParam} from '../../../platform-service-params';
import {baseInsightUserActionRequest} from '../insight-params';

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

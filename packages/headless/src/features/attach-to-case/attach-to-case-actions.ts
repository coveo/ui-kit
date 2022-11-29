import {RecordValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  validatePayload,
  requiredNonEmptyString,
  nonEmptyString,
} from '../../utils/validate-payload';

export interface ResultToAttach {
  knowledgeArticleId: string;
  articleLanguage: string;
  articleVersionNumber: string;
  articlePublishStatus: string;
  uriHash: string;
  permanentId: string;
  resultUrl: string;
  source: string;
  title: string;
}

export interface SetAttachToCaseAttachActionCreatorPayload {
  result: ResultToAttach;
}

export const attachResult = createAction(
  'insight/attachToCase/attach',
  (payload: SetAttachToCaseAttachActionCreatorPayload) =>
    validatePayload(payload, {
      result: new RecordValue({
        options: {
          required: true,
        },
        values: {
          knowledgeArticleId: nonEmptyString,
          articleLanguage: nonEmptyString,
          articleVersionNumber: nonEmptyString,
          articlePublishStatus: nonEmptyString,
          uriHash: nonEmptyString,
          permanentId: requiredNonEmptyString,
          resultUrl: requiredNonEmptyString,
          source: requiredNonEmptyString,
          title: requiredNonEmptyString,
        },
      }),
    })
);

export const detachResult = createAction(
  'insight/attachToCase/detach',
  (payload: string) => validatePayload(payload, requiredNonEmptyString)
);

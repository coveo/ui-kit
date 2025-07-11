import type {BaseParam} from '../platform-service-params.js';

interface GeneratedAnswerParam {
  streamId?: string;
}

export type GeneratedAnswerStreamRequest = BaseParam & GeneratedAnswerParam;

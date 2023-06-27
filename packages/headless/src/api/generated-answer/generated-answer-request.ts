import {BaseParam} from '../platform-service-params';

interface GeneratedAnswerParam {
  streamId?: string;
}

export type GeneratedAnswerStreamRequest = BaseParam & GeneratedAnswerParam;

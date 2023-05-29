import {BaseParam} from '../platform-service-params';

interface GeneratedAnswerParam {
  streamKey?: string;
}

export type GeneratedAnswerStreamRequest = BaseParam & GeneratedAnswerParam;

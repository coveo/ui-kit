export enum StreamFinishReason {
  Completed = 'COMPLETED',
  Error = 'ERROR',
}

export interface GeneratedAnswerStreamEventData {
  payload: string;
  finishReason?: StreamFinishReason;
  errorMessage?: string;
  errorCode?: number;
}

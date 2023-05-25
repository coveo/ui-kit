export interface GeneratedAnswerStreamEventData {
  payload: string;
  finishReason?: 'COMPLETED' | 'ERROR';
  errorMessage?: string;
}

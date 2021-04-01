export interface UserActionsSuccessContent {
  value: {
    name: string;
    time: string;
    value: string;
  }[];
  debug: unknown;
  internalExecutionLog: unknown;
  executionTime: number;
}

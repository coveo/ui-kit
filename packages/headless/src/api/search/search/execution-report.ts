export interface ExecutionReport {
  duration: number;
  children: ExecutionReportSection[];
}

export interface ExecutionReportSection {
  name: string;
  duration: number;
  description: string;
  result?: Record<string, unknown>;
  children?: ExecutionReportSection[];
  [key: string]: unknown;
}

export interface BaseParam {
  url: string;
  accessToken: string;
  organizationId: string;
}

export interface ContextParam {
  context?: Record<string, string | string[]>;
}

export interface DebugParam {
  debug?: boolean;
}

export interface LocaleParam {
  locale?: string;
}

export interface NumberOfResultsParam {
  numberOfResults?: number;
}

export interface VisitorIDParam {
  visitorId?: string;
}

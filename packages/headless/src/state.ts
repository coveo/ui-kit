export interface HeadlessState {
  query: QueryState;
  configuration: ConfigurationState;
  redirection: RedirectionState;
}

export interface ConfigurationState {
  organizationId: string;
  accessToken: string;
  search: {
    endpoint: string;
  };
}

export interface QueryState {
  q: string;
}

export interface RedirectionState {
  redirectTo: string | null;
}

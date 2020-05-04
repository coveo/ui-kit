declare module '@coveo/headless' {
  interface HeadlessOptions {
    configuration: HeadlessConfiguration;
  }

  export interface HeadlessConfiguration {
    organization: string;
    accessToken: string;
    renewAccessToken?: () => Promise<string>;
    search?: {
      endpoint?: string;
    };
  }

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
}

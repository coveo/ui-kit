export type CommerceStandaloneSearchBoxSetState = Record<
  string,
  StandaloneSearchBoxEntry | undefined
>;

export type StandaloneSearchBoxEntry = {
  defaultRedirectionUrl: string;
  isLoading: boolean;
  redirectTo: string;
};

export function getCommerceStandaloneSearchBoxSetInitialState(): CommerceStandaloneSearchBoxSetState {
  return {};
}

export type CommerceStandaloneSearchBoxSetState = Record<
  string,
  StandaloneSearchBoxEntry | undefined
>;

export type StandaloneSearchBoxEntry = {
  defaultRedirectionUrl: string;
  redirectTo: string;
};

export function getCommerceStandaloneSearchBoxSetInitialState(): CommerceStandaloneSearchBoxSetState {
  return {};
}

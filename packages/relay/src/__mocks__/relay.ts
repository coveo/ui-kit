import { RelayOptions } from "../relay";

const defaultOption: RelayOptions = {
  token: "I am token",
  organizationId: "my-org",
  host: "https://platform.cloud.coveo.com",
  trackingId: "website",
};

export function createMockOptions(
  options?: Partial<RelayOptions>
): RelayOptions {
  return {
    ...defaultOption,
    ...options,
  };
}

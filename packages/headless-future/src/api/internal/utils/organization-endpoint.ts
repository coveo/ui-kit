export type PlatformEnvironment = 'prod' | 'dev' | 'stg' | 'hipaa';

export type PlatformEndpointType = 'admin' | 'analytics' | 'platform';

export interface ResolveOrganizationEndpointOptions {
  environment?: PlatformEnvironment;
  endpointType?: PlatformEndpointType;
  endpoint?: string;
}

export function getOrganizationEndpoint(
  organizationId: string,
  {
    environment = 'prod',
    endpointType = 'platform',
    endpoint,
  }: ResolveOrganizationEndpointOptions = {}
) {
  if (endpoint) {
    return endpoint;
  }

  const environmentSuffix = environment === 'prod' ? '' : environment;
  const endpointTypePart =
    endpointType === 'platform' ? '' : `.${endpointType}`;

  return `https://${organizationId}${endpointTypePart}.org${environmentSuffix}.coveo.com`;
}

type PlatformEnvironment = 'prod' | 'dev' | 'stg' | 'hipaa';

type PlatformEndpointType = 'admin' | 'analytics' | 'platform';

export interface ResolveOrganizationEndpointOptions {
  environment?: PlatformEnvironment;
  endpointType?: PlatformEndpointType;
}

export function getOrganizationEndpoint(
  organizationId: string,
  {environment = 'prod', endpointType = 'platform'}: ResolveOrganizationEndpointOptions = {}
) {
  const environmentSuffix = environment === 'prod' ? '' : environment;
  const endpointTypePart = endpointType === 'platform' ? '' : `.${endpointType}`;

  return `https://${organizationId}${endpointTypePart}.org${environmentSuffix}.coveo.com`;
}

import {Schema, SchemaValue, StringValue} from '@coveo/bueno';
import {getOrganizationEndpoint, PlatformEnvironment} from '@coveo/headless';

export interface InitializationOptions {
  /**
   * The unique identifier of the target Coveo Cloud organization (e.g., `mycoveocloudorganizationg8tp8wu3`)
   */
  organizationId: string;
  /**
   * The access token to use to authenticate requests against the Coveo Cloud endpoints. Typically, this will be an API key or search token that grants the privileges to execute queries and push usage analytics data in the target Coveo Cloud organization.
   */
  accessToken: string;
  environment?: PlatformEnvironment;
}

export const validateOptions = (
  opts: InitializationOptions,
  additionalSchemaValidation: Record<string, SchemaValue<unknown>>
) => {
  try {
    new Schema({
      organizationId: new StringValue({required: true, emptyAllowed: false}),
      accessToken: new StringValue({required: true, emptyAllowed: false}),
      environment: new StringValue<PlatformEnvironment>({
        required: false,
        default: 'prod',
        constrainTo: ['prod', 'hipaa', 'stg', 'dev'],
      }),
      ...additionalSchemaValidation,
    }).validate(opts);
  } catch (e) {
    console.error(e);
  }
};

export const extractPlatformUrl = (options: InitializationOptions) => {
  return getOrganizationEndpoint(
    options.organizationId,
    options.environment,
    'admin'
  );
};

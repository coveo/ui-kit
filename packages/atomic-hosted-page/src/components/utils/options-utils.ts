import {Schema, SchemaValue, StringValue} from '@coveo/bueno';
import {getOrganizationEndpoints} from '@coveo/headless';

export interface InitializationOptions {
  /**
   * The unique identifier of the target Coveo Cloud organization (e.g., `mycoveocloudorganizationg8tp8wu3`)
   */
  organizationId: string;
  /**
   * The access token to use to authenticate requests against the Coveo Cloud endpoints. Typically, this will be an API key or search token that grants the privileges to execute queries and push usage analytics data in the target Coveo Cloud organization.
   */
  accessToken: string;
  /**
   * The endpoints to use.
   *
   * For example: `https://orgid.admin.org.coveo.com`
   *
   * The [getOrganizationEndpoints](https://github.com/coveo/ui-kit/blob/master/packages/headless/src/api/platform-client.ts) helper function can be useful to create the appropriate object.
   */
  organizationEndpoints: ReturnType<typeof getOrganizationEndpoints>;
}

export const validateOptions = (
  opts: InitializationOptions,
  additionalSchemaValidation: Record<string, SchemaValue<unknown>>
) => {
  try {
    new Schema({
      organizationId: new StringValue({required: true, emptyAllowed: false}),
      accessToken: new StringValue({required: true, emptyAllowed: false}),
      platformUrl: new StringValue({required: false, emptyAllowed: false}),
      ...additionalSchemaValidation,
    }).validate(opts);
  } catch (e) {
    console.error(e);
  }
};

export const extractPlatformUrl = (options: InitializationOptions) =>
  options.organizationEndpoints.admin;

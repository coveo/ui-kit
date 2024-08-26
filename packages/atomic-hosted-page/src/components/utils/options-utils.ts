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
   * The Platform URL to use. (e.g., https://platform.cloud.coveo.com)
   * The platformUrl() helper method can be useful to know what url is available.
   * @defaultValue `https://platform.cloud.coveo.com`
   *
   * @deprecated Coveo recommends using organizationEndpoints instead, since it has resiliency benefits and simplifies the overall configuration for multi-region deployments.
   */
  platformUrl?: string;
  /**
   * The endpoints to use.
   *
   * For example: `https://orgid.admin.org.coveo.com`
   *
   * The [getOrganizationEndpoints](https://github.com/coveo/ui-kit/blob/v2/packages/headless/src/api/platform-client.ts) helper function can be useful to create the appropriate object.
   *
   * We recommend using this option, since it has resiliency benefits and simplifies the overall configuration for multi-region deployments.
   */
  organizationEndpoints?: ReturnType<typeof getOrganizationEndpoints>;
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
  options.platformUrl ||
  options.organizationEndpoints?.admin ||
  `https://${options.organizationId}.admin.org.coveo.com`;

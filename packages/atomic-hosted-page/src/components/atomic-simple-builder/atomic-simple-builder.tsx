import {Schema, StringValue} from '@coveo/bueno';
import {Component, ComponentInterface, Method, Element} from '@stencil/core';
import {processHostedPage} from '../atomic-hosted-page/hosted-pages';

interface AtomicSimpleBuilderInitializationOptions {
  /**
   * The unique identifier of the search interface.
   */
  interfaceId: string;
  /**
   * The unique identifier of the target Coveo Cloud organization (e.g., `mycoveocloudorganizationg8tp8wu3`)
   */
  organizationId: string;
  /**
   * The access token to use to authenticate requests against the Coveo Cloud endpoints. Typically, this will be an API key or search token that grants the privileges to execute queries and push usage analytics data in the target Coveo Cloud organization.
   */
  accessToken: string;
  /**
   * The Plaform URL to use. (e.g., https://platform.cloud.coveo.com)
   * The platformUrl() helper method can be useful to know what url is available.
   * @defaultValue `https://platform.cloud.coveo.com`
   */
  platformUrl?: string;
}

/**
 * A Web Component used to inject a [Coveo Search Interface made with the simple builder](https://docs.coveo.com/en/m7e92019/adobe/build-the-search-solution-using-a-coveo-ui-library-directly#search-interface-builder) in the DOM.
 * Pulls from the [Search Interfaces API](https://platform.cloud.coveo.com/docs?urls.primaryName=Search%20Interface%20Service#/)
 * @internal
 */
@Component({
  tag: 'atomic-simple-builder',
  shadow: false,
})
export class AtomicSimpleBuilder implements ComponentInterface {
  @Element() private element!: HTMLElement;

  private validateOptions(opts: AtomicSimpleBuilderInitializationOptions) {
    try {
      new Schema({
        organizationId: new StringValue({required: true, emptyAllowed: false}),
        interfaceId: new StringValue({required: true, emptyAllowed: false}),
        accessToken: new StringValue({required: true, emptyAllowed: false}),
        platformUrl: new StringValue({required: false, emptyAllowed: false}),
      }).validate(opts);
    } catch (e) {
      console.error(e);
    }
  }

  @Method() public async initialize(
    options: AtomicSimpleBuilderInitializationOptions
  ) {
    this.validateOptions(options);
    const platformUrl =
      options.platformUrl || 'https://platform.cloud.coveo.com';

    try {
      const pageResponse = await fetch(
        `${platformUrl}/rest/organizations/${options.organizationId}/searchinterfaces/${options.interfaceId}/hostedpage`,
        {
          headers: {
            Authorization: `Bearer ${options.accessToken}`,
          },
        }
      );

      processHostedPage(this.element, await pageResponse.json());
    } catch (e) {
      console.error(e);
    }
  }
}

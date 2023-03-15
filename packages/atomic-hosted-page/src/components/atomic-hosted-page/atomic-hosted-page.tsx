import {Schema, StringValue} from '@coveo/bueno';
import {Component, ComponentInterface, Method, Element} from '@stencil/core';
import {processHostedPage} from './hosted-pages';

interface AtomicHostedPageInitializationOptions {
  /**
   * The unique identifier of the hosted page.
   */
  pageId: string;
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
 * A Web Component used to inject a Coveo Hosted Search Page in the DOM.
 * Pulls from the [Hosted Pages API](https://platform.cloud.coveo.com/docs?urls.primaryName=Search%20Interface%20Service#/Hosted%20Page)
 * @internal
 */
@Component({
  tag: 'atomic-hosted-page',
  shadow: false,
})
export class AtomicHostedPage implements ComponentInterface {
  @Element() private element!: HTMLElement;

  private validateOptions(opts: AtomicHostedPageInitializationOptions) {
    try {
      new Schema({
        organizationId: new StringValue({required: true, emptyAllowed: false}),
        pageId: new StringValue({required: true, emptyAllowed: false}),
        accessToken: new StringValue({required: true, emptyAllowed: false}),
        platformUrl: new StringValue({required: false, emptyAllowed: false}),
      }).validate(opts);
    } catch (e) {
      console.error(e);
    }
  }

  @Method() public async initialize(
    options: AtomicHostedPageInitializationOptions
  ) {
    this.validateOptions(options);
    const platformUrl =
      options.platformUrl || 'https://platform.cloud.coveo.com';

    try {
      const pageResponse = await fetch(
        `${platformUrl}/rest/organizations/${options.organizationId}/hostedpages/${options.pageId}`,
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

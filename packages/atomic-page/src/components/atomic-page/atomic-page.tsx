import {Schema, StringValue} from '@coveo/bueno';
import {
  Component,
  h,
  ComponentInterface,
  Method,
  State,
  Element,
} from '@stencil/core';
import {HostedPage} from './hosted-pages';

interface AtomicPageInitializationOptions {
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
 * @internal
 */
@Component({
  tag: 'atomic-page',
  shadow: false,
})
export class AtomicPage implements ComponentInterface {
  @State() private error?: Error;
  @Element() private element!: HTMLElement;

  private validateOptions(opts: AtomicPageInitializationOptions) {
    try {
      new Schema({
        organizationId: new StringValue({required: true, emptyAllowed: false}),
        pageId: new StringValue({required: true, emptyAllowed: false}),
        accessToken: new StringValue({required: true, emptyAllowed: false}),
        platformUrl: new StringValue({required: false, emptyAllowed: false}),
      }).validate(opts);
    } catch (e) {
      this.error = e as Error;
    }
  }

  private processHostedPage(hostedPage: HostedPage) {
    console.log('hostedPage', hostedPage);
  }

  @Method() public async initialize(options: AtomicPageInitializationOptions) {
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

      this.processHostedPage(await pageResponse.json());
    } catch (e) {
      this.error = e as Error;
    }
  }

  public render() {
    if (this.error) {
      return (
        <atomic-component-error
          style={{'--atomic-error': '#ce3f00;'}}
          element={this.element}
          error={this.error}
        ></atomic-component-error>
      );
    }
  }
}

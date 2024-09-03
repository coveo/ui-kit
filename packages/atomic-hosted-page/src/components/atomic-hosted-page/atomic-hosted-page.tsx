import {StringValue} from '@coveo/bueno';
import {Component, ComponentInterface, Method, Element} from '@stencil/core';
import {
  InitializationOptions,
  extractPlatformUrl,
  validateOptions,
} from '../utils/options-utils';
import {processHostedPage} from './hosted-pages';

interface AtomicHostedPageInitializationOptions extends InitializationOptions {
  /**
   * The unique identifier of the hosted page.
   */
  pageId: string;
}

/**
 * A Web Component used to inject a Coveo Hosted Search Page in the DOM.
 * Pulls from the [Hosted Pages API](https://platform.cloud.coveo.com/docs?urls.primaryName=Search%20Interface%20Service#/Hosted%20Page)
 * @deprecated Use `<atomic-hosted-ui type="code"></atomic-hosted-ui>` instead {@link AtomicHostedUI}.
 */
@Component({
  tag: 'atomic-hosted-page',
  shadow: false,
})
export class AtomicHostedPage implements ComponentInterface {
  @Element() private element!: HTMLElement;

  private validateOptions(opts: AtomicHostedPageInitializationOptions) {
    validateOptions(opts, {
      pageId: new StringValue({required: true, emptyAllowed: false}),
    });
  }

  @Method() public async initialize(
    options: AtomicHostedPageInitializationOptions
  ) {
    this.validateOptions(options);
    const platformUrl = extractPlatformUrl(options);
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

import {StringValue} from '@coveo/bueno';
import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {
  extractPlatformUrl,
  validateOptions,
  type InitializationOptions,
} from '../utils/options-utils.js';
import {processHostedPage} from './hosted-ui.js';

interface AtomicHostedUIInitializationOptions extends InitializationOptions {
  /**
   * The unique identifier of the hosted search page.
   */
  pageId: string;
}

/**
 * A Web Component used to inject a Coveo Hosted Search Page in the DOM.
 * Pulls from the [Search Interfaces API](https://platform.cloud.coveo.com/docs?urls.primaryName=Search%20Interface%20Service#/)
 */
@customElement('atomic-hosted-ui')
export class AtomicHostedUI extends LitElement {
  private validateOptions(opts: AtomicHostedUIInitializationOptions) {
    validateOptions(opts, {
      pageId: new StringValue({required: true, emptyAllowed: false}),
    });
  }

  /**
   * The type of hosted search page to load.
   */
  @property({attribute: 'hosted-type'})
  hostedType: 'trial' | 'builder' | 'code' = 'code';

  public async initialize(options: AtomicHostedUIInitializationOptions) {
    console.log('initialize', options);
    this.validateOptions(options);

    try {
      processHostedPage(this, await this.getHostedPage(options));
    } catch (e) {
      console.error(e);
    }
  }

  private async getHostedPage(options: AtomicHostedUIInitializationOptions) {
    const platformUrl = extractPlatformUrl(options);

    const paths = {
      builder: {
        pagePathPrefix: 'searchpage/v1/interfaces',
        pagePath: '/json',
      },
      trial: {
        pagePathPrefix: 'searchinterfaces',
        pagePath: '/hostedpage/v1',
      },
      code: {
        pagePathPrefix: 'hostedpages',
        pagePath: '',
      },
    } as const;

    const {pagePathPrefix, pagePath} = paths[this.hostedType];

    const pageResponse = await fetch(
      `${platformUrl}/rest/organizations/${options.organizationId}/${pagePathPrefix}/${options.pageId}${pagePath}`,
      {
        headers: {
          Authorization: `Bearer ${options.accessToken}`,
        },
      }
    );

    return await pageResponse.json();
  }
  render() {
    return html`<slot></slot>`;
  }
}

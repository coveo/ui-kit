import {StringValue} from '@coveo/bueno';
import {
  PlatformEnvironment,
  getOrganizationEndpoints as getOrganizationEndpointsHeadless,
} from '@coveo/headless';
import {
  Component,
  ComponentInterface,
  Method,
  Element,
  Prop,
} from '@stencil/core';
import {
  InitializationOptions,
  extractPlatformUrl,
  validateOptions,
} from '../utils/options-utils';
import {processHostedPage} from './hosted-ui';

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
@Component({
  tag: 'atomic-hosted-ui',
  shadow: false,
})
export class AtomicHostedUI implements ComponentInterface {
  @Element() private element!: HTMLElement;

  private validateOptions(opts: AtomicHostedUIInitializationOptions) {
    validateOptions(opts, {
      pageId: new StringValue({required: true, emptyAllowed: false}),
    });
  }

  /**
   * The type of hosted search page to load.
   */
  @Prop({reflect: true}) public hostedType: 'legacy' | 'page' | 'custom' =
    'page';

  @Method() public async initialize(
    options: AtomicHostedUIInitializationOptions
  ) {
    this.validateOptions(options);

    try {
      processHostedPage(this.element, await this.getHostedPage(options));
    } catch (e) {
      console.error(e);
    }
  }

  private async getHostedPage(options: AtomicHostedUIInitializationOptions) {
    const platformUrl = extractPlatformUrl(options);

    const paths = {
      page: {
        pagePathPrefix: 'searchpage/v1/interfaces',
        pagePath: '/json',
      },
      legacy: {
        pagePathPrefix: 'searchinterfaces',
        pagePath: '/hostedpage/v1',
      },
      custom: {
        pagePathPrefix: 'hostedpages',
        pagePath: '',
      },
    };

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

  /**
   * Returns the unique, organization-specific endpoint(s).
   * @param {string} organizationId
   * @param {'prod'|'hipaa'|'staging'|'dev'} [env=Prod]
   */
  @Method() public async getOrganizationEndpoints(
    organizationId: string,
    env: PlatformEnvironment = 'prod'
  ) {
    return getOrganizationEndpointsHeadless(organizationId, env);
  }
}

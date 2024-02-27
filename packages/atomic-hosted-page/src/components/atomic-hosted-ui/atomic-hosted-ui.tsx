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
import {HostedPageType, processHostedPage} from './hosted-ui';

interface AtomicHostedUIInitializationOptions extends InitializationOptions {
  /**
   * The unique identifier of the hosted search page.
   */
  pageId: string;
}

/**
 * @internal
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
   * The type of hosted search page to load
   * E.g., 'page', 'custom', 'legacy'
   */
  @Prop({reflect: true}) public hostedType: HostedPageType = 'page';

  @Method() public async initialize(
    options: AtomicHostedUIInitializationOptions
  ) {
    this.validateOptions(options);
    const platformUrl = extractPlatformUrl(options);

    try {
      processHostedPage(
        this.element,
        await this.getPageManifest(platformUrl, options)
      );
    } catch (e) {
      console.error(e);
    }
  }

  private async getPageManifest(
    platformUrl: string,
    options: AtomicHostedUIInitializationOptions
  ) {
    const paths = {
      page: {
        pagePathPrefix: 'searchpage/v1/interfaces',
        loaderPath: '/loader',
        manifestPath: '/manifest',
      },
      legacy: {
        pagePathPrefix: 'searchinterfaces',
        loaderPath: '/hostedpage/v1',
        manifestPath: '/manifest/v1',
      },
      custom: {
        pagePathPrefix: 'hostedpages',
        loaderPath: '',
        manifestPath: '',
      },
    };

    const {pagePathPrefix, loaderPath, manifestPath} = paths[this.hostedType];

    const pageResponse = await fetch(
      `${platformUrl}/rest/organizations/${options.organizationId}/${pagePathPrefix}/${options.pageId}${loaderPath}`,
      {
        headers: {
          Authorization: `Bearer ${options.accessToken}`,
        },
      }
    );

    const pageManifestResponse =
      this.hostedType !== 'custom'
        ? await fetch(
            `${platformUrl}/rest/organizations/${options.organizationId}/${pagePathPrefix}/${options.pageId}${manifestPath}`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${options.accessToken}`,
              },
              body: JSON.stringify({
                pagePlaceholders: {
                  results: '--results--',
                },
              }),
            }
          ).then((response) => response.json())
        : null;

    return this.hostedType !== 'page'
      ? await pageResponse.json()
      : {
          id: options.pageId,
          html: '',
          javascript: [
            {isModule: false, inlineContent: await pageResponse.text()},
          ],
          css: [
            {
              inlineContent: pageManifestResponse.style.layout,
            },
            {
              inlineContent: pageManifestResponse.style.theme,
            },
          ],
          name: pageManifestResponse.config.name,
          created: pageManifestResponse.config.created,
          createdBy: pageManifestResponse.config.createdBy,
          updated: pageManifestResponse.config.updated,
          updatedBy: pageManifestResponse.config.updatedBy,
        };
  }

  /**
   * Returns the unique, organization-specific endpoint(s)
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

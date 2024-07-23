import {StringValue} from '@coveo/bueno';
import {
  PlatformEnvironment,
  getOrganizationEndpoints as getOrganizationEndpointsHeadless,
} from '@coveo/headless';
import {Component, ComponentInterface, Method, Element} from '@stencil/core';
import {processHostedPage} from '../atomic-hosted-page/hosted-pages';
import {
  InitializationOptions,
  extractPlatformUrl,
  validateOptions,
} from '../utils/options-utils';

interface AtomicSimpleBuilderInitializationOptions
  extends InitializationOptions {
  /**
   * The unique identifier of the search interface.
   */
  interfaceId: string;
}

/**
 * A Web Component used to inject a [Coveo Search Interface made with the simple builder](https://docs.coveo.com/en/m7e92019/adobe/build-the-search-solution-using-a-coveo-ui-library-directly#search-interface-builder) in the DOM.
 * Pulls from the [Search Interfaces API](https://platform.cloud.coveo.com/docs?urls.primaryName=Search%20Interface%20Service#/)
 * @deprecated Use `<atomic-hosted-ui type="trial"></atomic-hosted-ui>` instead {@link AtomicHostedUI}.
 */
@Component({
  tag: 'atomic-simple-builder',
  shadow: false,
})
export class AtomicSimpleBuilder implements ComponentInterface {
  @Element() private element!: HTMLElement;

  private validateOptions(opts: AtomicSimpleBuilderInitializationOptions) {
    validateOptions(opts, {
      interfaceId: new StringValue({required: true, emptyAllowed: false}),
    });
  }

  @Method() public async initialize(
    options: AtomicSimpleBuilderInitializationOptions
  ) {
    this.validateOptions(options);
    const platformUrl = extractPlatformUrl(options);

    try {
      const pageResponse = await fetch(
        `${platformUrl}/rest/organizations/${options.organizationId}/searchinterfaces/${options.interfaceId}/hostedpage/v1`,
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

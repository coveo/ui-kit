import {Schema, StringValue} from '@coveo/bueno';
import {Component, ComponentInterface, Method, Element} from '@stencil/core';
import {
  HostedPage,
  HostedPageJavascriptFile,
  HostedPageCssFile,
} from './hosted-pages';

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
  tag: 'atomic-hosted-page',
  shadow: false,
})
export class AtomicHostedPage implements ComponentInterface {
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
      console.error(e);
    }
  }

  private processHostedPage(hostedPage: HostedPage) {
    this.element.innerHTML = hostedPage.html;
    hostedPage.javascript?.forEach((file) => this.insertJS(file));
    hostedPage.css?.forEach((file) => this.insertCSS(file));
  }

  private insertJS(file: HostedPageJavascriptFile) {
    const script = document.createElement('script');
    if (file.isModule) {
      script.type = 'module';
    }

    if (file.url) {
      script.src = file.url;
    }

    if (file.inlineContent) {
      script.innerHTML = file.inlineContent;
    }

    document.head.appendChild(script);
  }

  private insertCSS(file: HostedPageCssFile) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';

    if (file.url) {
      link.href = file.url;
    }

    if (file.inlineContent) {
      link.innerHTML = file.inlineContent;
    }

    document.head.appendChild(link);
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
      console.error(e);
    }
  }
}

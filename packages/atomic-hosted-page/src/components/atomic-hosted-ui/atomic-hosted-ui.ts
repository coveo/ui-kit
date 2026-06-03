import {Schema, StringValue} from '@coveo/bueno';
import type {PlatformEnvironment} from '@coveo/headless';
import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {getHostedPage} from './api.js';
import {processHostedPage} from './process.js';

declare global {
  interface HTMLElementTagNameMap {
    'atomic-hosted-ui': AtomicHostedUI;
  }
}

export interface InitializationOptions {
  /**
   * The unique identifier of the hosted search page.
   */
  pageId: string;
  /**
   * The unique identifier of the target Coveo organization (for example, `mycoveocloudorganizationg8tp8wu3`)
   */
  organizationId: string;
  /**
   * The access token to use to authenticate requests against the Coveo endpoints. Typically, this will be an API key or search token that grants the privileges to execute queries and push usage analytics data in the target Coveo organization.
   */
  accessToken: string;
  /**
   * The environment of the target Coveo organization. This property is optional and defaults to `prod`.
   */
  environment?: PlatformEnvironment;
}

/**
 * A Web Component used to inject a Coveo Hosted Search Page in the DOM.
 * Pulls from the [Search Interfaces API](https://platform.cloud.coveo.com/docs?urls.primaryName=Search%20Interface%20Service#/)
 */
@customElement('atomic-hosted-ui')
export class AtomicHostedUI extends LitElement {
  private validateOptions(opts: InitializationOptions) {
    try {
      new Schema({
        organizationId: new StringValue({required: true, emptyAllowed: false}),
        accessToken: new StringValue({required: true, emptyAllowed: false}),
        environment: new StringValue<PlatformEnvironment>({
          required: false,
          default: 'prod',
          constrainTo: ['prod', 'hipaa', 'stg', 'dev'],
        }),
        pageId: new StringValue({required: true, emptyAllowed: false}),
      }).validate(opts);
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * The type of hosted search page to load.
   */
  @property({attribute: 'hosted-type'})
  hostedType: 'trial' | 'builder' | 'code' = 'code';

  public async initialize(options: InitializationOptions) {
    this.validateOptions(options);

    try {
      const hostedPage = await getHostedPage(options, this.hostedType);
      processHostedPage(this, hostedPage);
    } catch (e) {
      console.error(e);
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}

import { LightningElement, api, track } from 'lwc';
import {registerComponentForInit, initializeWithHeadless} from 'c/quanticHeadlessLoader';
import {I18nUtils} from 'c/quanticUtils';

import coveoOnlineHelpLink from '@salesforce/label/c.quantic_CoveoOnlineHelpLink';
import moreInformation from '@salesforce/label/c.quantic_MoreInformation';
import checkForMore from '@salesforce/label/c.quantic_CheckForMore';
import community from '@salesforce/label/c.quantic_Community';
import contactCoveoSupportTeam from '@salesforce/label/c.quantic_ContactCoveoSupportTeam';
import goBack from '@salesforce/label/c.quantic_GoBack';
import disconnectedException from '@salesforce/label/c.quantic_DisconnectedException';
import noEndpointsException from '@salesforce/label/c.quantic_NoEndpointsException';
import invalidTokenException from '@salesforce/label/c.quantic_InvalidTokenException';
import organizationIsPausedException from '@salesforce/label/c.quantic_OrganizationIsPausedException';
import disconnectedTitle from '@salesforce/label/c.quantic_DisconnectedTitle';
import noEndpointsTitle from '@salesforce/label/c.quantic_NoEndpointsTitle';
import invalidTokenTitle from '@salesforce/label/c.quantic_InvalidTokenTitle';
import organizationIsPausedTitle from '@salesforce/label/c.quantic_OrganizationIsPausedTitle';
import genericErrorTitle from '@salesforce/label/c.quantic_GenericErrorTitle';
import disconnectedDesc from '@salesforce/label/c.quantic_DisconnectedDesc';
import noEndpointsDesc from '@salesforce/label/c.quantic_NoEndpointsDesc';
import invalidTokenDesc from '@salesforce/label/c.quantic_InvalidTokenDesc';
import organizationIsPausedDesc from '@salesforce/label/c.quantic_OrganizationIsPausedDesc';
import genericErrorDesc from '@salesforce/label/c.quantic_GenericErrorDesc';

export default class QuanticQueryError extends LightningElement {
  /** @type {string} */
  @api engineId;

  /** @type {import("coveo").QueryError} */
  queryError;
  /** @type {import("coveo").Unsubscribe} */
  unsubscribe;

  /**
   * @type {string}
   */
  @track type;
  /**
   * @type {Boolean}
   */
  @track hasError;
  /**
   * @type {string}
   */
  @track error

  showMoreInfo = false;

  labels = {
    coveoOnlineHelpLink,
    moreInformation,
    checkForMore,
    community,
    contactCoveoSupportTeam,
    goBack
  }

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize.bind(this));
  }

  /**
   * @param {import("coveo").SearchEngine} engine
   */
  @api
  initialize(engine) {
    this.queryError = CoveoHeadless.buildQueryError(engine);
    this.unsubscribe = this.queryError.subscribe(() => this.updateState());
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  updateState() {
    this.type = this.queryError.state.error?.type;
    this.hasError = this.queryError.state.hasError;
    this.error = this.queryError.state.error ? JSON.stringify(this.queryError.state.error, null, 2): "";
  }

  get errorTitle() {
    switch (this.type) {
      case disconnectedException:
        return disconnectedTitle;
      case noEndpointsException:
        return noEndpointsTitle;
      case invalidTokenException:
        return invalidTokenTitle;
      case organizationIsPausedException:
        return organizationIsPausedTitle;
      default:
        return genericErrorTitle;
    }
  }

  get description() {
    switch (this.type) {
      case disconnectedException:
        return disconnectedDesc;
      case noEndpointsException:
        return noEndpointsDesc;
      case invalidTokenException:
        return invalidTokenDesc;
      case organizationIsPausedException:
        return organizationIsPausedDesc;
      default:
        return genericErrorDesc;
    }
  }

  get link() {
    switch (this.type) {
      case noEndpointsException:
        return "https://docs.coveo.com/";
      case invalidTokenException:
        return "https://docs.coveo.com/";
      case organizationIsPausedException:
        return "https://docs.coveo.com/l6af0467";
      default:
        return null;
    }
  }

  handleShowMoreInfoClick() {
    this.showMoreInfo = !this.showMoreInfo;
  }

  async handleCopyToClipboard() {
    const text = this.template.querySelector('code').textContent;
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        console.error('Copy to clipboard failed.', text, err);
      }
    } 
  }

  get checkForMoreLabel() {
    return I18nUtils.format(this.labels.checkForMore, I18nUtils.getTextWithDecorator(this.labels.community, '<a href="https://connect.coveo.com/s/discussions">', '</a>'), I18nUtils.getTextWithDecorator(this.labels.contactCoveoSupportTeam,'<a href="https://connect.coveo.com/s/article/5382">', '</a>'));
  }
}
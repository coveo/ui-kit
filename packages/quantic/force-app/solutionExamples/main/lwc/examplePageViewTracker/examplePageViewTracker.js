/* eslint-disable dot-notation */
import {LightningElement} from 'lwc';
import {CurrentPageReference} from 'lightning/navigation';
import {wire} from 'lwc';
// @ts-ignore
import {loadScript} from 'lightning/platformResourceLoader';
import COVEO_UA from '@salesforce/resourceUrl/coveoua';
// @ts-ignore
import getHeadlessConfiguration from '@salesforce/apex/HeadlessController.getHeadlessConfiguration';
// @ts-ignore
import getArticleId from '@salesforce/apex/PageViewTrackerHelper.getArticleId';

export default class ExamplePageViewTracker extends LightningElement {
  coveoUAInitialized = false;
  _initializationPromises;

  /*
   * Listen to navigation changes in an Experience Cloud site.
   * Reference: https://developer.salesforce.com/docs/platform/lwc/guide/use-navigate-basic.html#pagereference-properties
   * Example of PageReference data:
   * {
   *     "type": "standard__recordPage",
   *     "attributes": {
   *         "recordId": "01t530000004iXsAAI",
   *         "actionName": "view"
   *     },
   *     "state": {
   *         "recordName": "test"
   *     }
   * }
   */
  @wire(CurrentPageReference)
  // eslint-disable-next-line no-unused-vars
  trackPageChange({attributes, state, type, ...rest}) {
    this.loadAndInitializeLibrary();
    this._initializationPromises.then(() => {
      this.triggerPageView({attributes, state, type});
    });
  }

  connectedCallback() {
    this.loadAndInitializeLibrary();
  }

  loadAndInitializeLibrary() {
    if (!this._initializationPromises) {
      this._initializationPromises = Promise.all([
        loadScript(this, COVEO_UA + '/coveoua.js'),
        getHeadlessConfiguration(),
      ])
        .then(([, endpointData]) => {
          return this.initCoveoUA(endpointData);
        })
        .catch((error) => {
          console.error('Error loading coveoua library', error);
        });
    }
  }

  initCoveoUA(endpointData) {
    const {organizationId, accessToken} = JSON.parse(endpointData);
    window['coveoua'](
      'init',
      accessToken,
      `https://${organizationId}.analytics.org.coveo.com/rest/ua`
    );
    this.coveoUAInitialized = true;
  }

  // eslint-disable-next-line no-unused-vars
  triggerPageView({attributes, state, type}) {
    switch (type) {
      case 'standard__recordPage':
        this.coveouaSendView({
          contentIdKey: '@sfid', // @sfid is the default field where the Salesforce recordId is stored.
          contentIdValue: attributes.recordId,
        });
        break;
      case 'standard__knowledgeArticlePage':
        getArticleId({urlName: attributes?.urlName})
          .then((id) => {
            if (id) {
              this.coveouaSendView({
                contentIdKey: '@sfid',
                contentIdValue: id,
                contentType: 'Knowledge',
              });
            }
          })
          .catch((err) => {
            console.warn(
              'Error searching for knowledge article by UrlName',
              err
            );
          });
        break;

      default:
        this.coveouaSendView({
          contentIdKey: '@clickableuri',
          contentIdValue: window.location.href,
        });
        break;
    }
  }

  coveouaSendView({
    contentIdKey,
    contentIdValue,
    contentType = undefined,
    additionalContext = {},
  }) {
    if (this.coveoUAInitialized) {
      window['coveoua']('send', 'view', {
        contentIdKey: contentIdKey,
        contentIdValue: contentIdValue,
        ...(contentType && {contentType: contentType}),
        ...(additionalContext && {customData: {...additionalContext}}),
      });
    } else {
      console.warn('Coveo UA called before initialized.');
    }
  }
}

import {LightningElement, api, wire} from 'lwc';
import {setEngineConfiguration} from 'c/headlessLoader';
// @ts-ignore
import getHeadlessConfiguration from '@salesforce/apex/HeadlessController.getHeadlessConfiguration';

export default class SearchInterface extends LightningElement {
  /** @type {any} */
  @api flexipageRegionWidth;

  /** @type {string} */
  @api searchHub = 'default';

  /** @type {string} */
  @api pipeline = 'default';

  /** @type {string} */
  @api engineId;

  /** @type {import("coveo").HeadlessConfigurationOptions} */
  fullConfig;

  @wire(getHeadlessConfiguration)
  wiredConfig({ error, data }) {
    if (data) {
      this.fullConfig = {
        ...JSON.parse(data),
        search: {
          searchHub: this.searchHub,
          pipeline: this.pipeline
        }
      };
      setEngineConfiguration(this.fullConfig, this.engineId, this);
    } else if (error) {
      console.error(error.message);
    }
  }
}

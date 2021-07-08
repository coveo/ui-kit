import {LightningElement, api} from 'lwc';
import {EngineConstructors, setEngineOptions, setInitializedCallback} from 'c/quanticHeadlessLoader';
// @ts-ignore
import getHeadlessConfiguration from '@salesforce/apex/HeadlessController.getHeadlessConfiguration';

export default class QuanticSearchInterface extends LightningElement {
  /** @type {any} */
  @api flexipageRegionWidth;

  /** @type {string} */
  @api searchHub = 'default';

  /** @type {string} */
  @api pipeline = 'default';

  /** @type {string} */
  @api engineId;

  /** @type {import("coveo").SearchEngineOptions} */
  engineOptions;

  connectedCallback() {
    getHeadlessConfiguration().then((data) => {
      if (data) {
        this.engineOptions = {
          configuration: {
            ...JSON.parse(data),
            search: {
              searchHub: this.searchHub,
              pipeline: this.pipeline
            }
          }
        };
        setEngineOptions(this.engineOptions, EngineConstructors.SearchEngineConstructor, this.engineId, this);
        setInitializedCallback(this.performInitialQuery, this.engineId);
      }
    });
  }

  performInitialQuery = (engine) => {
    engine.executeFirstSearch()
  }
}
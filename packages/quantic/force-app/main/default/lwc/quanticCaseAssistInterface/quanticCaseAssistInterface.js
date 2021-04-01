import {LightningElement, api, wire} from 'lwc';
import {getHeadlessEngine, setEngineConfiguration, setInitializedCallback} from 'c/quanticHeadlessLoader';
// @ts-ignore
import getHeadlessConfiguration from '@salesforce/apex/HeadlessController.getHeadlessConfiguration';

export default class QuanticCaseAssistInterface extends LightningElement {
   /** @type {any} */
   @api flexipageRegionWidth;

   /** @type {string} */
   @api caseAssistId = 'default';
 
   /** @type {string} */
   @api engineId;
 
   /** @type {import("coveo").HeadlessOptions} */
   fullConfig;
 
   @wire(getHeadlessConfiguration)
   wiredConfig({ error, data }) {
     if (data) {
       this.fullConfig = {
         configuration: {
           ...JSON.parse(data),
           caseAssist: {
             caseAssistId: this.caseAssistId
           }
         },
         reducers: CoveoHeadless.caseAssistAppReducers
       };
       setEngineConfiguration(this.fullConfig, this.engineId, this);
       setInitializedCallback(this.performUASetup, this.engineId);
     } else if (error) {
       console.error(error.message);
     }
   }
 
   performUASetup = async () => {
     (await getHeadlessEngine(this.engineId)).dispatch(
       CoveoHeadless.SearchActions.executeSearch(
         CoveoHeadless.AnalyticsActions.logInterfaceLoad()
       )
     );
   }
}
import { api, LightningElement } from 'lwc';


export default class ActionSelectResults extends LightningElement {
  @api engineId;
  @api disabled;

  interactiveResult;

  handle() {
    const result = { 
      title: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8), 
      uri: "http://www.salesforce.com/",
      uniqueId:  Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 16),
      clickUri: "http://www.salesforce.com/",
      raw: {
        urihash: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 16)
      }
    };
    this.resolveInteractiveResultController(result)
      .then((controller) => {
        this.interactiveResult = controller;
        this.interactiveResult.select();
    });
  }

  resolveInteractiveResultController(result) {
    return window.coveoHeadless?.[this.engineId]?.enginePromise
      .then((engine) => {
        return CoveoHeadless.buildInteractiveResult(engine, {
          options: {result: JSON.parse(JSON.stringify(result))},
      });
    });
  }
}


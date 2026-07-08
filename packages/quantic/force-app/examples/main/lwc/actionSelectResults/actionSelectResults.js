import {
  getHeadlessBundle,
  registerComponentForInit,
  initializeWithHeadless,
} from 'c/quanticHeadlessLoader';
import {api, LightningElement} from 'lwc';

export default class ActionSelectResults extends LightningElement {
  @api engineId;
  @api disabled;

  engine;
  count = 1;
  headless;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  initialize = (engine) => {
    this.engine = engine;
    this.headless = getHeadlessBundle(this.engineId);
  };

  handle() {
    const result = {
      title: this.count.toString(),
      uri: 'https://github.com/coveo/ui-kit/',
      uniqueId: Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, '')
        .substring(0, 16),
      clickUri: 'https://github.com/coveo/ui-kit/',
      raw: {
        urihash: Math.random()
          .toString(36)
          .replace(/[^a-z]+/g, '')
          .substring(0, 16),
      },
    };
    this.count++;
    const interactiveResult = this.headless.buildInteractiveResult(
      this.engine,
      {options: {result: JSON.parse(JSON.stringify(result))}}
    );
    interactiveResult.select();
  }
}

import {getHeadlessBundle} from 'c/quanticHeadlessLoader';
import {api, LightningElement} from 'lwc';

export default class ActionSelectResults extends LightningElement {
  @api engineId;
  @api disabled;

  interactiveResult;
  count = 1;
  headless;

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
    this.resolveInteractiveResultController(result).then((controller) => {
      this.interactiveResult = controller;
      this.interactiveResult.select();
    });
  }

  resolveInteractiveResultController(result) {
    this.headless = getHeadlessBundle(this.engineId);
    return window.coveoHeadless?.[this.engineId]?.enginePromise.then(
      (engine) => {
        return this.headless.buildInteractiveResult(engine, {
          options: {result: JSON.parse(JSON.stringify(result))},
        });
      }
    );
  }
}

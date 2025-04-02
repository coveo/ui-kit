import {getHeadlessBundle} from 'c/quanticHeadlessLoader';
import {api, LightningElement} from 'lwc';

export default class ActionNextResults extends LightningElement {
  @api engineId;
  @api disabled;

  pager;
  headless;

  handleGetNextResults() {
    if (this.pager) {
      this.pager.nextPage();
    } else {
      this.resolvePagerController().then((controller) => {
        this.pager = controller;
        this.pager.nextPage();
      });
    }
  }

  resolvePagerController() {
    this.headless = getHeadlessBundle(this.engineId);
    return window.coveoHeadless?.[this.engineId]?.enginePromise.then(
      (engine) => {
        return this.headless.buildPager(engine);
      }
    );
  }
}

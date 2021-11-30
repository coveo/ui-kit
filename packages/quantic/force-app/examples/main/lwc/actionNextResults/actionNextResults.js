import { api, LightningElement } from 'lwc';

export default class ActionNextResults extends LightningElement {
  @api engineId;
  @api disabled;

  pager;

  handle () {
    if (this.pager) {
      this.pager.nextPage();
    } else {
      this.resolvePagerController()
        .then((controller) => {
          this.pager = controller;
          this.pager.nextPage();
        });
    }
  }

  resolvePagerController() {
    return window.coveoHeadless?.[this.engineId]?.enginePromise
      .then((engine) => {
        return CoveoHeadless.buildPager(engine);
      });
  }
}

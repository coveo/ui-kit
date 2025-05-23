import {getHeadlessBundle} from 'c/quanticHeadlessLoader';
import {api, LightningElement} from 'lwc';

export default class ActionPerformRecommendationSearch extends LightningElement {
  @api engineId;
  @api disabled;

  headless;

  handleRecommendationPerformSearch() {
    this.resolveEngine().then((engine) => {
      this.actions = {
        ...this.headless.loadRecommendationActions(engine),
      };
      engine.dispatch(this.actions.getRecommendations());
    });
  }

  resolveEngine() {
    this.headless = getHeadlessBundle(this.engineId);
    return window.coveoHeadless?.[this.engineId]?.enginePromise;
  }
}

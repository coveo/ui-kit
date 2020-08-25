// @ts-check
import {LightningElement, api, track} from 'lwc';

export default class Resultlist extends LightningElement {
  @track state = {};

  /** @type {import("coveo").ResultList} */
  resultList;
  /** @type {import("coveo").Unsubscribe} */
  unsubscribe;

  @api
  set engine(eng) {
    if (!eng) {
      return;
    }

    this.e = eng;
    this.resultList = CoveoHeadless.buildResultList(this.e);
    this.unsubscribe = this.resultList.subscribe(() => this.updateState());
  }

  get engine() {
    return this.e;
  }

  disconnectedCallback() {
    this.unsubscribe && this.unsubscribe();
  }

  updateState() {
    this.state = this.resultList.state;
  }

  get results() {
    return this.state.results || [];
  }
}

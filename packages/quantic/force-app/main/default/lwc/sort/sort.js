// @ts-check
import { LightningElement, track, api } from "lwc";

export default class Sort extends LightningElement {
  @track state = {};

  /** @type {import("coveo").Sort} */
  sort;
  /** @type {() => any} */
  unsubscribe;

  @api
  set engine(eng) {
    if (!eng) {
      return;
    }

    this.e = eng;
    this.sort = new CoveoHeadless.Sort(this.e);
    this.unsubscribe = this.sort.subscribe(() => this.updateState());
  }

  get engine() {
    return this.e;
  }

  updateState() {
    this.state = this.sort.state;
  }

  /**
   * @param {CustomEvent<{value: string}>} e
   */
  handleChange(e) {
    const selected = e.detail.value;

    switch (selected) {
      case "relevancy":
        this.sort.sortBy(this.relevance);
        break;

      case "newest":
        this.sort.sortBy(this.dateDescending);
        break;

      case "oldest":
        this.sort.sortBy(this.dateAscending);
        break;

      default:
        break;
    }

    this.engine;
  }

  get relevance() {
    return CoveoHeadless.buildRelevanceSortCriterion();
  }

  get dateDescending() {
    return CoveoHeadless.buildDateSortCriterion("descending");
  }

  get dateAscending() {
    return CoveoHeadless.buildDateSortCriterion("ascending");
  }

  get largest() {
    return CoveoHeadless.buildFieldSortCriterion("size", "descending");
  }

  get options() {
    return [
      { label: "Relevancy", value: "relevancy" },
      { label: "Newest", value: "newest" },
      { label: "Oldest", value: "oldest" }
    ];
  }

  get value() {
    if (!this.sort) {
      return "relevancy";
    }
    return this.state.sortCriteria.expression;
  }
}

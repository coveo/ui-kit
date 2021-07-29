import { LightningElement, api } from 'lwc';
// @ts-ignore
import pageNotFound from './pageNotFound.html';
// @ts-ignore
import noResults from './noResults.html';
// @ts-ignore
import _default from './default.html';

export default class QuanticSvg extends LightningElement {
  /** @type {string} */
  @api name;

  render() {
    switch (this.name) {
      case "pageNotFound":
        return pageNotFound;
      case "NoResults":
        return noResults;
      default:
        return _default;
    }   
  }
}
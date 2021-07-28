import { LightningElement, api } from 'lwc';
// @ts-ignore
import pageNotFound from './pageNotFound.html';
// @ts-ignore
import desert from './desert.html';
// @ts-ignore
import quanticSvg from './quanticSvg.html';

export default class QuanticSvgLoader extends LightningElement {
  /** @type {string} */
  @api name;

  render() {
    switch (this.name) {
      case "pageNotFound":
        return pageNotFound;
      case "NoResults":
        return desert;
      default:
        return quanticSvg;
    }   
  }
}
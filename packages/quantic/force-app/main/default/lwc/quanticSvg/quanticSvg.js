import { LightningElement, api } from 'lwc';
import pageNotFound from './pageNotFound.html';
import desert from './desert.html';
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
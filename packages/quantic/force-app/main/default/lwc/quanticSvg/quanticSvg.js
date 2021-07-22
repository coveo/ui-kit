import { LightningElement, api } from 'lwc';
// @ts-ignore
import pageNotFound from './pageNotFound.html';
// @ts-ignore
import quanticSvg from './quanticSvg.html';

export default class QuanticSvgLoader extends LightningElement {
  /** @type {string} */
  @api name;

  render() {
      if(this.name === "pageNotFound")
        return pageNotFound;
    return quanticSvg;
  }
}
import { LightningElement, api } from 'lwc';
// @ts-ignore
import quanticSvgLoader from './quanticSvgLoader.html';

export default class QuanticSvgLoader extends LightningElement {
  /** @type {string} */
  @api name;

  render() {
      if(this.name === "pageNotFound")
        return quanticSvgLoader;
    return null;
  }
}
import {buildRecommendations} from '@coveo/headless/commerce';
import {html, LitElement} from 'lit';
import {engine} from '../engine.js';
import {baseStyles, headingStyles} from '../shared-styles.js';
import './product-list.js';

/**
 * Home page showing a Coveo recommendations slot. The slot is configured in the
 * Coveo platform; the front end only refreshes the controller and renders the
 * returned products.
 */
export class HomePage extends LitElement {
  static styles = [baseStyles, headingStyles];

  constructor() {
    super();
    this.recommendations = buildRecommendations(engine, {
      options: {slotId: 'af4fb7ba-6641-4b67-9cf9-be67e9f30174'},
    });
  }

  // Trigger the query from `firstUpdated` (not `connectedCallback`) so the
  // child components have already mounted and subscribed to the controller
  // before the response arrives. Otherwise a fast response (e.g. mocked in
  // tests) can settle before anything is listening.
  firstUpdated() {
    this.recommendations.refresh();
  }

  render() {
    return html`
      <section>
        <h2>Recommended for you</h2>
        <commerce-product-list
          .controller=${this.recommendations}
          .cart=${this.cart}
        ></commerce-product-list>
      </section>
    `;
  }
}

customElements.define('commerce-home-page', HomePage);

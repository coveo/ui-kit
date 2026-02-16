import {Component, h, Element, State} from '@stencil/core';
import {resultContext} from '@coveo/atomic';
import {Result} from '@coveo/headless';

/**
 * Sample custom Atomic result component, to be used inside an Atomic Result Template.
 *
 * This component showcases a component that conditionally renders the author of a result, with a fallback to display "anonymous" in the event that no author is available for a document, for educational purposes.
 *
 * In a real life scenario, we recommend using [result-field-condition](https://docs.coveo.com/en/atomic/latest/reference/result-template-components/atomic-field-condition/) and [atomic-result-text](https://docs.coveo.com/en/atomic/latest/reference/result-template-components/atomic-result-text/).
 */
@Component({
  tag: 'sample-result-component',
  styleUrl: 'sample-result-component.css',
  shadow: true,
})
export class SampleResultComponent {
  // The Headless result object to be resolved from the parent atomic-result component.
  @State() private result?: Result;
  @Element() private host!: Element;

  // We recommended fetching the result context using the `connectedCallback` lifecycle method
  // with async/await. Using `componentWillLoad` will hang the parent `atomic-search-interface` initialization.
  public async connectedCallback() {
    try {
      this.result = await resultContext(this.host);
    } catch (error) {
      console.error(error);
      this.host.remove();
    }
  }

  public render() {
    // Do not render the component until the result object has been resolved.
    if (!this.result) {
      return;
    }

    const brand = this.result.raw['ec_brand'];
    return brand ? <h4>A product from {brand}</h4> : <h4>A generic product</h4>;
  }
}

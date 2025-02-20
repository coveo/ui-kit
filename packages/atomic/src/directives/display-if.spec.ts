import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {describe, beforeEach, test, expect} from 'vitest';
import {displayIf} from './display-if';

describe('displayIf', () => {
  let element: TestElement;

  @customElement('test-element')
  class TestElement extends LitElement {
    @property({type: Boolean, reflect: true}) shouldDisplay = true;

    render() {
      return html`${displayIf(
        this.shouldDisplay,
        html`<span id="content">Visible</span>`
      )}`;
    }
  }

  beforeEach(() => {
    element = document.createElement('test-element') as TestElement;
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  test('should not add "atomic-hidden" when the condition is "true"', async () => {
    element.shouldDisplay = true;
    await element.updateComplete;
    expect(element.classList.contains('atomic-hidden')).toBe(false);
  });

  test('should add "atomic-hidden" when the condition is "false"', async () => {
    element.shouldDisplay = false;
    await element.updateComplete;
    expect(element.classList.contains('atomic-hidden')).toBe(true);
  });

  test('should render the children when the condition is "true"', async () => {
    element.shouldDisplay = true;
    await element.updateComplete;
    expect(element.shadowRoot?.querySelector('#content')).not.toBeNull();
  });

  test('should not render the children when the condition is "false"', async () => {
    element.shouldDisplay = false;
    await element.updateComplete;
    expect(element.shadowRoot?.querySelector('#content')).toBeNull();
  });
});

import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {beforeEach, describe, expect, it} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {HiddenStateController} from './hidden-state-controller';

@customElement('test-hidden-state')
class TestElement extends LitElement {
  hiddenState = new HiddenStateController(this);

  render() {
    return html`<div>content</div>`;
  }
}

describe('HiddenStateController', () => {
  let element: TestElement;

  beforeEach(async () => {
    element = await fixture<TestElement>(
      html`<test-hidden-state></test-hidden-state>`
    );
  });

  it('should have the empty state by default', () => {
    expect(element.matches(':state(empty)')).toBe(true);
  });

  it('should remove the empty state when isEmpty is set to false', () => {
    element.hiddenState.isEmpty = false;
    expect(element.matches(':state(empty)')).toBe(false);
  });

  it('should add the empty state when isEmpty is set to true', () => {
    element.hiddenState.isEmpty = false;
    element.hiddenState.isEmpty = true;
    expect(element.matches(':state(empty)')).toBe(true);
  });

  it('should report isEmpty correctly', () => {
    expect(element.hiddenState.isEmpty).toBe(true);
    element.hiddenState.isEmpty = false;
    expect(element.hiddenState.isEmpty).toBe(false);
  });
});

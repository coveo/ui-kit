import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {AriaLiveRegionController} from './accessibility-utils';

@customElement('stub-aria-live')
class StubAriaLive extends LitElement {
  @state() regions: {
    [region: string]: {assertive: boolean; message: string};
  } = {};

  registerRegion = vi.fn();
  updateMessage = vi.fn();
  findAriaLiveListenerSpy = vi.fn().mockImplementation((event) => {
    event.detail.element = this;
  });

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener(
      'atomic/accessibility/findAriaLive',
      this.findAriaLiveListenerSpy
    );
  }
}

@customElement('test-element')
class TestElement extends LitElement {
  region = new AriaLiveRegionController(this, 'test-region', true);

  render() {
    this.region.message = 'Test message';

    return html`<div>A test element</div>`;
  }
}

describe('#AriaLiveRegionController', () => {
  let testElement: TestElement;
  let ariaLive: StubAriaLive;

  beforeEach(async () => {
    await fixture(
      html`<stub-aria-live></stub-aria-live> <test-element></test-element>`
    );
    testElement = document.querySelector('test-element')! as TestElement;
    ariaLive = document.querySelector('stub-aria-live')! as StubAriaLive;
  });

  it('should register the region when the host is updated', async () => {
    expect(ariaLive.registerRegion).toHaveBeenCalledWith('test-region', true);
  });

  it('should dispatch a message to the aria live when setting the message', async () => {
    expect(ariaLive.updateMessage).toHaveBeenCalledWith(
      'test-region',
      'Test message',
      true
    );
  });

  it('should update the message when the message is changed', async () => {
    testElement.region.message = 'New message';
    expect(ariaLive.updateMessage).toHaveBeenCalledWith(
      'test-region',
      'New message',
      true
    );
  });
});

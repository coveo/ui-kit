import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {page} from '@vitest/browser/context';
import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {describe, it, expect, vi, MockInstance} from 'vitest';
import {AriaLiveRegionController} from './accessibility-utils';

@customElement('stub-aria-live')
class StubAriaLive extends LitElement {
  @state() regions: {
    [region: string]: {assertive: boolean; message: string};
  } = {};

  connectedCallback() {
    super.connectedCallback();
    console.log('adding listener');
    document.addEventListener(
      'atomic/accessibility/findAriaLive',
      (event: Event) => {
        const customEvent = event as CustomEvent;
        customEvent.detail.element = this;
      }
    );
  }

  updateMessage(region: string, message: string, assertive: boolean) {
    this.regions = {
      ...this.regions,
      [region]: {assertive, message},
    };
  }

  registerRegion(region: string, assertive: boolean) {
    if (region in this.regions) {
      return;
    }
    this.regions = {
      ...this.regions,
      [region]: {assertive, message: ''},
    };
  }

  render() {
    return html`<div>
      stub aria-live
      ${Object.entries(this.regions).map(
        ([regionName, {assertive, message}]) => html`
          <div aria-live=${assertive ? 'assertive' : 'polite'} id=${regionName}>
            ${message}
          </div>
        `
      )}
    </div>`;
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
  let spyOnRegisterRegion: MockInstance;
  let spyOnUpdateMessage: MockInstance;
  let testElement: TestElement;
  let ariaLive: StubAriaLive;

  beforeEach(async () => {
    spyOnRegisterRegion = vi.spyOn(StubAriaLive.prototype, 'registerRegion');
    spyOnUpdateMessage = vi.spyOn(StubAriaLive.prototype, 'updateMessage');

    await fixture(
      html`<stub-aria-live></stub-aria-live> <test-element></test-element>`
    );
    testElement = document.querySelector('test-element')! as TestElement;
    ariaLive = document.querySelector('stub-aria-live')! as StubAriaLive;
  });

  it('should register the region when the host is updated', async () => {
    expect(ariaLive.regions).toEqual({
      'test-region': {assertive: true, message: 'Test message'},
    });
    expect(spyOnRegisterRegion).toHaveBeenCalledWith('test-region', true);
  });

  it('should dispatch a message to the aria live when setting the message', async () => {
    await expect.element(page.getByText('Test message')).toBeInTheDocument();
    expect(spyOnUpdateMessage).toHaveBeenCalledWith(
      'test-region',
      'Test message',
      true
    );
  });

  it('should update the message when the message is changed', async () => {
    testElement.region.message = 'New message';

    await expect.element(page.getByText('New message')).toBeInTheDocument();
    expect(spyOnUpdateMessage).toHaveBeenCalledWith(
      'test-region',
      'New message',
      true
    );
  });
});

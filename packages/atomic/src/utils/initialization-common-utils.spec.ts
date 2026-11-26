import {html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {describe, expect, it, vi} from 'vitest';
import {fetchBindings, MissingInterfaceParentError} from './initialization-common-utils';
import '@/src/components/search/atomic-search-interface/atomic-search-interface.js';

@customElement('test-late-slot-wrapper')
// oxlint-disable-next-line @typescript-eslint/no-unused-vars -- <used as an element>
class TestLateSlotWrapper extends LitElement {
  public render() {
    return html`<atomic-external><slot></slot></atomic-external>`;
  }
}

describe('fetchBindings', () => {
  it('should rejects when the component is not the children of a search interface element', async () => {
    const element = document.createElement('my-component');
    await expect(fetchBindings(element)).rejects.toEqual(
      new MissingInterfaceParentError('my-component')
    );
  });

  it("resolves the bindings when it's a children of a configured search interface element", async () => {
    const searchInterface = document.createElement('atomic-search-interface');
    document.body.appendChild(searchInterface);

    await searchInterface.initialize({
      accessToken: '123456789',
      organizationId: 'myorg',
    });

    const element = document.createElement('my-component');
    searchInterface.appendChild(element);
    const bindings = await fetchBindings(element);
    expect(bindings).toMatchObject({
      interfaceElement: searchInterface,
      i18n: searchInterface.i18n,
      store: expect.anything(),
      engine: searchInterface.engine,
    });
  });

  it('should not reject when the component is slotted into an interface inside another shadow root', async () => {
    const host = document.createElement('div');
    host.attachShadow({mode: 'open'}).innerHTML =
      '<atomic-search-interface><slot></slot></atomic-search-interface>';
    const element = document.createElement('my-component');
    host.appendChild(element);
    document.body.appendChild(host);

    const onRejected = vi.fn();

    fetchBindings(element).catch(onRejected);
    await new Promise((resolve) => setTimeout(resolve));
    await Promise.resolve();

    expect(onRejected).not.toHaveBeenCalled();
    host.remove();
  });

  it('should not reject when a wrapper renders the interface slot after the component connects', async () => {
    const wrapper = document.createElement('test-late-slot-wrapper');
    const element = document.createElement('my-component');
    wrapper.appendChild(element);
    document.body.appendChild(wrapper);
    const onRejected = vi.fn();

    fetchBindings(element).catch(onRejected);
    await new Promise((resolve) => setTimeout(resolve));
    await Promise.resolve();

    expect(onRejected).not.toHaveBeenCalled();
    wrapper.remove();
  });
});

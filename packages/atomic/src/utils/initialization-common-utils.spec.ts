import {describe, expect, it, vi} from 'vitest';
import {fetchBindings, MissingInterfaceParentError} from './initialization-common-utils';
import '@/src/components/search/atomic-search-interface/atomic-search-interface.js';

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
    await Promise.resolve();

    expect(onRejected).not.toHaveBeenCalled();
    host.remove();
  });
});

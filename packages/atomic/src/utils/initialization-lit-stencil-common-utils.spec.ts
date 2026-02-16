import {describe, expect, it} from 'vitest';
import {
  fetchBindings,
  MissingInterfaceParentError,
} from './initialization-lit-stencil-common-utils';
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
});

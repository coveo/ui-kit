import {
  MissingResultParentError,
  resultContext,
} from './result-template-decorators';
import {h} from '@stencil/core';
import {newSpecPage, SpecPage} from '@stencil/core/testing';
import {AtomicResultFieldsList} from './atomic-result-fields-list/atomic-result-fields-list';
import {AtomicResult} from '../atomic-result/atomic-result';
import {AtomicSearchInterface} from '../atomic-search-interface/atomic-search-interface';
import {TestUtils} from '@coveo/headless';

describe('ResultContext decorator', () => {
  let page: SpecPage;

  it(`when the result template component is not the child of an atomic-result component 
  should log an error`, async () => {
    console.error = jest.fn();
    await newSpecPage({
      components: [AtomicResultFieldsList],
      html: '<atomic-result-fields-list></atomic-result-fields-list>',
    });

    expect(console.error).toHaveBeenCalledWith(
      'Result component is in error and has been removed from the DOM',
      new MissingResultParentError('atomic-result-fields-list'),
      expect.anything(),
      expect.anything()
    );
  });

  it(`when the result template component is loaded
  should dispatch a "atomic/resolveResult" custom event`, async () => {
    page = await newSpecPage({
      components: [AtomicResultFieldsList, AtomicSearchInterface],
      html: '<atomic-search-interface></atomic-search-interface>',
    });
    let eventContent!: CustomEvent;
    const spy = jest.fn().mockImplementation((event) => (eventContent = event));
    page.root!.addEventListener('atomic/resolveResult', spy);
    page.root!.innerHTML =
      '<atomic-result-fields-list></atomic-result-fields-list>';
    await page.waitForChanges();

    expect(spy).toHaveBeenCalled();
    expect(typeof eventContent.detail).toBe('function');
  });
});

describe('resultContext method', () => {
  it('rejects when the component is not the child of an atomic-result element', async () => {
    const element = document.createElement('my-component');
    await expect(resultContext(element)).rejects.toEqual(
      new MissingResultParentError('my-component')
    );
  });

  it("revolves the bindings when it's a child of an atomic-result element", async () => {
    const page = await newSpecPage({
      components: [AtomicResult],
      template: () => (
        <atomic-result
          content={document.createElement('div')}
          engine={TestUtils.buildMockSearchAppEngine()}
          result={TestUtils.buildMockResult()}
        ></atomic-result>
      ),
    });
    const result = page.body.querySelector('atomic-result')!;

    const element = document.createElement('my-component');
    result.appendChild(element);
    const bindings = await resultContext(element);
    expect(bindings).toMatchObject({});
  });
});

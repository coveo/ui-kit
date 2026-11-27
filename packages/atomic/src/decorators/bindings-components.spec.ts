import {html, type LitElement} from 'lit';
import {afterEach, beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import '@/src/components/common/atomic-icon/atomic-icon';
import '@/src/components/common/atomic-modal/atomic-modal';
import '@/src/components/common/atomic-smart-snippet-collapse-wrapper/atomic-smart-snippet-collapse-wrapper';
import '@/src/components/insight/atomic-insight-query-summary/atomic-insight-query-summary';
import '@/src/components/ipx/atomic-ipx-modal/atomic-ipx-modal';
import '@/src/components/search/atomic-automatic-facet/atomic-automatic-facet';
import '@/src/components/search/atomic-external/atomic-external';
import '@/src/components/search/atomic-notifications/atomic-notifications';
import '@/src/components/search/atomic-pager/atomic-pager';
import '@/src/components/search/atomic-query-summary/atomic-query-summary';
import '@/src/components/search/atomic-result-number/atomic-result-number';
import '@/src/components/search/atomic-result-rating/atomic-result-rating';
import '@/src/components/search/atomic-result-timespan/atomic-result-timespan';
import '@/src/components/search/atomic-results-per-page/atomic-results-per-page';
import type {InitializableComponent} from '@/src/decorators/types';
import {MissingInterfaceParentError} from '@/src/utils/initialization-common-utils';
import type {FixtureAtomicResult} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-result-fixture';
import '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-result-fixture';
import {
  type FixtureAtomicSearchInterface,
  renderInAtomicSearchInterface,
} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import {mockConsole} from '@/vitest-utils/testing-helpers/testing-utils/mock-console';

type Component = LitElement & InitializableComponent;

const components: {tag: string; inResult?: boolean}[] = [
  {tag: 'atomic-pager'},
  {tag: 'atomic-query-summary'},
  {tag: 'atomic-insight-query-summary'},
  {tag: 'atomic-results-per-page'},
  {tag: 'atomic-notifications'},
  {tag: 'atomic-automatic-facet'},
  {tag: 'atomic-result-number', inResult: true},
  {tag: 'atomic-result-rating', inResult: true},
  {tag: 'atomic-result-timespan', inResult: true},
  {tag: 'atomic-modal'},
  {tag: 'atomic-ipx-modal'},
  {tag: 'atomic-smart-snippet-collapse-wrapper'},
  {tag: 'atomic-icon'},
];

const nextTask = () => new Promise((resolve) => setTimeout(resolve));
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

describe('bindings-components', () => {
  let mockedConsole: ReturnType<typeof mockConsole>;
  let outside: HTMLElement;

  beforeEach(() => {
    mockedConsole = mockConsole();
    outside = document.createElement('div');
    document.body.append(outside);
  });

  afterEach(() => {
    outside.remove();
  });

  describe.each(components)('<$tag>', ({tag, inResult}) => {
    let initialize: MockInstance;
    let atomicInterface: FixtureAtomicSearchInterface;
    let created: {element: Component; root: HTMLElement};

    beforeEach(async () => {
      const prototype = customElements.get(tag)!.prototype as Component;
      initialize = vi.spyOn(prototype, 'initialize').mockImplementation(() => {});
      vi.spyOn(prototype, 'render').mockReturnValue(html`rendered`);
      ({atomicInterface} = await renderInAtomicSearchInterface({template: html``}));
    });

    afterEach(async () => {
      created.root.remove();
      atomicInterface.remove();
      await nextFrame();
      await nextFrame();
      await created.element.updateComplete;
    });

    const createElement = () => {
      const element = document.createElement(tag) as Component;
      element.setAttribute('field', 'size');
      let root: HTMLElement = element;
      if (inResult) {
        const atomicResult = document.createElement('atomic-result') as FixtureAtomicResult;
        atomicResult.result = buildFakeResult({raw: {size: 1}});
        atomicResult.append(element);
        root = atomicResult;
      }
      created = {element, root};
      return created;
    };

    const moveTo = async (parent: HTMLElement, root: HTMLElement, element: Component) => {
      parent.append(root);
      await element.updateComplete;
    };

    const expectRenderedWithBindings = (element: Component) => {
      expect(element.error).toBeUndefined();
      expect(element.bindings).toBe(atomicInterface.bindings);
      expect(initialize).toHaveBeenCalledOnce();
      expect(element.renderRoot.textContent).toContain('rendered');
    };

    it('should initialize once with the interface bindings and survive a reconnection', async () => {
      const {element, root} = createElement();

      await moveTo(atomicInterface, root, element);
      expectRenderedWithBindings(element);

      root.remove();
      await moveTo(atomicInterface, root, element);
      expectRenderedWithBindings(element);
    });

    it('should initialize inside the shadow root of another element in the interface', async () => {
      const {element, root} = createElement();
      const shadowHost = document.createElement('div');
      shadowHost.attachShadow({mode: 'open'}).append(root);

      atomicInterface.append(shadowHost);
      await element.updateComplete;
      expectRenderedWithBindings(element);
    });

    it('should initialize inside an atomic-external added after the interface is ready', async () => {
      const {element, root} = createElement();
      const external = document.createElement('atomic-external');
      outside.append(external);

      await moveTo(external, root, element);
      await vi.waitFor(() => expect(initialize).toHaveBeenCalledOnce());
      expectRenderedWithBindings(element);
    });

    it('should recover when moved into an interface after starting outside one', async () => {
      const {element, root} = createElement();

      await moveTo(outside, root, element);
      await nextTask();
      expect(element.error).toBeUndefined();
      expect(initialize).not.toHaveBeenCalled();
      expect(mockedConsole.error).toHaveBeenCalledWith(
        expect.any(MissingInterfaceParentError),
        element
      );

      await moveTo(atomicInterface, root, element);
      expectRenderedWithBindings(element);
    });
  });
});

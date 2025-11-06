import {getOrganizationEndpoint} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import type {AtomicModal} from '@/src/components/common';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import type {AtomicRelevanceInspector} from './atomic-relevance-inspector';
import './atomic-relevance-inspector';

vi.mock('@coveo/headless', {spy: true});

const ORG_ENDPOINT = 'https://searchuisamples.admin.org.coveo.com';

describe('atomic-relevance-inspector', () => {
  const engine = buildFakeSearchEngine({
    state: {
      configuration: {organizationId: 'org', environment: 'prod'},
      search: {searchResponseId: 'resp123'},
    },
  });

  const altDblClick = new MouseEvent('dblclick', {
    altKey: true,
    bubbles: true,
  });

  beforeEach(() => {
    vi.mocked(getOrganizationEndpoint).mockReturnValue(ORG_ENDPOINT);
  });

  const renderRelevanceInspector = async () => {
    const {element} =
      await renderInAtomicSearchInterface<AtomicRelevanceInspector>({
        template: html`<atomic-relevance-inspector></atomic-relevance-inspector>`,
        selector: 'atomic-relevance-inspector',
        bindings: (bindings) => {
          bindings.engine = engine;
          return bindings;
        },
      });
    return {
      element,
      get ignoreButton() {
        return page.getByRole('button', {name: 'Ignore'});
      },
      get openButton() {
        return page.getByRole('button', {name: 'Open'});
      },
      get modal() {
        return element.shadowRoot?.querySelector('atomic-modal') as AtomicModal;
      },
    };
  };

  it('should render an atomic-modal with isOpen set to false', async () => {
    const {modal} = await renderRelevanceInspector();
    expect(modal).toBeTruthy();
    expect(modal?.isOpen).toBe(false);
  });

  describe('#initialize', () => {
    it('should add a "dblclick" event listener on the search interface element', async () => {
      const {element} = await renderRelevanceInspector();
      const addEventListenerSpy = vi.spyOn(
        element.bindings.interfaceElement,
        'addEventListener'
      );
      element.initialize();
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'dblclick',
        expect.any(Function)
      );
    });
  });

  describe('#disconnectedCallback', () => {
    it('should remove the `dblclick listener from the interface element', async () => {
      const {element} = await renderRelevanceInspector();
      const removeEventListenerSpy = vi.spyOn(
        element.bindings.interfaceElement,
        'removeEventListener'
      );
      element.remove();
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'dblclick',
        expect.any(Function)
      );
    });
  });

  describe('when alt+double-clicking on the interface element', () => {
    let element: AtomicRelevanceInspector;
    let modal: AtomicModal;

    beforeEach(async () => {
      const result = await renderRelevanceInspector();
      element = result.element;
      modal = result.modal;
      element.bindings.interfaceElement.dispatchEvent(altDblClick);
      await element.updateComplete;
    });
    it('should open the modal', async () => {
      expect(modal.isOpen).toBe(true);
      expect(page.getByText('Open the relevance inspector')).toBeVisible();
    });

    it('should close the modal on following alt + double-click', async () => {
      expect(modal.isOpen).toBe(true);
      element.bindings.interfaceElement.dispatchEvent(altDblClick);
      await element.updateComplete;
      expect(modal.isOpen).toBe(false);
    });
  });

  describe('when the modal is open', () => {
    let element: AtomicRelevanceInspector;
    let modal: AtomicModal;
    let ignoreButton: ReturnType<typeof page.getByRole>;
    let openButton: ReturnType<typeof page.getByRole>;

    beforeEach(async () => {
      const result = await renderRelevanceInspector();
      element = result.element;
      modal = result.modal;
      ignoreButton = result.ignoreButton;
      openButton = result.openButton;
      element.open = true;
      await element.updateComplete;
    });

    it('should close the modal when clicking the "ignore" button', async () => {
      await ignoreButton.click();
      await element.updateComplete;
      expect(modal.isOpen).toBe(false);
    });

    it('should close the modal and open a new tab with the adminHref when clicking the "open" button', async () => {
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
      await openButton.click();
      expect(openSpy).toHaveBeenCalledWith(
        `${ORG_ENDPOINT}/admin/#/org/search/relevanceInspector/resp123`,
        '_blank'
      );
      await element.updateComplete;
      expect(modal.isOpen).toBe(false);
    });
  });
});

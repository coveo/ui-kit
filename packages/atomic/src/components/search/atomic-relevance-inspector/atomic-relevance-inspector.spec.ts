import {getOrganizationEndpoint} from '@coveo/headless';
import {page} from '@vitest/browser/context';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import './atomic-relevance-inspector';
import type {AtomicRelevanceInspector} from './atomic-relevance-inspector';

vi.mock('@coveo/headless', {spy: true});

const ORG_ENDPOINT = 'https://searchuisamples.admin.org.coveo.com';

describe('atomic-relevance-inspector', () => {
  const engine = buildFakeSearchEngine({
    state: {
      configuration: {organizationId: 'org', environment: 'prod'},
      search: {searchResponseId: 'resp123'},
    },
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
      parts: (el: AtomicRelevanceInspector) => {
        const modal = el.shadowRoot?.querySelector('atomic-modal');
        return {modal};
      },
    };
  };

  it('should render an atomic-modal with default open false', async () => {
    const {element, parts} = await renderRelevanceInspector();
    expect(parts(element).modal).toBeTruthy();
    expect(parts(element).modal?.isOpen).toBe(false);
  });

  it('should open the modal when alt+double-clicking the interface element', async () => {
    const {element, parts} = await renderRelevanceInspector();
    const dblClick = new MouseEvent('dblclick', {altKey: true, bubbles: true});
    element.bindings.interfaceElement.dispatchEvent(dblClick);
    await element.updateComplete;
    expect(parts(element).modal?.isOpen).toBe(true);
    expect(page.getByText('Open the relevance inspector')).toBeVisible();
  });

  it('should toggle (close) the modal when alt+double-clicking again', async () => {
    const {element, parts} = await renderRelevanceInspector();
    const dblClick = new MouseEvent('dblclick', {altKey: true, bubbles: true});
    element.bindings.interfaceElement.dispatchEvent(dblClick);
    await element.updateComplete;
    expect(parts(element).modal?.isOpen).toBe(true);
    element.bindings.interfaceElement.dispatchEvent(dblClick);
    await element.updateComplete;
    expect(parts(element).modal?.isOpen).toBe(false);
  });

  it('should not open the modal when double-clicking without alt key', async () => {
    const {element, parts} = await renderRelevanceInspector();
    const dblClick = new MouseEvent('dblclick', {bubbles: true});
    element.bindings.interfaceElement.dispatchEvent(dblClick);
    await element.updateComplete;
    expect(parts(element).modal?.isOpen).toBe(false);
  });

  it('should close when clicking Ignore button', async () => {
    const {element, ignoreButton, parts} = await renderRelevanceInspector();
    // open first
    element.bindings.interfaceElement.dispatchEvent(
      new MouseEvent('dblclick', {altKey: true, bubbles: true})
    );
    await element.updateComplete;
    await ignoreButton.click();
    await element.updateComplete;
    expect(parts(element).modal?.isOpen).toBe(false);
  });

  it('should open new tab with adminHref and close when clicking Open button', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const {element, openButton, parts} = await renderRelevanceInspector();
    element.bindings.interfaceElement.dispatchEvent(
      new MouseEvent('dblclick', {altKey: true, bubbles: true})
    );
    await element.updateComplete;
    await openButton.click();
    expect(openSpy).toHaveBeenCalledWith(
      `${ORG_ENDPOINT}/admin/#/org/search/relevanceInspector/resp123`,
      '_blank'
    );
    await element.updateComplete;
    expect(parts(element).modal?.isOpen).toBe(false);
  });

  it('should compute adminHref correctly', async () => {
    const {element} = await renderRelevanceInspector();
    // @ts-ignore access private
    const href = element.adminHref;
    expect(href).toBe(
      `${ORG_ENDPOINT}/admin/#/org/search/relevanceInspector/resp123`
    );
  });
});

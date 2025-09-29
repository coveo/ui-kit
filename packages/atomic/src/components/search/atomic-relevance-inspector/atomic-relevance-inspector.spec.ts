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

  const renderRelevanceInspector = async ({
    props = {},
  }: {
    props?: {open?: boolean};
  } = {}) => {
    const {element} =
      await renderInAtomicSearchInterface<AtomicRelevanceInspector>({
        template: html`<atomic-relevance-inspector
          ?open=${props.open}
        ></atomic-relevance-inspector>`,
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

  it('should set isOpen when open prop is passed', async () => {
    const {element, parts} = await renderRelevanceInspector({
      props: {open: true},
    });
    await element.updateComplete;
    expect(parts(element).modal?.isOpen).toBe(true);
  });

  it('should display header and body text when open is true', async () => {
    await renderRelevanceInspector({props: {open: true}});
    expect(page.getByText('Open the relevance inspector')).toBeVisible();
    expect(
      page.getByText(
        'The Relevance Inspector will open in the Coveo Administration Console.'
      )
    ).toBeVisible();
  });

  it('should close when clicking Ignore button', async () => {
    const {element, ignoreButton} = await renderRelevanceInspector({
      props: {open: true},
    });
    await ignoreButton.click();
    await element.updateComplete;
    expect(element.open).toBe(false);
  });

  it('should open new tab with adminHref and close when clicking Open button', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const {element, openButton} = await renderRelevanceInspector({
      props: {open: true},
    });
    await openButton.click();
    expect(openSpy).toHaveBeenCalledWith(
      `${ORG_ENDPOINT}/admin/#/org/search/relevanceInspector/resp123`,
      '_blank'
    );
    await element.updateComplete;
    expect(element.open).toBe(false);
  });

  it('should dispatch close event when closing', async () => {
    const closeSpy = vi.fn();
    const {element, ignoreButton} = await renderRelevanceInspector({
      props: {open: true},
    });
    element.addEventListener('atomic/relevanceInspector/close', closeSpy);
    await ignoreButton.click();
    expect(closeSpy).toHaveBeenCalledOnce();
  });

  it('should compute adminHref correctly', async () => {
    const {element} = await renderRelevanceInspector({props: {open: true}});
    // @ts-ignore access private
    const href = element.adminHref;
    expect(href).toBe(
      `${ORG_ENDPOINT}/admin/#/org/search/relevanceInspector/resp123`
    );
  });
});

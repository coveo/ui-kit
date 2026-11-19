import {buildSearchStatus} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import type {PopoverChildFacet} from '@/src/components/common/facets/popover/popover-type';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search/search-status-controller';
import type {AtomicPopover} from './atomic-popover';
import './atomic-popover';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-popover', () => {
  beforeEach(() => {
    vi.mocked(buildSearchStatus).mockReturnValue(
      buildFakeSearchStatus({
        hasError: false,
        firstSearchExecuted: true,
        hasResults: true,
        isLoading: false,
      })
    );
  });

  const renderPopover = async (engine = buildFakeSearchEngine()) => {
    const {element} = await renderInAtomicSearchInterface<AtomicPopover>({
      template: html`<atomic-popover>
        <div>Test Facet</div>
      </atomic-popover>`,
      selector: 'atomic-popover',
      bindings: (bindings) => {
        bindings.engine = engine;
        return bindings;
      },
    });

    const childFacet: PopoverChildFacet = {
      facetId: 'test-facet',
      label: () => 'Test Facet',
      element: document.createElement('div'),
      hasValues: () => true,
      numberOfActiveValues: () => 0,
      isHidden: () => false,
    };
    element.dispatchEvent(
      new CustomEvent('atomic/initializePopover', {
        detail: childFacet,
        bubbles: true,
        composed: true,
      })
    );
    await element.updateComplete;

    return element;
  };

  it('should render the popover button of its facet, like atomic-facet-popover', async () => {
    await renderPopover();

    await expect.element(page.getByRole('button', {name: /popover/i})).toBeVisible();
  });

  it('should log one deprecation warning per engine', async () => {
    const engine = buildFakeSearchEngine();

    await renderPopover(engine);
    await renderPopover(engine);

    expect(
      vi
        .mocked(engine.logger.warn)
        .mock.calls.filter(([message]) => String(message).startsWith('[Deprecated]'))
    ).toEqual([
      [
        '[Deprecated] The `atomic-popover` component is deprecated and will be removed in Atomic v4. Use `atomic-facet-popover` instead.',
      ],
    ]);
  });
});

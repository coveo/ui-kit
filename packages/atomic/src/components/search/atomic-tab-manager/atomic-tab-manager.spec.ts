import {buildTab, buildTabManager, type TabManagerState} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeTabManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/tab-manager-controller';
import type {AtomicTabManager} from './atomic-tab-manager';
import './atomic-tab-manager';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-tab-manager', () => {
  const locators = {
    tabArea: page.getByLabel('tab-area'),
    parts: (element: AtomicTabManager) => {
      const qs = (part: string) =>
        element.shadowRoot?.querySelector(`[part="${part}"]`);
      return {
        tabArea: qs('tab-area'),
      };
    },
  };

  const renderTabManager = async ({
    tabManagerState,
    slottedContent,
    clearFiltersOnTabChange = false,
  }: {
    tabManagerState?: Partial<TabManagerState>;
    slottedContent?: ReturnType<typeof html>;
    clearFiltersOnTabChange?: boolean;
  } = {}) => {
    const fakeTabManager = buildFakeTabManager({
      activeTab: 'all',
      ...tabManagerState,
    });

    vi.mocked(buildTabManager).mockReturnValue(fakeTabManager);

    vi.mocked(buildTab).mockImplementation((_engine, options) => {
      return {
        state: {
          isActive: options?.options?.id === fakeTabManager.state.activeTab,
        },
        select: vi.fn(),
        subscribe: vi.fn(),
      };
    });

    const {element} = await renderInAtomicSearchInterface<AtomicTabManager>({
      template: html`
        <atomic-tab-manager ?clear-filters-on-tab-change=${clearFiltersOnTabChange}>
          ${
            slottedContent ??
            html`
            <atomic-tab label="All" name="all"></atomic-tab>
            <atomic-tab label="Documentation" name="documentation"></atomic-tab>
            <atomic-tab label="Articles" name="articles"></atomic-tab>
          `
          }
        </atomic-tab-manager>
      `,
      selector: 'atomic-tab-manager',
    });

    return {element, fakeTabManager};
  };

  describe('when rendering with valid props', () => {
    it('should render successfully', async () => {
      const {element} = await renderTabManager();
      expect(element).toBeInTheDocument();
    });

    it('should render the tab area', async () => {
      await renderTabManager();
      await expect.element(locators.tabArea).toBeInTheDocument();
    });

    it('should have shadow DOM parts', async () => {
      const {element} = await renderTabManager();
      const parts = locators.parts(element);
      expect(parts.tabArea).toBeDefined();
    });
  });

  describe('when initializing', () => {
    it('should call buildTabManager with the engine', async () => {
      const {element} = await renderTabManager();

      expect(buildTabManager).toHaveBeenCalledWith(element.bindings.engine);
    });

    it('should call buildTab for each atomic-tab child', async () => {
      await renderTabManager();

      expect(buildTab).toHaveBeenCalledTimes(3);
    });

    it('should create tab controllers with correct options', async () => {
      const {element} = await renderTabManager();

      expect(buildTab).toHaveBeenCalledWith(element.bindings.engine, {
        options: {
          expression: '',
          id: 'all',
          clearFiltersOnTabChange: false,
        },
      });
    });

    it('should pass clearFiltersOnTabChange prop to tab controllers', async () => {
      const {element} = await renderTabManager({clearFiltersOnTabChange: true});

      expect(buildTab).toHaveBeenCalledWith(element.bindings.engine, {
        options: {
          expression: '',
          id: 'all',
          clearFiltersOnTabChange: true,
        },
      });
    });
  });

  describe('when rendering tabs', () => {
    it('should localize the label using bindings.i18n.t', async () => {
      const {element} = await renderTabManager();
      const i18nSpy = vi.spyOn(element.bindings.i18n, 't');

      // Trigger a re-render
      element.requestUpdate();
      await element.updateComplete;

      expect(i18nSpy).toHaveBeenCalledWith('All', {
        defaultValue: 'All',
      });
    });
  });

  describe('when no atomic-tab children exist', () => {
    let _consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      _consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
    });

    it('should set error when no atomic-tab children', async () => {
      const {element} = await renderTabManager({
        slottedContent: html``,
      });

      expect(element.error).toBeDefined();
      expect(element.error.message).toBe(
        'The "atomic-tab-manager" element requires at least one "atomic-tab" child.'
      );
    });
  });

  describe('when atomic-tab child is missing name attribute', () => {
    let _consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      _consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
    });

    it('should set error when atomic-tab is missing name', async () => {
      const {element} = await renderTabManager({
        slottedContent: html`
          <atomic-tab label="Test"></atomic-tab>
        `,
      });

      expect(element.error).toBeDefined();
      expect(element.error.message).toBe(
        'The "name" attribute must be defined on all "atomic-tab" children.'
      );
    });
  });
});

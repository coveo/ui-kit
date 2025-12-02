import {buildTab, buildTabManager, type TabManagerState} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeTabManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/tab-manager-controller';
import type {AtomicTabManager} from './atomic-tab-manager';
import './atomic-tab-manager';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-tab-manager', () => {
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
      } as never;
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

  it('should be defined', () => {
    const el = document.createElement('atomic-tab-manager');
    expect(el).toBeInstanceOf(HTMLElement);
  });

  describe('when rendering with valid props', () => {
    it('should render successfully', async () => {
      const {element} = await renderTabManager();
      expect(element).toBeDefined();
    });

    it('should have tab area part', async () => {
      const {element} = await renderTabManager();
      const tabArea = element.shadowRoot?.querySelector('[part="tab-area"]');
      expect(tabArea).toBeDefined();
    });

    it('should render tab bar', async () => {
      const {element} = await renderTabManager();
      const tabBar = element.shadowRoot?.querySelector('atomic-tab-bar');
      expect(tabBar).toBeDefined();
    });
  });

  describe('when initializing', () => {
    it('should call buildTabManager with the engine', async () => {
      const {element} = await renderTabManager();

      expect(buildTabManager).toHaveBeenCalledWith(element.bindings.engine);
    });
  });

  describe('when rendering tabs', () => {
    it('should have the correct number of tabs', async () => {
      const {element} = await renderTabManager();
      const tabElements = element.querySelectorAll('atomic-tab');
      expect(tabElements.length).toBe(3);
    });
  });

  describe('when no atomic-tab children exist', () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should set error when no atomic-tab children', async () => {
      const {element} = await renderTabManager({
        slottedContent: html``,
      });

      expect(element.error).toBeDefined();
      expect(element.error.message).toBe(
        'The "atomic-tab-manager" element requires at least one "atomic-tab" child.'
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('when atomic-tab child is missing name attribute', () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
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

      consoleErrorSpy.mockRestore();
    });
  });
});

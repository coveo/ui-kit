import {
  buildBreadcrumbManager as buildInsightBreadcrumbManager,
  buildQuerySummary as buildInsightQuerySummary,
  type BreadcrumbManager as InsightBreadcrumbManager,
  type BreadcrumbManagerState as InsightBreadcrumbManagerState,
  type QuerySummary as InsightQuerySummary,
  type QuerySummaryState as InsightQuerySummaryState,
} from '@coveo/headless/insight';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import {renderInAtomicInsightInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture';
import {buildFakeBreadcrumbManager} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/breadcrumb-manager';
import {buildFakeInsightEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/engine';
import {buildFakeQuerySummary} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/query-summary-controller';
import type {AtomicInsightRefineModal} from './atomic-insight-refine-modal';
import './atomic-insight-refine-modal';

vi.mock('@coveo/headless/insight', {spy: true});

describe('atomic-insight-refine-modal', () => {
  const mockedEngine = buildFakeInsightEngine();
  let mockedBreadcrumbManager: InsightBreadcrumbManager;
  let mockedQuerySummary: InsightQuerySummary;

  const renderRefineModal = async (
    options: {
      isOpen?: boolean;
      querySummaryState?: Partial<InsightQuerySummaryState>;
      breadcrumbManagerState?: Partial<InsightBreadcrumbManagerState>;
    } = {}
  ) => {
    const {isOpen = true, querySummaryState, breadcrumbManagerState} = options;

    mockedBreadcrumbManager = buildFakeBreadcrumbManager({
      state: breadcrumbManagerState,
    });
    mockedQuerySummary = buildFakeQuerySummary({state: querySummaryState});

    vi.mocked(buildInsightBreadcrumbManager).mockReturnValue(
      mockedBreadcrumbManager
    );
    vi.mocked(buildInsightQuerySummary).mockReturnValue(mockedQuerySummary);

    const {element} =
      await renderInAtomicInsightInterface<AtomicInsightRefineModal>({
        template: html`<atomic-insight-refine-modal
        ?is-open=${isOpen}
      ></atomic-insight-refine-modal>`,
        selector: 'atomic-insight-refine-modal',
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          bindings.store.getFacetElements = () => [
            document.createElement('div'),
            document.createElement('div'),
          ];
          bindings.store.getAllFacets = () => ({
            '1': {
              facetId: '1',
              label: () => 'Test Facet',
              element: document.createElement('div'),
              isHidden: () => false,
            },
          });
          return bindings;
        },
      });

    return {
      element,
      title: element.shadowRoot?.querySelector('[part="title"]'),
      closeButton: element.shadowRoot?.querySelector('[part="close-button"]'),
      closeIcon: element.shadowRoot?.querySelector('[part="close-icon"]'),
      footerContent: element.shadowRoot?.querySelector(
        '[part="footer-content"]'
      ),
      footerButton: element.shadowRoot?.querySelector('[part="footer-button"]'),
      footerButtonText: element.shadowRoot?.querySelector(
        '[part="footer-button-text"]'
      ),
      footerButtonCount: element.shadowRoot?.querySelector(
        '[part="footer-button-count"]'
      ),
      atomicModal: element.shadowRoot?.querySelector('atomic-modal'),
      body: element.shadowRoot?.querySelector('aside[slot="body"]'),
      facetSlot: element.shadowRoot?.querySelector('slot[name="facets"]'),
      getClearAllButton: () =>
        Array.from(element.shadowRoot?.querySelectorAll('button') ?? []).find(
          (btn) => btn.textContent?.includes('Clear All Filters')
        ),
    };
  };

  describe('when connected to the DOM', () => {
    it('should set display style to empty string', async () => {
      const {element} = await renderRefineModal();

      expect(element.style.display).toBe('');
    });
  });

  describe('when initializing', () => {
    it('should build breadcrumb manager with engine', async () => {
      const {element} = await renderRefineModal();

      expect(buildInsightBreadcrumbManager).toHaveBeenCalledWith(mockedEngine);
      expect(element.breadcrumbManager).toBe(mockedBreadcrumbManager);
    });

    it('should build query summary with engine', async () => {
      const {element} = await renderRefineModal();

      expect(buildInsightQuerySummary).toHaveBeenCalledWith(mockedEngine);
      expect(element.querySummary).toBe(mockedQuerySummary);
    });
  });

  describe('when binding state', () => {
    it('should bind query summary state to controller', async () => {
      const {element} = await renderRefineModal({
        querySummaryState: {total: 42},
      });

      expect(element.querySummaryState.total).toBe(42);
    });

    it('should bind breadcrumb manager state to controller', async () => {
      const {element} = await renderRefineModal({
        breadcrumbManagerState: {hasBreadcrumbs: true},
      });

      expect(element.breadcrumbManagerState?.hasBreadcrumbs).toBe(true);
    });
  });

  describe('when rendering', () => {
    it('should render modal with all expected elements when isOpen is true', async () => {
      const {
        atomicModal,
        title,
        closeButton,
        closeIcon,
        footerContent,
        footerButton,
        footerButtonText,
        body,
        facetSlot,
      } = await renderRefineModal({
        isOpen: true,
        querySummaryState: {total: 123},
      });

      expect(atomicModal).toBeInTheDocument();
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Filters');
      expect(closeButton).toBeInTheDocument();
      expect(closeIcon).toBeInTheDocument();
      expect(footerContent).toBeInTheDocument();
      expect(footerButton).toBeInTheDocument();
      expect(footerButtonText).toBeInTheDocument();
      expect(footerButtonText).toHaveTextContent('View results');
      expect(body).toBeInTheDocument();
      expect(body).toHaveAttribute('slot', 'body');
      expect(facetSlot).toBeInTheDocument();
    });

    it('should render footer button count with total results', async () => {
      const {footerButtonCount} = await renderRefineModal({
        querySummaryState: {total: 123},
      });

      expect(footerButtonCount).toBeInTheDocument();
      expect(footerButtonCount).toHaveTextContent('(123)');
    });

    it('should render clear all button when hasBreadcrumbs is true', async () => {
      const {getClearAllButton} = await renderRefineModal({
        breadcrumbManagerState: {hasBreadcrumbs: true},
      });

      const clearAllButton = getClearAllButton();
      expect(clearAllButton).toBeInTheDocument();
      expect(clearAllButton).toHaveTextContent('Clear All Filters');
    });

    it('should not render clear all button when hasBreadcrumbs is false', async () => {
      const {getClearAllButton} = await renderRefineModal({
        breadcrumbManagerState: {hasBreadcrumbs: false},
      });

      expect(getClearAllButton()).not.toBeInTheDocument();
    });

    it('should not render body section when no facets', async () => {
      const {element, body} = await renderRefineModal();
      element.bindings.store.getFacetElements = () => [];
      element.requestUpdate();
      await element.updateComplete;

      expect(body).not.toBeInTheDocument();
    });
  });

  describe('when clicking clear all button', () => {
    it('should call breadcrumbManager.deselectAll', async () => {
      const {getClearAllButton} = await renderRefineModal({
        breadcrumbManagerState: {hasBreadcrumbs: true},
      });

      await userEvent.click(getClearAllButton()!);

      expect(mockedBreadcrumbManager.deselectAll).toHaveBeenCalled();
    });
  });

  describe('when closing the modal', () => {
    it('should set isOpen to false when close button is clicked', async () => {
      const {element, closeButton} = await renderRefineModal({isOpen: true});

      expect(element.isOpen).toBe(true);

      await userEvent.click(closeButton!);

      expect(element.isOpen).toBe(false);
    });

    it('should set isOpen to false when footer button is clicked', async () => {
      const {element, footerButton} = await renderRefineModal({isOpen: true});

      expect(element.isOpen).toBe(true);

      await userEvent.click(footerButton!);

      expect(element.isOpen).toBe(false);
    });
  });

  describe('when isOpen changes', () => {
    it('should append facet slot when modal is opened', async () => {
      const {element} = await renderRefineModal({isOpen: false});

      expect(
        element.querySelector('div[slot="facets"]')
      ).not.toBeInTheDocument();

      element.isOpen = true;
      await element.updateComplete;

      expect(element.querySelector('div[slot="facets"]')).toBeInTheDocument();
    });

    it('should not append duplicate facet slot when already exists', async () => {
      const {element} = await renderRefineModal({isOpen: false});

      // Open first time
      element.isOpen = true;
      await element.updateComplete;

      const firstSlot = element.querySelector('div[slot="facets"]');
      expect(firstSlot).toBeInTheDocument();

      // Close and reopen
      element.isOpen = false;
      await element.updateComplete;
      element.isOpen = true;
      await element.updateComplete;

      const slots = element.querySelectorAll('div[slot="facets"]');
      expect(slots.length).toBe(1);
    });
  });
});

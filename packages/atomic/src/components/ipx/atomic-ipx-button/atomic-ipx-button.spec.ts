import {html} from 'lit';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import type {AtomicIpxButton} from './atomic-ipx-button';
import './atomic-ipx-button';

const mockGetRecommendations = vi.fn();
const mockLoadRecommendationActions = vi.fn(() => ({
  getRecommendations: mockGetRecommendations,
}));

vi.mock('@coveo/headless/recommendation', () => ({
  loadRecommendationActions: mockLoadRecommendationActions,
}));

describe('atomic-ipx-button', () => {
  let mockRecsEngine: {
    dispatch: MockInstance;
  };
  let mockRecsInterface: HTMLElement;
  let mockIpxModal: HTMLElement;

  beforeEach(() => {
    mockRecsEngine = {
      dispatch: vi.fn(),
    };

    mockRecsInterface = document.createElement('atomic-recs-interface');
    Object.defineProperty(mockRecsInterface, 'engine', {
      value: mockRecsEngine,
      writable: true,
    });

    mockIpxModal = document.createElement('atomic-ipx-modal');
    mockIpxModal.setAttribute = vi.fn();
  });

  const renderButton = async ({
    label,
    closeIcon,
    openIcon,
    isModalOpen = false,
  }: {
    label?: string;
    closeIcon?: string;
    openIcon?: string;
    isModalOpen?: boolean;
  } = {}) => {
    const element = await fixture<AtomicIpxButton>(html`
      <atomic-ipx-button
        .label=${label}
        .closeIcon=${closeIcon}
        .openIcon=${openIcon}
        .isModalOpen=${isModalOpen}
      ></atomic-ipx-button>
    `);

    return {
      element,
      parts: {
        container: element.shadowRoot?.querySelector('[part="container"]'),
        ipxButton: element.shadowRoot?.querySelector('[part="ipx-button"]'),
        buttonIcon: element.shadowRoot?.querySelector('[part="button-icon"]'),
        buttonText: element.shadowRoot?.querySelector('[part="button-text"]'),
        closeIcon: element.shadowRoot?.querySelector('[part="ipx-close-icon"]'),
        openIcon: element.shadowRoot?.querySelector('[part="ipx-open-icon"]'),
      },
    };
  };

  describe('when rendering with valid props', () => {
    it('should render successfully with default props', async () => {
      const {element} = await renderButton();
      expect(element).toBeInTheDocument();
    });

    it('should render all parts', async () => {
      const {parts} = await renderButton();
      expect(parts.container).toBeTruthy();
      expect(parts.ipxButton).toBeTruthy();
      expect(parts.buttonIcon).toBeTruthy();
      expect(parts.closeIcon).toBeTruthy();
      expect(parts.openIcon).toBeTruthy();
    });

    it('should reflect isModalOpen property to attribute', async () => {
      const {element} = await renderButton({isModalOpen: true});
      expect(element.getAttribute('is-modal-open')).toBe('true');
    });

    it('should render button text when label is provided', async () => {
      const {parts} = await renderButton({label: 'Search'});
      expect(parts.buttonText).toBeTruthy();
      expect(parts.buttonText?.textContent).toBe('Search');
    });

    it('should not render button text when label is not provided', async () => {
      const {parts} = await renderButton();
      expect(parts.buttonText).toBeFalsy();
    });

    it('should have isModalOpen false by default', async () => {
      const {element} = await renderButton();
      expect(element.isModalOpen).toBe(false);
    });

    it('should allow updating properties', async () => {
      const {element} = await renderButton();
      element.label = 'Updated Label';
      element.isModalOpen = true;
      await element.updateComplete;
      expect(element.label).toBe('Updated Label');
      expect(element.isModalOpen).toBe(true);
    });
  });
});

import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFakeProductListing} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product-listing-controller';
import {buildFakeSearch} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/search-controller';
import {buildProductListing, buildSearch} from '@coveo/headless/commerce';
import {page} from '@vitest/browser/context';
import {html} from 'lit';
import {vi, describe, it, expect, beforeEach} from 'vitest';
import {CommerceAPIErrorStatusResponse} from '../../../../../headless/src/api/commerce/commerce-api-error-response';
import './atomic-commerce-query-error';
import {AtomicCommerceQueryError} from './atomic-commerce-query-error';

// Mock headless at the top level
vi.mock('@coveo/headless/commerce', {spy: true});

describe('atomic-commerce-query-error', () => {
  let mockAriaLiveElement: {
    registerRegion: ReturnType<typeof vi.fn>;
    updateMessage: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Mock aria live element
    mockAriaLiveElement = {
      registerRegion: vi.fn(),
      updateMessage: vi.fn(),
    };

    // Mock the aria live event listener
    const originalAddEventListener = document.addEventListener;
    document.addEventListener = vi.fn((event, listener) => {
      if (event === 'atomic/accessibility/findAriaLive') {
        return;
      }
      return originalAddEventListener.call(document, event, listener);
    });

    // Mock document.dispatchEvent to simulate aria live element
    const originalDispatchEvent = document.dispatchEvent;
    document.dispatchEvent = vi.fn((event: Event) => {
      if (event.type === 'atomic/accessibility/findAriaLive') {
        (event as CustomEvent).detail.element = mockAriaLiveElement;
        return true;
      }
      return originalDispatchEvent.call(document, event);
    });
  });

  const locators = {
    icon: page.getByRole('img'),
    moreInfoButton: page.getByRole('button'),
    getParts: (element: AtomicCommerceQueryError) => {
      const qs = (part: string) =>
        element.shadowRoot?.querySelector(`[part="${part}"]`);
      return {
        icon: qs('icon'),
        title: qs('title'),
        description: qs('description'),
        moreInfoBtn: qs('more-info-btn'),
        errorInfo: qs('error-info'),
        docLink: qs('doc-link'),
      };
    },
  };

  const mockError: CommerceAPIErrorStatusResponse = {
    statusCode: 500,
    message: 'Internal server error',
    type: 'InternalServerError',
  };

  const renderQueryError = async (
    options: {
      interfaceType?: 'search' | 'product-listing';
      error?: CommerceAPIErrorStatusResponse | null;
    } = {}
  ) => {
    const {interfaceType = 'search', error = null} = options;

    const mockController =
      interfaceType === 'search'
        ? buildFakeSearch({state: {error}})
        : buildFakeProductListing({state: {error}});

    const buildFunction =
      interfaceType === 'search' ? buildSearch : buildProductListing;
    vi.mocked(buildFunction).mockReturnValue(mockController);

    const {element} =
      await renderInAtomicCommerceInterface<AtomicCommerceQueryError>({
        template: html`<atomic-commerce-query-error></atomic-commerce-query-error>`,
        selector: 'atomic-commerce-query-error',
        bindings: (bindings) => {
          bindings.engine = {
            configuration: {
              organizationId: 'test-org',
              environment: 'dev',
              commerce: {
                apiBaseUrl: 'https://test.commerce.api.com',
              },
            },
            logger: {warn: vi.fn(), error: vi.fn()},
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any;
          bindings.interfaceElement.type = interfaceType;
          bindings.store.onChange = vi.fn();
          return bindings;
        },
      });

    return element;
  };

  it('should render the component', async () => {
    const element = await renderQueryError();
    expect(element).toBeDefined();
    expect(element.tagName.toLowerCase()).toBe('atomic-commerce-query-error');
  });

  it('should not render anything when there is no error', async () => {
    const element = await renderQueryError({error: null});
    await element.updateComplete;
    expect(element.shadowRoot?.textContent?.trim()).toBe('');
  });

  it('should have proper initialization', async () => {
    const element = await renderQueryError();
    expect(element.initialize).toBeDefined();
    expect(typeof element.initialize).toBe('function');
  });

  describe('when there is an error', () => {
    it('should display error icon', async () => {
      const iconElement = locators.getParts(
        await renderQueryError({error: mockError})
      ).icon;
      expect(iconElement).toBeDefined();
    });

    it('should display error title', async () => {
      const titleElement = locators.getParts(
        await renderQueryError({error: mockError})
      ).title;
      expect(titleElement).toBeDefined();
      expect(titleElement).toHaveTextContent('Something went wrong.');
    });

    it('should display error description', async () => {
      const descriptionElement = locators.getParts(
        await renderQueryError({error: mockError})
      ).description;
      expect(descriptionElement).toBeDefined();
      expect(descriptionElement).toHaveTextContent(
        'If the problem persists contact the administrator.'
      );
    });

    it('should display show more info button', async () => {
      await renderQueryError({error: mockError});
      await expect.element(locators.moreInfoButton).toBeVisible();
    });

    it('should not display error details initially', async () => {
      const element = await renderQueryError({error: mockError});
      const errorDetails = locators.getParts(element).errorInfo;
      // Error details should not exist in DOM when not shown
      expect(errorDetails).toBeNull();
    });

    it('should update aria live region with error message', async () => {
      const element = await renderQueryError({error: mockError});
      await element.updateComplete;

      expect(mockAriaLiveElement.updateMessage).toHaveBeenCalledWith(
        'commerce-query-error',
        'Something went wrong. If the problem persists contact the administrator.',
        true
      );
    });
  });

  describe('when show more info button is clicked', () => {
    it('should toggle error details visibility', async () => {
      const element = await renderQueryError({error: mockError});
      await element.updateComplete;

      // Initially hidden - error details should not exist in DOM
      let errorDetailsElement = locators.getParts(element).errorInfo;
      expect(errorDetailsElement).toBeNull();

      // Click to show
      await locators.moreInfoButton.click();
      await element.updateComplete;

      // Get the element again after the update
      errorDetailsElement = locators.getParts(element).errorInfo;
      expect(errorDetailsElement).not.toBeNull();
      await expect.element(errorDetailsElement!).toBeVisible();

      // Click to hide
      await locators.moreInfoButton.click();
      await element.updateComplete;

      // Element should not exist in DOM when hidden
      errorDetailsElement = locators.getParts(element).errorInfo;
      expect(errorDetailsElement).toBeNull();
    });

    it('should display error details as JSON', async () => {
      const element = await renderQueryError({error: mockError});
      await element.updateComplete;

      await locators.moreInfoButton.click();
      await element.updateComplete;

      const errorDetailsElement = locators.getParts(element).errorInfo;
      expect(errorDetailsElement).not.toBeNull();
      expect(errorDetailsElement!.textContent).toContain('"statusCode": 500');
      expect(errorDetailsElement!.textContent).toContain(
        '"message": "Internal server error"'
      );
    });
  });

  describe('when interface type is product-listing', () => {
    it('should initialize with product listing controller', async () => {
      await renderQueryError({
        interfaceType: 'product-listing',
        error: mockError,
      });

      expect(vi.mocked(buildProductListing)).toHaveBeenCalled();
      expect(vi.mocked(buildSearch)).not.toHaveBeenCalled();
    });
  });

  describe('when interface type is search', () => {
    it('should initialize with search controller', async () => {
      await renderQueryError({
        interfaceType: 'search',
        error: mockError,
      });

      expect(vi.mocked(buildSearch)).toHaveBeenCalled();
    });
  });

  describe('when error type is known', () => {
    const knownErrors = [
      {type: 'Disconnected', expectedTitle: 'disconnected'},
      {type: 'NoEndpointsException', expectedTitle: 'no-endpoints'},
      {type: 'InvalidTokenException', expectedTitle: 'cannot-access'},
      {
        type: 'OrganizationIsPausedException',
        expectedTitle: 'organization-is-paused',
      },
    ];

    knownErrors.forEach(({type}) => {
      it(`should handle ${type} error correctly`, async () => {
        const knownError = {...mockError, type};
        const element = await renderQueryError({error: knownError});
        await element.updateComplete;

        // The aria live message should be set with the appropriate error message
        expect(mockAriaLiveElement.updateMessage).toHaveBeenCalledWith(
          'commerce-query-error',
          expect.any(String),
          true
        );
      });
    });
  });

  describe('when error type is unknown', () => {
    it('should display generic error message', async () => {
      const unknownError = {...mockError, type: 'UnknownError'};
      const element = await renderQueryError({error: unknownError});
      await element.updateComplete;

      expect(mockAriaLiveElement.updateMessage).toHaveBeenCalledWith(
        'commerce-query-error',
        'Something went wrong. If the problem persists contact the administrator.',
        true
      );
    });
  });

  describe('#initialize', () => {
    it('should build product listing controller when interface type is product-listing', async () => {
      const element = await renderQueryError({
        interfaceType: 'product-listing',
      });
      element.initialize();

      expect(vi.mocked(buildProductListing)).toHaveBeenCalledWith(
        element.bindings.engine
      );
    });

    it('should build search controller when interface type is search', async () => {
      const element = await renderQueryError({interfaceType: 'search'});
      element.initialize();

      expect(vi.mocked(buildSearch)).toHaveBeenCalledWith(
        element.bindings.engine
      );
    });
  });

  describe('#render', () => {
    it('should return empty content when no error exists', async () => {
      const element = await renderQueryError({error: null});
      await element.updateComplete;

      const content = element.shadowRoot?.textContent?.trim();
      expect(content).toBe('');
    });

    it('should render error content when error exists', async () => {
      const element = await renderQueryError({error: mockError});
      await element.updateComplete;

      const parts = locators.getParts(element);
      expect(parts.icon).toBeDefined();
      expect(parts.title).toBeDefined();
      expect(parts.description).toBeDefined();
    });

    it('should set showMoreInfo state correctly', async () => {
      const element = await renderQueryError({error: mockError});
      await element.updateComplete;

      expect(element.showMoreInfo).toBe(false);

      await locators.moreInfoButton.click();
      expect(element.showMoreInfo).toBe(true);
    });
  });
});

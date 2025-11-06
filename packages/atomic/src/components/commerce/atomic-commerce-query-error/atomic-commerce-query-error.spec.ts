import {buildProductListing, buildSearch} from '@coveo/headless/commerce';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import {getAriaMessageFromErrorType} from '@/src/components/common/query-error/utils';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFakeCommerceEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/engine';
import {buildFakeProductListing} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product-listing-controller';
import {buildFakeSearch} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/search-controller';
import type {AtomicCommerceQueryError} from './atomic-commerce-query-error';
import './atomic-commerce-query-error';

vi.mock('@coveo/headless/commerce', {spy: true});
vi.mock('@/src/components/common/query-error/utils', {spy: true});

describe('atomic-commerce-query-error', () => {
  const mockedEngine = buildFakeCommerceEngine();
  const mockError = {
    type: 'UnknownError',
    statusCode: 500,
    message: 'An error occurred',
  };
  const renderQueryError = async ({
    interfaceElementType = 'search',
    error = mockError,
  }: {
    interfaceElementType?: 'product-listing' | 'search';
    // biome-ignore lint/suspicious/noExplicitAny: <>
    error?: any;
  } = {}) => {
    vi.mocked(buildProductListing).mockReturnValue(
      buildFakeProductListing({
        state: {error},
      })
    );
    vi.mocked(buildSearch).mockReturnValue(buildFakeSearch({state: {error}}));

    const {element} =
      await renderInAtomicCommerceInterface<AtomicCommerceQueryError>({
        template: html`<atomic-commerce-query-error></atomic-commerce-query-error>`,
        selector: 'atomic-commerce-query-error',
        bindings: (bindings) => {
          bindings.interfaceElement.type = interfaceElementType;
          bindings.engine = mockedEngine;
          return bindings;
        },
      });

    return {
      element,
      locators: {
        get errorDetails() {
          return element.shadowRoot?.querySelector('pre');
        },
        get icon() {
          return element.shadowRoot?.querySelector('[part="icon"]');
        },
        get title() {
          return element.shadowRoot?.querySelector('[part="title"]');
        },
        get description() {
          return element.shadowRoot?.querySelector('[part="description"]');
        },
        get showMoreInfoButton() {
          return element.shadowRoot?.querySelector('[part="more-info-btn"]');
        },
        get docLink() {
          return element.shadowRoot?.querySelector('[part="doc-link"]');
        },
      },
    };
  };

  it('should initialize with search controller when interface type is search', async () => {
    await renderQueryError({interfaceElementType: 'search'});
    expect(buildSearch).toHaveBeenCalledWith(mockedEngine);
  });

  it('should initialize with product listing controller when interface type is product-listing', async () => {
    await renderQueryError({interfaceElementType: 'product-listing'});
    expect(buildProductListing).toHaveBeenCalledWith(mockedEngine);
  });

  it('should display nothing when no error exists', async () => {
    const {element} = await renderQueryError({error: null});

    expect(element).toBeEmptyDOMElement();
  });

  it('should call getAriaMessageFromErrorType with the correct parameters', async () => {
    await renderQueryError();
    expect(getAriaMessageFromErrorType).toHaveBeenCalledWith(
      expect.anything(),
      mockedEngine.configuration.organizationId,
      mockedEngine.configuration.commerce.apiBaseUrl,
      mockError.type
    );
  });

  it('should render the icon with the correct part', async () => {
    const {locators} = await renderQueryError();

    expect(locators.icon).toHaveAttribute('part', 'icon');
  });

  it('should render the title with the correct part', async () => {
    const {locators} = await renderQueryError();

    expect(locators.title).toHaveAttribute('part', 'title');
  });

  it('should render the description with the correct part', async () => {
    const {locators} = await renderQueryError();

    expect(locators.description).toHaveAttribute('part', 'description');
  });

  describe('when the show more info button is shown', () => {
    it('should render the button with the correct part', async () => {
      const {locators} = await renderQueryError();

      expect(locators.showMoreInfoButton).toHaveAttribute(
        'part',
        'more-info-btn'
      );
    });

    it('should render the button with the correct text', async () => {
      const {locators} = await renderQueryError();

      expect(locators.showMoreInfoButton).toHaveTextContent('Learn more');
    });

    it('should toggle the show more info state when clicked', async () => {
      const {locators} = await renderQueryError();
      expect(locators.errorDetails).toBeNull();

      await userEvent.click(locators.showMoreInfoButton!);

      expect(locators.errorDetails).toBeVisible();
    });

    describe('when the show more info button is clicked', () => {
      let showMoreInfoButton: HTMLButtonElement;
      let errorDetails: HTMLPreElement;
      beforeEach(async () => {
        const {locators} = await renderQueryError();
        showMoreInfoButton = locators.showMoreInfoButton as HTMLButtonElement;
        await userEvent.click(showMoreInfoButton);
        errorDetails = locators.errorDetails as HTMLPreElement;
      });

      it('should display the error details with the correct part', async () => {
        expect(errorDetails).toHaveAttribute('part', 'error-info');
      });

      it('should display the stringified error details', async () => {
        expect(errorDetails.querySelector('code')?.textContent).toBe(
          JSON.stringify(mockError, null, 2)
        );
      });

      it('should hide the error details when clicked again', async () => {
        await userEvent.click(showMoreInfoButton);
        expect(errorDetails).not.toBeVisible();
      });
    });
  });

  describe('when the doc link is displayed', () => {
    let locators: Awaited<ReturnType<typeof renderQueryError>>['locators'];
    beforeEach(async () => {
      const {locators: renderedLocators} = await renderQueryError({
        error: {
          type: 'NoEndpointsException',
          statusCode: 500,
          message: 'No endpoints available',
        },
      });
      locators = renderedLocators;
    });

    it('should render the doc link with the correct part', async () => {
      expect(locators.docLink).toHaveAttribute('part', 'doc-link');
    });

    it('should render the doc link with the correct text', async () => {
      expect(locators.docLink).toHaveTextContent('Coveo Online Help');
    });
  });

  describe('when the error type is "Disconnected"', () => {
    let locators: Awaited<ReturnType<typeof renderQueryError>>['locators'];

    beforeEach(async () => {
      const mockError = {
        type: 'Disconnected',
        statusCode: 500,
        message: 'Disconnected from the server',
      };
      ({locators} = await renderQueryError({error: mockError}));
    });

    it('should display the correct title', () => {
      expect(locators.title).toHaveTextContent('No access.');
    });

    it('should display the correct description', () => {
      expect(locators.description).toHaveTextContent(
        "Your query couldn't be sent to the following URL: https:&#x2F;&#x2F;fake-commerce-api.com. Verify your connection."
      );
    });

    it('should display the show more info button', () => {
      expect(locators.showMoreInfoButton).toBeInTheDocument();
    });

    it('should not display the doc link', () => {
      expect(locators.docLink).not.toBeInTheDocument();
    });
  });

  describe('when the error type is "NoEndpointsException"', () => {
    let locators: Awaited<ReturnType<typeof renderQueryError>>['locators'];

    beforeEach(async () => {
      const mockError = {
        type: 'NoEndpointsException',
        statusCode: 500,
        message: 'No endpoints available',
      };
      ({locators} = await renderQueryError({error: mockError}));
    });

    it('should display the correct title', () => {
      expect(locators.title).toHaveTextContent(
        'Your organization searchuisamples has no available content.'
      );
    });

    it('should display the correct description', () => {
      expect(locators.description).toHaveTextContent(
        'Add content sources or wait for your newly created sources to finish indexing.'
      );
    });

    it('should not display the show more info button', () => {
      expect(locators.showMoreInfoButton).not.toBeInTheDocument();
    });

    it('should display the doc link', () => {
      expect(locators.docLink).toBeInTheDocument();
    });
  });

  describe('when the error type is "InvalidTokenException"', () => {
    let locators: Awaited<ReturnType<typeof renderQueryError>>['locators'];

    beforeEach(async () => {
      const mockError = {
        type: 'InvalidTokenException',
        statusCode: 401,
        message: 'Invalid token',
      };
      ({locators} = await renderQueryError({error: mockError}));
    });

    it('should display the correct title', () => {
      expect(locators.title).toHaveTextContent(
        'Your organization searchuisamples cannot be accessed.'
      );
    });

    it('should display the correct description', () => {
      expect(locators.description).toHaveTextContent(
        'Ensure that the token is valid.'
      );
    });

    it('should not display the show more info button', () => {
      expect(locators.showMoreInfoButton).not.toBeInTheDocument();
    });

    it('should display the doc link', () => {
      expect(locators.docLink).toBeInTheDocument();
    });
  });

  describe('when the error type is "OrganizationIsPausedException"', () => {
    let locators: Awaited<ReturnType<typeof renderQueryError>>['locators'];

    beforeEach(async () => {
      const mockError = {
        type: 'OrganizationIsPausedException',
        statusCode: 403,
        message: 'Organization is paused',
      };
      ({locators} = await renderQueryError({error: mockError}));
    });

    it('should display the correct title', () => {
      expect(locators.title).toHaveTextContent(
        'Your organization searchuisamples is paused due to inactivity and search is currently unavailable.'
      );
    });

    it('should display the correct description', () => {
      expect(locators.description).toHaveTextContent(
        'Your organization is resuming and will be available shortly.'
      );
    });

    it('should not display the show more info button', () => {
      expect(locators.showMoreInfoButton).not.toBeInTheDocument();
    });

    it('should display the doc link', () => {
      expect(locators.docLink).toBeInTheDocument();
    });
  });
});

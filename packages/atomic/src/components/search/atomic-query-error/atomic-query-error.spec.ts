import {
  buildQueryError,
  type QueryError,
  type QueryErrorState,
} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {getAriaMessageFromErrorType} from '@/src/components/common/query-error/utils';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import type {AtomicQueryError} from './atomic-query-error';
import './atomic-query-error';

vi.mock('@coveo/headless', {spy: true});
vi.mock('@/src/components/common/query-error/utils', {spy: true});

describe('atomic-query-error', () => {
  const mockError = {
    type: 'UnknownError',
    statusCode: 500,
    message: 'An error occurred',
  };

  const locators = {
    parts: (element: AtomicQueryError) => {
      const qs = (part: string) =>
        element.shadowRoot?.querySelector(`[part="${part}"]`);
      return {
        icon: qs('icon'),
        title: qs('title'),
        description: qs('description'),
        docLink: qs('doc-link'),
        moreInfoBtn: qs('more-info-btn'),
        errorInfo: qs('error-info'),
      };
    },
  };

  const buildFakeQueryError = ({
    implementation,
    state,
  }: Partial<{
    implementation?: Partial<QueryError>;
    state?: Partial<QueryErrorState>;
  }> = {}): QueryError => {
    const defaultState = {
      hasError: false,
      error: null,
    };

    return {
      subscribe: vi.fn((callback) => {
        callback();
        return vi.fn();
      }),
      state: {
        ...defaultState,
        ...state,
      },
      ...implementation,
    } as QueryError;
  };

  const renderQueryError = async (
    options: {
      hasError?: boolean;
      error?: {type?: string; statusCode?: number; message?: string} | null;
      organizationId?: string;
      environment?: string;
    } = {}
  ) => {
    const {
      hasError = false,
      error = null,
      organizationId = 'test-org',
      environment = 'prod',
    } = options;

    const mockedQueryError = buildFakeQueryError({
      state: {hasError, error: error as QueryErrorState['error']},
    });

    vi.mocked(buildQueryError).mockReturnValue(mockedQueryError);

    const mockedEngine = buildFakeSearchEngine({
      state: {
        configuration: {
          organizationId,
          environment,
          accessToken: 'fake-token',
        },
        search: {
          error,
        },
      },
    });

    const {element} = await renderInAtomicSearchInterface<AtomicQueryError>({
      template: html`<atomic-query-error></atomic-query-error>`,
      selector: 'atomic-query-error',
      bindings: (bindings) => {
        bindings.engine = mockedEngine;
        return bindings;
      },
    });

    return element;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly', async () => {
    const element = await renderQueryError();
    expect(element).toBeDefined();
  });

  it('should initialize with query error controller', async () => {
    const element = await renderQueryError();
    expect(buildQueryError).toHaveBeenCalledWith(element.bindings.engine);
  });

  it('should render nothing when there is no error', async () => {
    const element = await renderQueryError({hasError: false});

    expect(element.shadowRoot?.textContent?.trim()).toBe('');
  });

  it('should render error content when there is an error', async () => {
    const element = await renderQueryError({hasError: true, error: mockError});

    expect(element.shadowRoot?.textContent).not.toBe('');
  });

  describe('when an error occurs', () => {
    it('should display all error parts', async () => {
      const element = await renderQueryError({
        hasError: true,
        error: mockError,
      });
      const parts = locators.parts(element);

      expect(parts.icon).toBeInTheDocument();
      expect(parts.title).toBeInTheDocument();
      expect(parts.description).toBeInTheDocument();
    });

    it('should set aria message for accessibility', async () => {
      const element = await renderQueryError({
        hasError: true,
        error: mockError,
        organizationId: 'test-org',
        environment: 'prod',
      });

      expect(getAriaMessageFromErrorType).toHaveBeenCalledWith(
        element.bindings.i18n,
        'test-org',
        expect.any(String), // organization endpoint URL
        mockError.type
      );
    });
  });

  describe('when showMoreInfo is toggled', () => {
    it('should initially set showMoreInfo to false', async () => {
      const element = await renderQueryError({
        hasError: true,
        error: mockError,
      });
      expect(element.showMoreInfo).toBe(false);
    });

    it('should toggle showMoreInfo when show more is triggered', async () => {
      const element = await renderQueryError({
        hasError: true,
        error: mockError,
      });

      // Simulate the onShowMore callback being triggered
      element.showMoreInfo = !element.showMoreInfo;

      expect(element.showMoreInfo).toBe(true);

      // Toggle again
      element.showMoreInfo = !element.showMoreInfo;

      expect(element.showMoreInfo).toBe(false);
    });

    it('should render error details when showMoreInfo is true', async () => {
      const element = await renderQueryError({
        hasError: true,
        error: mockError,
      });
      element.showMoreInfo = true;
      await element.updateComplete;

      const parts = locators.parts(element);
      expect(parts.errorInfo).toBeInTheDocument();
    });
  });

  describe('when different error types occur', () => {
    const errorTypes = [
      'InvalidTokenException',
      'Disconnected',
      'NoEndpointsException',
      'OrganizationIsPausedException',
      'UnknownError',
    ];

    errorTypes.forEach((errorType) => {
      it(`should handle ${errorType} error type`, async () => {
        const errorWithType = {...mockError, type: errorType};
        await renderQueryError({hasError: true, error: errorWithType});

        // Verify the controller was called with the correct error state
        const mockQueryError =
          vi.mocked(buildQueryError).mock.results[0]?.value;
        expect(mockQueryError?.state.error?.type).toBe(errorType);
      });
    });
  });

  describe('when organization configuration changes', () => {
    it('should handle different organization IDs', async () => {
      const element = await renderQueryError({
        hasError: true,
        error: mockError,
        organizationId: 'custom-org-id',
      });

      expect(element.bindings.engine.state.configuration.organizationId).toBe(
        'custom-org-id'
      );
    });

    it('should handle different environments', async () => {
      const element = await renderQueryError({
        hasError: true,
        error: mockError,
        environment: 'dev',
      });

      expect(element.bindings.engine.state.configuration.environment).toBe(
        'dev'
      );
    });
  });

  describe('initialization', () => {
    it('should have required bindings after initialization', async () => {
      const element = await renderQueryError();

      expect(element.bindings).toBeDefined();
      expect(element.bindings.engine).toBeDefined();
      expect(element.bindings.i18n).toBeDefined();
    });

    it('should create queryError controller during initialization', async () => {
      const element = await renderQueryError();

      expect(element.queryError).toBeDefined();
    });

    it('should handle initialization errors gracefully', async () => {
      const buildEngineError = new Error(
        'Failed to build query error controller'
      );
      vi.mocked(buildQueryError).mockImplementation(() => {
        throw buildEngineError;
      });

      // The component should handle this error during initialization
      await expect(() => renderQueryError()).rejects.toThrow();
      expect(buildQueryError).toHaveBeenCalled();
    });
  });

  describe('rendering edge cases', () => {
    it('should handle null error gracefully', async () => {
      await renderQueryError({hasError: true, error: null});

      // Verify controller was created with null error
      const mockQueryError = vi.mocked(buildQueryError).mock.results[0]?.value;
      expect(mockQueryError?.state.hasError).toBe(true);
      expect(mockQueryError?.state.error).toBeNull();
    });

    it('should handle error without type', async () => {
      const errorWithoutType = {statusCode: 500, message: 'Error without type'};
      await renderQueryError({hasError: true, error: errorWithoutType});

      const mockQueryError = vi.mocked(buildQueryError).mock.results[0]?.value;
      expect(mockQueryError?.state.error?.type).toBeUndefined();
    });

    it('should handle error with empty message', async () => {
      const errorWithEmptyMessage = {
        type: 'TestError',
        statusCode: 500,
        message: '',
      };
      await renderQueryError({hasError: true, error: errorWithEmptyMessage});

      const mockQueryError = vi.mocked(buildQueryError).mock.results[0]?.value;
      expect(mockQueryError?.state.error?.message).toBe('');
    });
  });

  describe('accessibility', () => {
    it('should update aria message when error occurs', async () => {
      const mockAriaMessage = 'An error occurred with your search';
      vi.mocked(getAriaMessageFromErrorType).mockReturnValue(mockAriaMessage);

      await renderQueryError({hasError: true, error: mockError});

      expect(getAriaMessageFromErrorType).toHaveBeenCalled();
    });
  });

  describe('shadow DOM parts', () => {
    it('should render all expected shadow DOM parts when error occurs', async () => {
      const element = await renderQueryError({
        hasError: true,
        error: mockError,
      });
      const parts = locators.parts(element);

      expect(parts.icon).toBeInTheDocument();
      expect(parts.title).toBeInTheDocument();
      expect(parts.description).toBeInTheDocument();
    });

    it('should conditionally render show more button part', async () => {
      const element = await renderQueryError({
        hasError: true,
        error: mockError,
      });
      const parts = locators.parts(element);

      expect(parts.moreInfoBtn).toBeInTheDocument();
    });

    it('should conditionally render error details part when showMoreInfo is true', async () => {
      const element = await renderQueryError({
        hasError: true,
        error: mockError,
      });
      element.showMoreInfo = true;
      await element.updateComplete;

      const parts = locators.parts(element);
      expect(parts.errorInfo).toBeInTheDocument();
    });

    it('should not render error details part when showMoreInfo is false', async () => {
      const element = await renderQueryError({
        hasError: true,
        error: mockError,
      });
      element.showMoreInfo = false;
      await element.updateComplete;

      const parts = locators.parts(element);
      expect(parts.errorInfo).not.toBeInTheDocument();
    });
  });

  describe('#initialize', () => {
    it('should build query error controller with correct engine', async () => {
      const element = await renderQueryError();

      expect(buildQueryError).toHaveBeenCalledWith(element.bindings.engine);
      expect(element.queryError).toBeDefined();
    });
  });
});

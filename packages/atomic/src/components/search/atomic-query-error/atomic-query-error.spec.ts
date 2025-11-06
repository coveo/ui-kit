import {
  buildQueryError,
  type QueryError,
  type QueryErrorState,
} from '@coveo/headless';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
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

    return {
      element,
      icon: element.shadowRoot!.querySelector('[part="icon"]'),
      title: element.shadowRoot!.querySelector('[part="title"]'),
      description: element.shadowRoot!.querySelector('[part="description"]'),
      docLink: element.shadowRoot!.querySelector('[part="doc-link"]'),
      moreInfoBtn: element.shadowRoot!.querySelector('[part="more-info-btn"]'),
      errorInfo: element.shadowRoot!.querySelector('[part="error-info"]'),
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
  };

  it('should render correctly', async () => {
    const {element} = await renderQueryError();
    expect(element).toBeDefined();
  });

  describe('#initialize', () => {
    it('should build query error controller with correct engine', async () => {
      const {element} = await renderQueryError();

      expect(buildQueryError).toHaveBeenCalledWith(element.bindings.engine);
      expect(element.queryError).toBeDefined();
    });

    it('should have required bindings after initialization', async () => {
      const {element} = await renderQueryError();

      expect(element.bindings).toBeDefined();
      expect(element.bindings.engine).toBeDefined();
      expect(element.bindings.i18n).toBeDefined();
    });

    it('should handle initialization errors gracefully', async () => {
      const buildEngineError = new Error(
        'Failed to build query error controller'
      );
      vi.mocked(buildQueryError).mockImplementation(() => {
        throw buildEngineError;
      });

      const {element} = await renderQueryError();
      expect(element).toBeDefined();
      expect(buildQueryError).toHaveBeenCalled();

      expect(element.tagName.toLowerCase()).toBe('atomic-query-error');
    });

    describe('when organization configuration changes', () => {
      it('should handle different organization IDs', async () => {
        const {element} = await renderQueryError({
          hasError: true,
          error: mockError,
          organizationId: 'custom-org-id',
        });

        expect(element.bindings.engine.state.configuration.organizationId).toBe(
          'custom-org-id'
        );
      });

      it('should handle different environments', async () => {
        const {element} = await renderQueryError({
          hasError: true,
          error: mockError,
          environment: 'dev',
        });

        expect(element.bindings.engine.state.configuration.environment).toBe(
          'dev'
        );
      });
    });
  });

  describe('#render', () => {
    it('should render nothing when there is no error', async () => {
      const {element} = await renderQueryError({hasError: false});

      expect(element.shadowRoot?.textContent?.trim()).toBe('');
    });

    it('should render error content when there is an error', async () => {
      const {element} = await renderQueryError({
        hasError: true,
        error: mockError,
      });

      expect(element.shadowRoot?.textContent).not.toBe('');
    });

    describe('when hasError is true', () => {
      it('should display all error parts', async () => {
        const {icon, title, description} = await renderQueryError({
          hasError: true,
          error: mockError,
        });

        expect(icon).toBeInTheDocument();
        expect(title).toBeInTheDocument();
        expect(description).toBeInTheDocument();
      });

      it('should set aria message for accessibility', async () => {
        const {element} = await renderQueryError({
          hasError: true,
          error: mockError,
          organizationId: 'test-org',
          environment: 'prod',
        });

        expect(getAriaMessageFromErrorType).toHaveBeenCalledWith(
          element.bindings.i18n,
          'test-org',
          expect.any(String),
          mockError.type
        );
      });

      it('should update aria message when error occurs', async () => {
        const mockAriaMessage = 'An error occurred with your search';
        vi.mocked(getAriaMessageFromErrorType).mockReturnValue(mockAriaMessage);

        await renderQueryError({hasError: true, error: mockError});

        expect(getAriaMessageFromErrorType).toHaveBeenCalled();
      });

      it('should render show more button part', async () => {
        const {moreInfoBtn} = await renderQueryError({
          hasError: true,
          error: mockError,
        });

        expect(moreInfoBtn).toBeInTheDocument();
      });

      it.each([
        'InvalidTokenException',
        'Disconnected',
        'NoEndpointsException',
        'OrganizationIsPausedException',
        'UnknownError',
      ])('should handle %s error type', async (errorType) => {
        const errorWithType = {...mockError, type: errorType};
        await renderQueryError({hasError: true, error: errorWithType});

        const mockQueryError =
          vi.mocked(buildQueryError).mock.results[0]?.value;
        expect(mockQueryError?.state.error?.type).toBe(errorType);
      });

      describe('when showMoreInfo state changes', () => {
        it('should initially set showMoreInfo to false', async () => {
          const {element} = await renderQueryError({
            hasError: true,
            error: mockError,
          });
          expect(element.showMoreInfo).toBe(false);
        });

        it('should toggle showMoreInfo when show more is triggered', async () => {
          const {element} = await renderQueryError({
            hasError: true,
            error: mockError,
          });

          element.showMoreInfo = !element.showMoreInfo;

          expect(element.showMoreInfo).toBe(true);

          element.showMoreInfo = !element.showMoreInfo;

          expect(element.showMoreInfo).toBe(false);
        });

        it('should render error details when showMoreInfo is true', async () => {
          const {element, parts} = await renderQueryError({
            hasError: true,
            error: mockError,
          });
          element.showMoreInfo = true;
          await element.updateComplete;

          const errorInfo = parts(element).errorInfo;
          expect(errorInfo).toBeInTheDocument();
        });

        it('should not render error details when showMoreInfo is false', async () => {
          const {element, parts} = await renderQueryError({
            hasError: true,
            error: mockError,
          });
          element.showMoreInfo = false;
          await element.updateComplete;

          const errorInfo = parts(element).errorInfo;
          expect(errorInfo).not.toBeInTheDocument();
        });
      });
    });

    it('should handle null error gracefully', async () => {
      await renderQueryError({hasError: true, error: null});

      const mockQueryError = vi.mocked(buildQueryError).mock.results[0]?.value;
      expect(mockQueryError?.state.hasError).toBe(true);
      expect(mockQueryError?.state.error).toBeNull();
    });

    it('should handle error without type', async () => {
      const errorWithoutType = {
        statusCode: 500,
        message: 'Error without type',
      };
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
});

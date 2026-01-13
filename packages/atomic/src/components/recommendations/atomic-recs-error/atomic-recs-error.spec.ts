import type {
  RecommendationEngine,
  RecommendationListState,
} from '@coveo/headless/recommendation';
import {buildRecommendationList} from '@coveo/headless/recommendation';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {renderInAtomicRecsInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/recommendation/atomic-recs-interface-fixture';
import {buildFakeRecommendationList} from '@/vitest-utils/testing-helpers/fixtures/headless/recommendation/recommendation-list-controller';
import type {AtomicRecsError} from './atomic-recs-error';
import './atomic-recs-error';

vi.mock('@coveo/headless/recommendation', {spy: true});
vi.mock('@/src/components/common/query-error/utils', {spy: true});

describe('atomic-recs-error', () => {
  const mockError = {
    type: 'UnknownError',
    statusCode: 500,
    message: 'An error occurred',
  };

  const renderRecsError = async (
    options: {
      error?: {type?: string; statusCode?: number; message?: string} | null;
      organizationId?: string;
      environment?: string;
    } = {}
  ) => {
    const {
      error = null,
      organizationId = 'test-org',
      environment = 'prod',
    } = options;

    const mockedRecommendationList = buildFakeRecommendationList({
      state: {error: error as RecommendationListState['error']},
    });

    vi.mocked(buildRecommendationList).mockReturnValue(
      mockedRecommendationList
    );

    const {element} = await renderInAtomicRecsInterface<AtomicRecsError>({
      template: html`<atomic-recs-error></atomic-recs-error>`,
      selector: 'atomic-recs-error',
      bindings: (bindings) => ({
        ...bindings,
        engine: {
          ...bindings.engine,
          state: {
            configuration: {
              organizationId,
              environment,
              accessToken: 'fake-token',
            },
          },
        } as Partial<RecommendationEngine> as RecommendationEngine,
      }),
    });

    return {
      element,
      icon: element.shadowRoot!.querySelector('[part="icon"]'),
      title: element.shadowRoot!.querySelector('[part="title"]'),
      description: element.shadowRoot!.querySelector('[part="description"]'),
      docLink: element.shadowRoot!.querySelector('[part="doc-link"]'),
      moreInfoBtn: element.shadowRoot!.querySelector('[part="more-info-btn"]'),
      errorInfo: element.shadowRoot!.querySelector('[part="error-info"]'),
      parts: (element: AtomicRecsError) => {
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
    const {element} = await renderRecsError();
    expect(element).toBeDefined();
  });

  describe('#initialize', () => {
    it('should build recommendation list controller with correct engine', async () => {
      const {element} = await renderRecsError();

      expect(buildRecommendationList).toHaveBeenCalledWith(
        element.bindings.engine
      );
      expect(element.recommendationList).toBeDefined();
    });

    it('should have required bindings after initialization', async () => {
      const {element} = await renderRecsError();

      expect(element.bindings).toBeDefined();
      expect(element.bindings.engine).toBeDefined();
      expect(element.bindings.i18n).toBeDefined();
    });

    it('should handle initialization errors gracefully', async () => {
      const buildEngineError = new Error(
        'Failed to build recommendation list controller'
      );
      vi.mocked(buildRecommendationList).mockImplementation(() => {
        throw buildEngineError;
      });

      const {element} = await renderRecsError();
      expect(element).toBeDefined();
      expect(buildRecommendationList).toHaveBeenCalled();

      expect(element.tagName.toLowerCase()).toBe('atomic-recs-error');
    });

    describe('when organization configuration changes', () => {
      it('should handle different organization IDs', async () => {
        const {element} = await renderRecsError({
          error: mockError,
          organizationId: 'custom-org-id',
        });

        expect(element.bindings.engine.state.configuration.organizationId).toBe(
          'custom-org-id'
        );
      });

      it('should handle different environments', async () => {
        const {element} = await renderRecsError({
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
      const {element} = await renderRecsError({error: null});

      expect(element.shadowRoot?.textContent?.trim()).toBe('');
    });

    it('should render error content when there is an error', async () => {
      const {element} = await renderRecsError({
        error: mockError,
      });

      expect(element.shadowRoot?.textContent).not.toBe('');
    });

    describe('when error exists', () => {
      it('should display all error parts', async () => {
        const {icon, title, description} = await renderRecsError({
          error: mockError,
        });

        expect(icon).toBeInTheDocument();
        expect(title).toBeInTheDocument();
        expect(description).toBeInTheDocument();
      });

      it('should render show more button part', async () => {
        const {moreInfoBtn} = await renderRecsError({
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
        await renderRecsError({error: errorWithType});

        const mockRecommendationList = vi.mocked(buildRecommendationList).mock
          .results[0]?.value;
        expect(mockRecommendationList?.state.error?.type).toBe(errorType);
      });

      describe('when showMoreInfo state changes', () => {
        it('should initially set showMoreInfo to false', async () => {
          const {element} = await renderRecsError({
            error: mockError,
          });
          expect(element.showMoreInfo).toBe(false);
        });

        it('should toggle showMoreInfo when show more is triggered', async () => {
          const {element} = await renderRecsError({
            error: mockError,
          });

          element.showMoreInfo = !element.showMoreInfo;

          expect(element.showMoreInfo).toBe(true);

          element.showMoreInfo = !element.showMoreInfo;

          expect(element.showMoreInfo).toBe(false);
        });

        it('should render error details when showMoreInfo is true', async () => {
          const {element, parts} = await renderRecsError({
            error: mockError,
          });
          element.showMoreInfo = true;
          await element.updateComplete;

          const errorInfo = parts(element).errorInfo;
          expect(errorInfo).toBeInTheDocument();
        });

        it('should not render error details when showMoreInfo is false', async () => {
          const {element, parts} = await renderRecsError({
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
      await renderRecsError({error: null});

      const mockRecommendationList = vi.mocked(buildRecommendationList).mock
        .results[0]?.value;
      expect(mockRecommendationList?.state.error).toBeNull();
    });

    it('should handle error without type', async () => {
      const errorWithoutType = {
        statusCode: 500,
        message: 'Error without type',
      };
      await renderRecsError({error: errorWithoutType});

      const mockRecommendationList = vi.mocked(buildRecommendationList).mock
        .results[0]?.value;
      expect(mockRecommendationList?.state.error?.type).toBeUndefined();
    });

    it('should handle error with empty message', async () => {
      const errorWithEmptyMessage = {
        type: 'TestError',
        statusCode: 500,
        message: '',
      };
      await renderRecsError({error: errorWithEmptyMessage});

      const mockRecommendationList = vi.mocked(buildRecommendationList).mock
        .results[0]?.value;
      expect(mockRecommendationList?.state.error?.message).toBe('');
    });
  });
});

import {buildAttachToCase} from '@coveo/headless/insight';
import {html} from 'lit';
import {beforeEach, describe, expect, it, type Mock, vi} from 'vitest';
import {
  buildMockInsightFoldedResult,
  renderInAtomicInsightResult,
} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-result-fixture';
import {buildFakeInsightEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/engine';
import {mockConsole} from '@/vitest-utils/testing-helpers/testing-utils/mock-console';
import type {AtomicInsightResultAttachToCaseIndicator} from './atomic-insight-result-attach-to-case-indicator';
import './atomic-insight-result-attach-to-case-indicator';

vi.mock('@coveo/headless/insight', {spy: true});

describe('atomic-insight-result-attach-to-case-indicator', () => {
  const mockedEngine = buildFakeInsightEngine();
  let mockIsAttached: Mock;
  let mockSubscribe: Mock;

  beforeEach(() => {
    mockConsole();
    mockIsAttached = vi.fn().mockReturnValue(false);
    mockSubscribe = vi.fn().mockImplementation((listener: () => void) => {
      listener();
      return () => {};
    });

    vi.mocked(buildAttachToCase).mockReturnValue({
      isAttached: mockIsAttached,
      attach: vi.fn(),
      detach: vi.fn(),
      subscribe: mockSubscribe,
      state: {results: []},
    });
  });

  const renderIndicator = async ({
    isAttached = false,
    caseId = 'test-case-id',
  }: {
    isAttached?: boolean;
    caseId?: string;
  } = {}) => {
    mockIsAttached.mockReturnValue(isAttached);

    const mockResult = buildMockInsightFoldedResult({
      uniqueId: 'test-result-id',
      title: 'Test Result',
    });

    const engineWithCaseContext = {
      ...mockedEngine,
      state: {
        ...mockedEngine.state,
        insightCaseContext: {
          caseId,
          caseNumber: '12345',
        },
      },
    };

    const {element} =
      await renderInAtomicInsightResult<AtomicInsightResultAttachToCaseIndicator>(
        {
          template: html`<atomic-insight-result-attach-to-case-indicator></atomic-insight-result-attach-to-case-indicator>`,
          selector: 'atomic-insight-result-attach-to-case-indicator',
          result: mockResult,
          bindings: (bindings) => {
            bindings.engine = engineWithCaseContext;
            return bindings;
          },
        }
      );

    return {element};
  };

  describe('when the result is not attached', () => {
    it('should render nothing', async () => {
      const {element} = await renderIndicator({isAttached: false});

      const icon = element.shadowRoot?.querySelector('atomic-icon');
      expect(icon).toBeNull();
    });
  });

  describe('when the result is attached', () => {
    it('should render the attach icon', async () => {
      const {element} = await renderIndicator({isAttached: true});

      const icon = element.shadowRoot?.querySelector('atomic-icon');
      expect(icon).not.toBeNull();
    });

    it('should have the correct part attribute on the icon', async () => {
      const {element} = await renderIndicator({isAttached: true});

      const icon = element.shadowRoot?.querySelector('atomic-icon');
      expect(icon?.getAttribute('part')).toBe('icon');
    });

    it('should have the correct CSS classes on the icon', async () => {
      const {element} = await renderIndicator({isAttached: true});

      const icon = element.shadowRoot?.querySelector('atomic-icon');
      expect(icon?.classList.contains('flex')).toBe(true);
      expect(icon?.classList.contains('w-5')).toBe(true);
      expect(icon?.classList.contains('justify-center')).toBe(true);
    });
  });

  describe('when initializing the controller', () => {
    it('should build the AttachToCase controller with the result and caseId', async () => {
      await renderIndicator({caseId: 'my-case-id'});

      expect(buildAttachToCase).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          options: expect.objectContaining({
            caseId: 'my-case-id',
            result: expect.objectContaining({
              uniqueId: 'test-result-id',
            }),
          }),
        })
      );
    });
  });
});

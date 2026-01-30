import type {AttachToCase, Result} from '@coveo/headless/insight';
import {buildAttachToCase} from '@coveo/headless/insight';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicInsightResult} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-result-fixture';
import {buildFakeInsightEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/engine';
import {buildFakeInsightResult} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/result';
import type {AtomicInsightResultAttachToCaseAction} from './atomic-insight-result-attach-to-case-action';
import './atomic-insight-result-attach-to-case-action';

vi.mock('@coveo/headless/insight', {spy: true});

describe('atomic-insight-result-attach-to-case-action', () => {
  let mockResult: Result;
  let mockAttachToCase: AttachToCase;

  const mockedEngine = buildFakeInsightEngine({
    state: {
      insightCaseContext: {
        caseId: 'test-case-id',
        caseNumber: 'CASE-123',
      },
    },
  });

  const renderComponent = async (
    options: {result?: Result; isAttached?: boolean} = {}
  ) => {
    const resultToUse = options.result ?? mockResult;

    mockAttachToCase = {
      isAttached: vi.fn().mockReturnValue(options.isAttached ?? false),
      attach: vi.fn(),
      detach: vi.fn(),
      subscribe: vi.fn().mockReturnValue(() => {}),
    };

    vi.mocked(buildAttachToCase).mockReturnValue(mockAttachToCase);

    const {element, atomicResult} =
      await renderInAtomicInsightResult<AtomicInsightResultAttachToCaseAction>({
        template: html`<atomic-insight-result-attach-to-case-action></atomic-insight-result-attach-to-case-action>`,
        selector: 'atomic-insight-result-attach-to-case-action',
        result: resultToUse,
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          return bindings;
        },
      });

    await atomicResult.updateComplete;
    await element?.updateComplete;

    return {
      element,
      getButton: () =>
        element?.shadowRoot?.querySelector<HTMLButtonElement>(
          '[part="result-action-button"]'
        ),
      getIcon: () =>
        element?.shadowRoot?.querySelector('[part="result-action-icon"]'),
      getContainer: () =>
        element?.shadowRoot?.querySelector('[part="result-action-container"]'),
    };
  };

  beforeEach(() => {
    mockResult = buildFakeInsightResult({
      raw: {
        permanentid: 'test-permanent-id',
        urihash: 'test-uri-hash',
      },
    });
  });

  describe('when initialized', () => {
    it('should build the attachToCase controller with the correct options', async () => {
      const {element} = await renderComponent();

      expect(buildAttachToCase).toHaveBeenCalledWith(element!.bindings.engine, {
        options: {
          result: mockResult,
          caseId: 'test-case-id',
        },
      });
    });

    it('should create the attachToCase controller', async () => {
      const {element} = await renderComponent();

      expect(element!.attachToCase).toBe(mockAttachToCase);
    });

    it('should use empty string for caseId when insightCaseContext is missing', async () => {
      const engineWithoutCaseContext = buildFakeInsightEngine({
        state: {},
      });

      mockAttachToCase = {
        isAttached: vi.fn().mockReturnValue(false),
        attach: vi.fn(),
        detach: vi.fn(),
        subscribe: vi.fn().mockReturnValue(() => {}),
      };

      vi.mocked(buildAttachToCase).mockReturnValue(mockAttachToCase);

      const {element} =
        await renderInAtomicInsightResult<AtomicInsightResultAttachToCaseAction>(
          {
            template: html`<atomic-insight-result-attach-to-case-action></atomic-insight-result-attach-to-case-action>`,
            selector: 'atomic-insight-result-attach-to-case-action',
            result: mockResult,
            bindings: (bindings) => {
              bindings.engine = engineWithoutCaseContext;
              return bindings;
            },
          }
        );

      await element?.updateComplete;

      expect(buildAttachToCase).toHaveBeenCalledWith(
        element!.bindings.engine,
        expect.objectContaining({
          options: expect.objectContaining({
            caseId: '',
          }),
        })
      );
    });
  });

  describe('when rendering', () => {
    it('should render the button container', async () => {
      const {getContainer} = await renderComponent();

      expect(getContainer()).toBeDefined();
    });

    it('should render the button', async () => {
      const {getButton} = await renderComponent();
      const button = getButton();

      expect(button).toBeDefined();
      expect(button?.getAttribute('part')).toBe('result-action-button');
    });

    it('should render the icon', async () => {
      const {getIcon} = await renderComponent();
      const icon = getIcon();

      expect(icon).toBeDefined();
      expect(icon?.getAttribute('part')).toBe('result-action-icon');
    });
  });

  describe('when the result is not attached', () => {
    it('should display the attach icon', async () => {
      const {getIcon} = await renderComponent({isAttached: false});
      const icon = getIcon();

      expect(icon?.getAttribute('icon')).toContain('<svg');
      expect(icon?.getAttribute('icon')).toContain('<path');
    });

    it('should display the attach tooltip', async () => {
      const {getButton} = await renderComponent({isAttached: false});
      const button = getButton();

      expect(button?.getAttribute('title')).toBe('Attach to case');
    });

    it('should dispatch "atomic/insight/attachToCase/attach" event when clicked', async () => {
      const {element, getButton} = await renderComponent({isAttached: false});
      const eventSpy = vi.fn();
      element?.addEventListener('atomic/insight/attachToCase/attach', eventSpy);

      getButton()?.click();

      expect(eventSpy).toHaveBeenCalledOnce();
      const event = eventSpy.mock.calls[0][0] as CustomEvent;
      expect(event.detail.callback).toBe(mockAttachToCase.attach);
      expect(event.detail.result).toBe(mockResult);
    });
  });

  describe('when the result is attached', () => {
    it('should display the detach icon', async () => {
      const {getIcon} = await renderComponent({isAttached: true});
      const icon = getIcon();

      expect(icon?.getAttribute('icon')).toContain('<svg');
      expect(icon?.getAttribute('icon')).toContain('<path');
    });

    it('should display the detach tooltip', async () => {
      const {getButton} = await renderComponent({isAttached: true});
      const button = getButton();

      expect(button?.getAttribute('title')).toBe('Detach from case');
    });

    it('should dispatch "atomic/insight/attachToCase/detach" event when clicked', async () => {
      const {element, getButton} = await renderComponent({isAttached: true});
      const eventSpy = vi.fn();
      element?.addEventListener('atomic/insight/attachToCase/detach', eventSpy);

      getButton()?.click();

      expect(eventSpy).toHaveBeenCalledOnce();
      const event = eventSpy.mock.calls[0][0] as CustomEvent;
      expect(event.detail.callback).toBe(mockAttachToCase.detach);
      expect(event.detail.result).toBe(mockResult);
    });
  });

  describe('event properties', () => {
    it('should dispatch bubbling events', async () => {
      const {element, getButton} = await renderComponent({isAttached: false});
      const eventSpy = vi.fn();
      element?.addEventListener('atomic/insight/attachToCase/attach', eventSpy);

      getButton()?.click();

      const event = eventSpy.mock.calls[0][0] as CustomEvent;
      expect(event.bubbles).toBe(true);
    });

    it('should dispatch cancelable events', async () => {
      const {element, getButton} = await renderComponent({isAttached: false});
      const eventSpy = vi.fn();
      element?.addEventListener('atomic/insight/attachToCase/attach', eventSpy);

      getButton()?.click();

      const event = eventSpy.mock.calls[0][0] as CustomEvent;
      expect(event.cancelable).toBe(true);
    });

    it('should dispatch composed events', async () => {
      const {element, getButton} = await renderComponent({isAttached: false});
      const eventSpy = vi.fn();
      element?.addEventListener('atomic/insight/attachToCase/attach', eventSpy);

      getButton()?.click();

      const event = eventSpy.mock.calls[0][0] as CustomEvent;
      expect(event.composed).toBe(true);
    });
  });
});

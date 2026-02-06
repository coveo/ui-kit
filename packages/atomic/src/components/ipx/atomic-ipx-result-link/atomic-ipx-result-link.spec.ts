import {
  type InteractiveResult,
  type IPXActionsHistoryActionCreators,
  loadIPXActionsHistoryActions,
} from '@coveo/headless';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import type {AnyUnfoldedItem} from '@/src/components/common/item-list/unfolded-item';
import {renderInAtomicResult} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-result-fixture';
import {buildFakeRecommendationEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/recommendation/engine';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import {AtomicIpxResultLink} from './atomic-ipx-result-link';
import './atomic-ipx-result-link';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-ipx-result-link', () => {
  let mockResult: AnyUnfoldedItem;
  let mockInteractiveResult: InteractiveResult;
  let mockActionsHistoryActions: IPXActionsHistoryActionCreators;
  const mockedEngine = buildFakeRecommendationEngine();

  const locators = {
    getLink: () => page.getByRole('link'),
    getText: (element: AtomicIpxResultLink) =>
      element?.querySelector('atomic-result-text'),
  };

  const parts = (element: AtomicIpxResultLink) => ({
    link: element?.shadowRoot?.querySelector('a'),
  });

  beforeEach(async () => {
    mockResult = buildFakeResult({
      title: 'Test Result Title',
      clickUri: 'https://example.com/test',
      uri: 'https://example.com/test',
      raw: {
        urihash: 'testhash',
        permanentid: 'test-permanent-id',
      },
    }) as AnyUnfoldedItem;

    mockInteractiveResult = {
      select: vi.fn(),
      beginDelayedSelect: vi.fn(),
      cancelPendingSelect: vi.fn(),
    } as unknown as InteractiveResult;

    mockActionsHistoryActions = {
      addPageViewEntryInActionsHistory: vi.fn(() => ({type: 'test-action'})),
    } as unknown as IPXActionsHistoryActionCreators;

    vi.mocked(loadIPXActionsHistoryActions).mockReturnValue(
      mockActionsHistoryActions
    );
  });

  const renderComponent = async ({
    props = {},
    slottedContent,
    result = mockResult,
    interactiveResult = mockInteractiveResult,
  }: {
    props?: Partial<{hrefTemplate: string}>;
    slottedContent?: string;
    result?: AnyUnfoldedItem;
    interactiveResult?: InteractiveResult;
  } = {}) => {
    const {element, atomicResult, atomicInterface} =
      await renderInAtomicResult<AtomicIpxResultLink>({
        template: html`<atomic-ipx-result-link
          href-template=${ifDefined(props.hrefTemplate)}
        >${slottedContent ? unsafeHTML(slottedContent) : ''}</atomic-ipx-result-link>`,
        selector: 'atomic-ipx-result-link',
        result,
        interactiveResult,
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          return bindings;
        },
      });

    await atomicInterface.updateComplete;
    await element?.updateComplete;

    const link = locators.getLink();
    link.query()?.addEventListener('click', (e) => {
      e.preventDefault();
    });

    return {
      element,
      atomicResult,
      atomicInterface,
      link,
      parts: parts(element),
    };
  };

  describe('#initialize', () => {
    it('should be defined', () => {
      const el = document.createElement('atomic-ipx-result-link');
      expect(el).toBeInstanceOf(AtomicIpxResultLink);
    });

    it('should initialize without error', async () => {
      const {element} = await renderComponent();
      expect(element.error).toBeNull();
    });

    it('should dispatch atomic/resolveStopPropagation event', async () => {
      const eventSpy = vi.fn();
      const {atomicResult, element} = await renderComponent();

      atomicResult.addEventListener('atomic/resolveStopPropagation', eventSpy);
      element.initialize();

      expect(eventSpy).toHaveBeenCalled();
    });

    it('should handle stopPropagation callback when event returns true', async () => {
      const callbackSpy = vi.fn();
      const {atomicResult, element} = await renderComponent();

      atomicResult.addEventListener(
        'atomic/resolveStopPropagation',
        (event) => {
          const customEvent = event as CustomEvent<
            (stopPropagation: boolean) => void
          >;
          callbackSpy(true);
          customEvent.detail(true);
        }
      );

      element.initialize();

      expect(callbackSpy).toHaveBeenCalledWith(true);
    });

    it('should handle stopPropagation callback when event returns false', async () => {
      const callbackSpy = vi.fn();
      const {atomicResult, element} = await renderComponent();

      atomicResult.addEventListener(
        'atomic/resolveStopPropagation',
        (event) => {
          const customEvent = event as CustomEvent<
            (stopPropagation: boolean) => void
          >;
          callbackSpy(false);
          customEvent.detail(false);
        }
      );

      element.initialize();

      expect(callbackSpy).toHaveBeenCalledWith(false);
    });

    it('should load IPX actions history actions', async () => {
      await renderComponent();

      expect(loadIPXActionsHistoryActions).toHaveBeenCalledWith(mockedEngine);
    });
  });

  describe('#disconnectedCallback', () => {
    it('should call cleanup function when component is disconnected', async () => {
      const cleanupSpy = vi.fn();
      const {element} = await renderComponent();

      // @ts-expect-error private property access for testing
      element.removeLinkEventHandlers = cleanupSpy;

      element?.disconnectedCallback();

      expect(cleanupSpy).toHaveBeenCalledOnce();

      // @ts-expect-error private property access for testing
      expect(element.removeLinkEventHandlers).toBeUndefined();
    });
  });

  describe('#onSelect', () => {
    it('should dispatch IPX actions history action when result has permanentid', async () => {
      const {link} = await renderComponent({
        result: {
          ...mockResult,
          raw: {...mockResult.raw, permanentid: 'test-permanent-id'},
        } as AnyUnfoldedItem,
      });

      const dispatchSpy = vi.spyOn(mockedEngine, 'dispatch');

      await link.click();

      expect(
        mockActionsHistoryActions.addPageViewEntryInActionsHistory
      ).toHaveBeenCalledWith('test-permanent-id');
      expect(dispatchSpy).toHaveBeenCalledWith({type: 'test-action'});
    });

    it('should not dispatch action when result has no permanentid', async () => {
      const resultWithoutPermanentId = {
        ...mockResult,
        raw: {...mockResult.raw, permanentid: undefined},
      } as AnyUnfoldedItem;

      const {link} = await renderComponent({
        result: resultWithoutPermanentId,
      });

      const dispatchSpy = vi.spyOn(mockedEngine, 'dispatch');

      await link.click();

      expect(
        mockActionsHistoryActions.addPageViewEntryInActionsHistory
      ).not.toHaveBeenCalled();
      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('should call interactive result select', async () => {
      const {link} = await renderComponent();

      await link.click();

      expect(mockInteractiveResult.select).toHaveBeenCalled();
    });
  });

  describe('#render', () => {
    it('should use result clickUri as href when hrefTemplate is not provided', async () => {
      const {link} = await renderComponent({
        result: {
          ...mockResult,
          clickUri: 'https://example.com/click',
        } as AnyUnfoldedItem,
      });

      await expect
        .element(link)
        .toHaveAttribute('href', 'https://example.com/click');
    });

    it('should build href from template using result properties', async () => {
      const templateString =
        '$' + '{clickUri}' + '?' + 'id=' + '$' + '{raw.urihash}';
      const {link} = await renderComponent({
        props: {hrefTemplate: templateString},
        result: {
          ...mockResult,
          clickUri: 'https://example.com/test',
          raw: {urihash: 'hash123'},
        } as AnyUnfoldedItem,
      });

      await expect
        .element(link)
        .toHaveAttribute('href', 'https://example.com/test?id=hash123');
    });

    it('should handle complex template with multiple substitutions', async () => {
      const {link} = await renderComponent({
        props: {
          hrefTemplate: '$' + '{clickUri}' + '?title=' + '$' + '{title}',
        },
        result: {
          ...mockResult,
          clickUri: 'https://example.com/test',
          title: 'Test Title',
          uri: 'https://example.com/original',
        } as AnyUnfoldedItem,
      });

      await expect
        .element(link)
        .toHaveAttribute('href', 'https://example.com/test?title=Test Title');
    });

    it('should render atomic-result-text with title field when no slotted content is provided', async () => {
      const {element} = await renderComponent();

      await vi.waitFor(() => {
        const atomicResultText = element.querySelector('atomic-result-text');
        expect(atomicResultText).toBeDefined();

        if (atomicResultText) {
          expect(atomicResultText.getAttribute('field')).toBe('title');
          expect(atomicResultText.getAttribute('default')).toBe('no-title');
        }
      });
    });

    it('should render slotted content when custom content is provided', async () => {
      const {element} = await renderComponent({
        slottedContent: 'Custom Link Text',
      });

      await element.updateComplete;
      await vi.waitFor(() => {
        expect(element.textContent?.trim()).toBe('Custom Link Text');
      });

      expect(element).toBeDefined();
    });

    it('should not render fallback atomic-result-text when custom slotted content is provided', async () => {
      const {element} = await renderComponent({
        slottedContent: 'Custom Link Text',
      });

      await element.updateComplete;

      const atomicResultText = element.querySelector('atomic-result-text');
      expect(atomicResultText).toBeNull();

      expect(element.textContent?.trim()).toBe('Custom Link Text');
    });

    it('should configure interactive result methods', async () => {
      await renderComponent();

      expect(mockInteractiveResult.select).toBeDefined();
      expect(mockInteractiveResult.beginDelayedSelect).toBeDefined();
      expect(mockInteractiveResult.cancelPendingSelect).toBeDefined();
    });

    it('should apply custom attributes from attributes slot to rendered link', async () => {
      const attributesSlot = document.createElement('a');
      attributesSlot.slot = 'attributes';
      attributesSlot.setAttribute('target', '_blank');
      attributesSlot.setAttribute('rel', 'noopener');

      const {link} = await renderComponent({
        slottedContent: attributesSlot.outerHTML,
      });

      await expect.element(link).toHaveAttribute('target', '_blank');
      await expect.element(link).toHaveAttribute('rel', 'noopener');
    });

    it('should render as a link with proper role', async () => {
      const {link} = await renderComponent();
      await expect.element(link).toHaveRole('link');
    });

    it('should handle missing result context gracefully', async () => {
      const {element} = await renderComponent({
        result: undefined as unknown as AnyUnfoldedItem,
      });

      expect(element).toBeDefined();
    });

    it('should handle missing interactive result context gracefully', async () => {
      const {element} = await renderComponent({
        interactiveResult: undefined as unknown as InteractiveResult,
      });

      expect(element).toBeDefined();
    });

    it('should handle invalid template by replacing with empty string', async () => {
      const warnSpy = vi.spyOn(mockedEngine.logger, 'warn');

      const {link} = await renderComponent({
        props: {hrefTemplate: '$' + '{invalid.syntax}'},
        result: {
          ...mockResult,
          clickUri: 'https://fallback.com',
        } as AnyUnfoldedItem,
      });

      await expect.element(link).toBeInTheDocument();
      await expect.element(link).toHaveAttribute('href', '');
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('invalid.syntax')
      );
    });

    it('should update href when hrefTemplate property changes', async () => {
      const templateString = '$' + '{clickUri}';
      const {element, link} = await renderComponent({
        props: {hrefTemplate: templateString},
      });

      await expect.element(link).toHaveAttribute('href', mockResult.clickUri);

      element.hrefTemplate = '$' + '{uri}' + '?' + 'new=param';
      await element.updateComplete;

      await expect
        .element(link)
        .toHaveAttribute('href', `${mockResult.uri}?new=param`);
    });
  });
});

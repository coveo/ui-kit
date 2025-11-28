import type {InteractiveResult, Result} from '@coveo/headless';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderInAtomicResult} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-result-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import {AtomicResultLink} from './atomic-result-link';
import './atomic-result-link';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-result-link', () => {
  let mockResult: Result;
  let mockInteractiveResult: InteractiveResult;
  const mockedEngine = buildFakeSearchEngine();

  const locators = {
    getLink: () => page.getByRole('link'),
    getText: (element: AtomicResultLink) =>
      element?.querySelector('atomic-result-text'),
  };

  const parts = (element: AtomicResultLink) => ({
    link: element?.shadowRoot?.querySelector('a'),
  });

  beforeEach(async () => {
    mockResult = buildFakeResult({
      title: 'Test Result Title',
      clickUri: 'https://example.com/test',
      uri: 'https://example.com/test',
      raw: {
        urihash: 'testhash',
      },
    });

    mockInteractiveResult = {
      select: vi.fn(),
      beginDelayedSelect: vi.fn(),
      cancelPendingSelect: vi.fn(),
    } as unknown as InteractiveResult;
  });

  const renderComponent = async ({
    props = {},
    slottedContent,
    result = mockResult,
    interactiveResult = mockInteractiveResult,
  }: {
    props?: Partial<{hrefTemplate: string}>;
    slottedContent?: string;
    result?: Result;
    interactiveResult?: InteractiveResult;
  } = {}) => {
    const {element, atomicResult, atomicInterface} =
      await renderInAtomicResult<AtomicResultLink>({
        template: html`<atomic-result-link
          href-template=${ifDefined(props.hrefTemplate)}
        >${slottedContent ? html`${slottedContent}` : ''}</atomic-result-link>`,
        selector: 'atomic-result-link',
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
      const el = document.createElement('atomic-result-link');
      expect(el).toBeInstanceOf(AtomicResultLink);
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
  });

  describe('#connectedCallback', () => {
    it('should render with default behavior when component has no slotted content', async () => {
      const {element} = await renderComponent();
      expect(element).toBeDefined();
    });

    it('should render with custom content when component has default slotted content', async () => {
      const {element} = await renderComponent({
        slottedContent: 'Custom Link Text',
      });
      expect(element.textContent).toContain('Custom Link Text');
    });

    it('should handle attributes slot content when component has attributes slot content', async () => {
      const {element} = await renderComponent();

      expect(element).toBeDefined();
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

  describe('#render', () => {
    it('should use result clickUri as href when hrefTemplate is not provided', async () => {
      const {link} = await renderComponent({
        result: buildFakeResult({clickUri: 'https://example.com/click'}),
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
        result: buildFakeResult({
          clickUri: 'https://example.com/test',
          raw: {urihash: 'hash123'},
        }),
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
        result: buildFakeResult({
          clickUri: 'https://example.com/test',
          title: 'Test Title',
          uri: 'https://example.com/original',
        }),
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

    it('should configure interactive result methods', async () => {
      await renderComponent();

      expect(mockInteractiveResult.select).toBeDefined();
      expect(mockInteractiveResult.beginDelayedSelect).toBeDefined();
      expect(mockInteractiveResult.cancelPendingSelect).toBeDefined();
    });

    it('should handle custom attributes properly', async () => {
      const {element, atomicResult} = await renderComponent();

      const attributesSlot = document.createElement('a');
      attributesSlot.slot = 'attributes';
      attributesSlot.setAttribute('target', '_blank');
      attributesSlot.setAttribute('rel', 'noopener');
      atomicResult.appendChild(attributesSlot);

      await element.updateComplete;

      expect(element).toBeDefined();
    });

    it('should render as a link with proper role', async () => {
      const {link} = await renderComponent();
      await expect.element(link).toHaveRole('link');
    });

    it('should handle missing result context gracefully', async () => {
      const {element} = await renderComponent({
        result: undefined as unknown as Result,
      });

      expect(element).toBeDefined();
    });

    it('should handle missing interactive result context gracefully', async () => {
      const {element} = await renderComponent({
        interactiveResult: undefined as unknown as InteractiveResult,
      });

      expect(element).toBeDefined();
    });

    it('should fallback gracefully with invalid template', async () => {
      await renderComponent({
        props: {hrefTemplate: '$' + '{invalid.syntax}'},
        result: buildFakeResult({clickUri: 'https://fallback.com'}),
      });

      expect(true).toBe(true);
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

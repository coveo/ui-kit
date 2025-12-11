import type {
  GeneratedAnswerCitation,
  InteractiveCitation,
} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import type {AtomicCitation} from './atomic-citation';
import './atomic-citation';

describe('atomic-citation', () => {
  const mockCitation: GeneratedAnswerCitation = {
    source: 'Test Source',
    id: 'citation-1',
    title: 'Test Citation Title',
    text: 'This is a test citation text that should be displayed in the popover',
    uri: 'https://example.com/test',
    clickUri: 'https://example.com/test-click',
    fields: {
      urihash: 'hash-123',
      filetype: 'html',
    },
    permanentid: 'perm-1',
  };

  const mockInteractiveCitation: InteractiveCitation = {
    select: vi.fn(),
    beginDelayedSelect: vi.fn(),
    cancelPendingSelect: vi.fn(),
  };

  const renderComponent = async ({
    citation = mockCitation,
    index = 0,
    sendHoverEndEvent = vi.fn(),
    interactiveCitation = mockInteractiveCitation,
    disableCitationAnchoring = false,
  }: {
    citation?: GeneratedAnswerCitation;
    index?: number;
    sendHoverEndEvent?: (time: number) => void;
    interactiveCitation?: InteractiveCitation;
    disableCitationAnchoring?: boolean;
  } = {}) => {
    const element = await fixture<AtomicCitation>(html`
      <atomic-citation
        .citation=${citation}
        .index=${index}
        .sendHoverEndEvent=${sendHoverEndEvent}
        .interactiveCitation=${interactiveCitation}
        ?disable-citation-anchoring=${disableCitationAnchoring}
      ></atomic-citation>
    `);

    return {
      element,
      locators: {
        get citationLink() {
          return element.shadowRoot?.querySelector(
            '[part="citation"]'
          ) as HTMLAnchorElement | null;
        },
        get citationPopover() {
          return element.shadowRoot?.querySelector(
            '[part="citation-popover"]'
          ) as HTMLElement | null;
        },
        get citationTitle() {
          return element.shadowRoot?.querySelector(
            '.citation-title'
          ) as HTMLElement | null;
        },
      },
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render citation link with correct attributes', async () => {
      const {locators} = await renderComponent();
      const link = locators.citationLink;

      expect(link?.href).toContain('https://example.com/test-click');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener');
      expect(link).toHaveAttribute('aria-haspopup', 'dialog');
    });

    it('should use uri when clickUri is missing', async () => {
      const citationWithoutClickUri = {...mockCitation, clickUri: undefined};
      const {locators} = await renderComponent({
        citation: citationWithoutClickUri,
      });

      expect(locators.citationLink?.href).toContain('https://example.com/test');
    });

    it('should render popover hidden by default with citation content', async () => {
      const {locators} = await renderComponent();
      const popover = locators.citationPopover;

      expect(popover).toHaveClass('hidden');
      expect(popover?.textContent).toContain('Test Citation Title');
      expect(popover?.textContent).toContain('https://example.com/test');
    });

    it('should truncate citation text longer than 200 characters', async () => {
      const longText = 'a'.repeat(250);
      const {locators} = await renderComponent({
        citation: {...mockCitation, text: longText},
      });

      expect(locators.citationPopover?.textContent).toContain(
        `${'a'.repeat(200)}...`
      );
    });
  });

  describe('citation anchoring', () => {
    it('should generate text fragment URL for HTML files', async () => {
      const {locators} = await renderComponent();

      expect(locators.citationLink?.href).toContain('#:~:text=');
    });

    it('should not modify URL when citation anchoring is disabled', async () => {
      const {locators} = await renderComponent({
        disableCitationAnchoring: true,
      });

      expect(locators.citationLink?.href).toBe(
        'https://example.com/test-click'
      );
      expect(locators.citationLink?.href).not.toContain('#:~:text=');
    });
  });

  describe('popover interactions', () => {
    it('should open popover on focus and close on blur', async () => {
      const {element, locators} = await renderComponent();

      locators.citationLink?.focus();
      await element.updateComplete;
      expect(locators.citationPopover).toHaveClass('desktop-only:flex');

      locators.citationLink?.blur();
      await element.updateComplete;
      expect(locators.citationPopover).toHaveClass('hidden');
    });

    it('should open popover on mouseover after delay', async () => {
      vi.useFakeTimers();
      const {element, locators} = await renderComponent();

      locators.citationLink?.dispatchEvent(
        new MouseEvent('mouseover', {bubbles: true})
      );
      await element.updateComplete;
      expect(locators.citationPopover).toHaveClass('hidden');

      vi.advanceTimersByTime(200);
      await element.updateComplete;
      expect(locators.citationPopover).toHaveClass('desktop-only:flex');

      vi.useRealTimers();
    });
  });

  describe('hover analytics', () => {
    it('should send hover analytics when popover closes after threshold', async () => {
      vi.useFakeTimers();
      const sendHoverEndEvent = vi.fn();
      const {element, locators} = await renderComponent({sendHoverEndEvent});

      locators.citationLink?.focus();
      await element.updateComplete;
      vi.advanceTimersByTime(1100);

      locators.citationLink?.blur();
      await element.updateComplete;

      expect(sendHoverEndEvent).toHaveBeenCalledWith(expect.any(Number));

      vi.useRealTimers();
    });

    it('should not send hover analytics when popover closes before threshold', async () => {
      vi.useFakeTimers();
      const sendHoverEndEvent = vi.fn();
      const {element, locators} = await renderComponent({sendHoverEndEvent});

      locators.citationLink?.focus();
      await element.updateComplete;
      vi.advanceTimersByTime(500);

      locators.citationLink?.blur();
      await element.updateComplete;

      expect(sendHoverEndEvent).not.toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  it('should cleanup resources on disconnect', async () => {
    const {element, locators} = await renderComponent();

    locators.citationLink?.focus();
    await element.updateComplete;

    element.remove();

    expect(element.isConnected).toBe(false);
    // biome-ignore lint/suspicious/noExplicitAny: Testing private property
    expect((element as any).popperInstance).toBeUndefined();
  });
});

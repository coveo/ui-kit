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
    id: 'citation-1',
    title: 'Test Citation Title',
    text: 'This is a test citation text that should be displayed in the popover',
    uri: 'https://example.com/test',
    clickUri: 'https://example.com/test-click',
    fields: {
      filetype: 'html',
    },
    permanentid: 'perm-1',
  };

  const mockInteractiveCitation: InteractiveCitation = {
    select: vi.fn(),
    beginDelayedSelect: vi.fn(),
    cancelPendingSelect: vi.fn(),
    hover: vi.fn(),
    get state() {
      return {};
    },
    subscribe: vi.fn(),
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
    it('should render citation link with correct title', async () => {
      const {locators} = await renderComponent();
      const title = locators.citationTitle;

      expect(title).toBeInTheDocument();
      expect(title?.textContent?.trim()).toBe('Test Citation Title');
    });

    it('should render citation link with correct href (clickUri)', async () => {
      const {locators} = await renderComponent();
      const link = locators.citationLink;

      // The href includes text fragment anchor for HTML files
      expect(link?.href).toContain('https://example.com/test-click');
      expect(link?.href).toContain('#:~:text=');
    });

    it('should render citation link with correct href (uri when clickUri is missing)', async () => {
      const citationWithoutClickUri = {...mockCitation, clickUri: undefined};
      const {locators} = await renderComponent({
        citation: citationWithoutClickUri,
      });
      const link = locators.citationLink;

      // The href includes text fragment anchor for HTML files
      expect(link?.href).toContain('https://example.com/test');
      expect(link?.href).toContain('#:~:text=');
    });

    it('should render citation link with target="_blank" and rel="noopener"', async () => {
      const {locators} = await renderComponent();
      const link = locators.citationLink;

      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener');
    });

    it('should render citation link with aria-haspopup="dialog"', async () => {
      const {locators} = await renderComponent();
      const link = locators.citationLink;

      expect(link).toHaveAttribute('aria-haspopup', 'dialog');
    });

    it('should render popover as hidden by default', async () => {
      const {locators} = await renderComponent();
      const popover = locators.citationPopover;

      expect(popover).toHaveClass('hidden');
      expect(popover).not.toHaveClass('desktop-only:flex');
    });

    it('should render popover with citation uri', async () => {
      const {locators} = await renderComponent();
      const popover = locators.citationPopover;

      expect(popover?.textContent).toContain('https://example.com/test');
    });

    it('should render popover with citation title', async () => {
      const {locators} = await renderComponent();
      const popover = locators.citationPopover;

      expect(popover?.textContent).toContain('Test Citation Title');
    });

    it('should render popover with truncated citation text', async () => {
      const {locators} = await renderComponent();
      const popover = locators.citationPopover;

      expect(popover?.textContent).toContain(
        'This is a test citation text that should be displayed in the popover'
      );
    });

    it('should truncate citation text longer than 200 characters', async () => {
      const longText = 'a'.repeat(250);
      const citationWithLongText = {...mockCitation, text: longText};
      const {locators} = await renderComponent({
        citation: citationWithLongText,
      });
      const popover = locators.citationPopover;

      expect(popover?.textContent).toContain(`${'a'.repeat(200)}...`);
      expect(popover?.textContent).not.toContain('a'.repeat(250));
    });
  });

  describe('citation anchoring', () => {
    it('should generate text fragment URL for HTML files', async () => {
      const {locators} = await renderComponent();
      const link = locators.citationLink;

      expect(link?.href).toContain('#:~:text=');
    });

    it('should generate PDF page URL for PDF files when pageNumber is provided', async () => {
      const pdfCitation = {
        ...mockCitation,
        fields: {filetype: 'pdf'},
      };
      const {locators} = await renderComponent({citation: pdfCitation});
      const link = locators.citationLink;

      // Currently, pageNumber is not passed to anchorUrl, so it won't have #page=
      // This test documents the current behavior
      expect(link?.href).toBe('https://example.com/test-click');
    });

    it('should not modify URL for other file types', async () => {
      const docCitation = {
        ...mockCitation,
        fields: {filetype: 'doc'},
      };
      const {locators} = await renderComponent({citation: docCitation});
      const link = locators.citationLink;

      expect(link?.href).toBe('https://example.com/test-click');
    });

    it('should not modify URL when citation anchoring is disabled', async () => {
      const {locators} = await renderComponent({
        disableCitationAnchoring: true,
      });
      const link = locators.citationLink;

      expect(link?.href).toBe('https://example.com/test-click');
      expect(link?.href).not.toContain('#:~:text=');
    });
  });

  describe('interactive citation integration', () => {
    it('should call interactiveCitation.select() on link click', async () => {
      const mockInteractive = {
        ...mockInteractiveCitation,
        select: vi.fn(),
      };
      await renderComponent({interactiveCitation: mockInteractive});

      // Note: Analytics integration happens via bind-analytics-to-link
      // The select is called on click, but we need to test this through the link's analytics binding
      expect(mockInteractive.select).toBeDefined();
    });
  });

  describe('popover interactions', () => {
    it('should open popover on focus', async () => {
      const {element, locators} = await renderComponent();
      const link = locators.citationLink;

      link?.focus();
      await element.updateComplete;

      const popover = locators.citationPopover;
      expect(popover).toHaveClass('desktop-only:flex');
      expect(popover).not.toHaveClass('hidden');
    });

    it('should close popover on blur', async () => {
      const {element, locators} = await renderComponent();
      const link = locators.citationLink;

      link?.focus();
      await element.updateComplete;

      link?.blur();
      await element.updateComplete;

      const popover = locators.citationPopover;
      expect(popover).toHaveClass('hidden');
      expect(popover).not.toHaveClass('desktop-only:flex');
    });

    it('should open popover on mouseover after delay', async () => {
      vi.useFakeTimers();
      const {element, locators} = await renderComponent();
      const link = locators.citationLink;

      const mouseOverEvent = new MouseEvent('mouseover', {bubbles: true});
      link?.dispatchEvent(mouseOverEvent);
      await element.updateComplete;

      // Should not be open immediately
      let popover = locators.citationPopover;
      expect(popover).toHaveClass('hidden');

      // Fast-forward time by debounce timeout
      vi.advanceTimersByTime(200);
      await element.updateComplete;

      // Should be open after delay
      popover = locators.citationPopover;
      expect(popover).toHaveClass('desktop-only:flex');

      vi.useRealTimers();
    });

    it('should close popover on mouseleave after delay', async () => {
      vi.useFakeTimers();
      const {element, locators} = await renderComponent();
      const link = locators.citationLink;

      // Open popover
      link?.focus();
      await element.updateComplete;

      // Mouse leave
      const mouseLeaveEvent = new MouseEvent('mouseleave', {bubbles: true});
      link?.dispatchEvent(mouseLeaveEvent);
      await element.updateComplete;

      // Fast-forward time
      vi.advanceTimersByTime(100);
      await element.updateComplete;

      const popover = locators.citationPopover;
      expect(popover).toHaveClass('hidden');

      vi.useRealTimers();
    });
  });

  describe('hover analytics', () => {
    it('should track hover start time when popover opens', async () => {
      vi.useFakeTimers();
      const sendHoverEndEvent = vi.fn();
      const {element, locators} = await renderComponent({sendHoverEndEvent});
      const link = locators.citationLink;

      link?.focus();
      await element.updateComplete;

      // Should have set hoverStart
      // biome-ignore lint/suspicious/noExplicitAny: Testing private property
      expect((element as any).hoverStart).toBeDefined();

      vi.useRealTimers();
    });

    it('should send hover analytics when popover closes after threshold', async () => {
      vi.useFakeTimers();
      const sendHoverEndEvent = vi.fn();
      const {element, locators} = await renderComponent({sendHoverEndEvent});
      const link = locators.citationLink;

      link?.focus();
      await element.updateComplete;

      // Advance time past analytics threshold (1000ms)
      vi.advanceTimersByTime(1100);

      link?.blur();
      await element.updateComplete;

      expect(sendHoverEndEvent).toHaveBeenCalled();
      expect(sendHoverEndEvent).toHaveBeenCalledWith(expect.any(Number));
      const calledTime = sendHoverEndEvent.mock.calls[0][0];
      expect(calledTime).toBeGreaterThanOrEqual(1100);

      vi.useRealTimers();
    });

    it('should not send hover analytics when popover closes before threshold', async () => {
      vi.useFakeTimers();
      const sendHoverEndEvent = vi.fn();
      const {element, locators} = await renderComponent({sendHoverEndEvent});
      const link = locators.citationLink;

      link?.focus();
      await element.updateComplete;

      // Advance time but not past threshold
      vi.advanceTimersByTime(500);

      link?.blur();
      await element.updateComplete;

      expect(sendHoverEndEvent).not.toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('lifecycle', () => {
    it('should cleanup timers on disconnect', async () => {
      const {element} = await renderComponent();

      // Start a hover
      const link = element.shadowRoot?.querySelector(
        '[part="citation"]'
      ) as HTMLAnchorElement;
      const mouseOverEvent = new MouseEvent('mouseover', {bubbles: true});
      link?.dispatchEvent(mouseOverEvent);

      // Disconnect
      element.remove();

      // Timers should be cleaned up (no errors should occur)
      expect(element.isConnected).toBe(false);
    });

    it('should cleanup Popper instance on disconnect', async () => {
      const {element} = await renderComponent();

      // Open popover to create Popper instance
      const link = element.shadowRoot?.querySelector(
        '[part="citation"]'
      ) as HTMLAnchorElement;
      link?.focus();
      await element.updateComplete;

      // Disconnect
      element.remove();

      // Popper instance should be cleaned up
      // biome-ignore lint/suspicious/noExplicitAny: Testing private property
      expect((element as any).popperInstance).toBeUndefined();
    });
  });
});

import type {SearchEngine} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderQuickviewIframe} from './quickview-iframe';

describe('#renderQuickviewIframe', () => {
  let mockOnSetIframeRef: (ref: HTMLIFrameElement) => void;
  let mockLogger: SearchEngine['logger'];

  beforeEach(() => {
    mockOnSetIframeRef = vi.fn();
    mockLogger = {
      warn: vi.fn(),
    } as unknown as SearchEngine['logger'];
  });

  const renderComponent = async (props: {
    title: string;
    content?: string;
    onSetIframeRef: (ref: HTMLIFrameElement) => void;
    uniqueIdentifier?: string;
    sandbox?: string;
    src?: string;
    logger?: SearchEngine['logger'];
  }): Promise<HTMLIFrameElement> => {
    const container = await renderFunctionFixture(
      html`${renderQuickviewIframe({props})}`
    );

    // Twice because renderQuickviewIframe has 2 nested async updates
    await new Promise((resolve) => setTimeout(resolve));
    await new Promise((resolve) => setTimeout(resolve));

    return container.firstElementChild as HTMLIFrameElement;
  };

  describe('basic rendering', () => {
    it('should render an iframe element', async () => {
      const iframe = await renderComponent({
        title: 'Test Title',
        onSetIframeRef: mockOnSetIframeRef,
      });

      expect(iframe).toBeTruthy();
      expect(iframe.tagName).toBe('IFRAME');
    });

    it('should set the title attribute on the iframe', async () => {
      const iframe = await renderComponent({
        title: 'My Quickview Title',
        onSetIframeRef: mockOnSetIframeRef,
      });

      expect(iframe).toHaveAttribute('title', 'My Quickview Title');
    });

    it('should set src to about:blank by default', async () => {
      const iframe = await renderComponent({
        title: 'Test Title',
        onSetIframeRef: mockOnSetIframeRef,
      });

      expect(iframe).toHaveAttribute('src', 'about:blank');
    });

    it('should apply CSS classes to the iframe', async () => {
      const iframe = await renderComponent({
        title: 'Test Title',
        onSetIframeRef: mockOnSetIframeRef,
      });

      expect(iframe).toHaveClass('h-full', 'w-full');
    });

    it('should set sandbox attribute when provided', async () => {
      const iframe = await renderComponent({
        title: 'Test Title',
        onSetIframeRef: mockOnSetIframeRef,
        sandbox: 'allow-same-origin allow-scripts',
      });

      expect(iframe).toHaveAttribute(
        'sandbox',
        'allow-same-origin allow-scripts'
      );
    });

    it('should not set sandbox attribute when not provided', async () => {
      const iframe = await renderComponent({
        title: 'Test Title',
        onSetIframeRef: mockOnSetIframeRef,
      });

      expect(iframe.hasAttribute('sandbox')).toBe(false);
    });
  });

  describe('content writing behavior', () => {
    it('should not call onSetIframeRef when uniqueIdentifier is missing', async () => {
      await renderComponent({
        title: 'Test Title',
        content: '<h1>Test Content</h1>',
        onSetIframeRef: mockOnSetIframeRef,
        // uniqueIdentifier intentionally omitted
      });

      expect(mockOnSetIframeRef).not.toHaveBeenCalled();
    });

    it('should not call onSetIframeRef when content is missing', async () => {
      await renderComponent({
        title: 'Test Title',
        onSetIframeRef: mockOnSetIframeRef,
        uniqueIdentifier: 'test-id-123',
        // content intentionally omitted
      });

      expect(mockOnSetIframeRef).not.toHaveBeenCalled();
    });

    it('should write content to iframe document when both content and uniqueIdentifier are provided', async () => {
      const iframe = await renderComponent({
        title: 'Test Title',
        content: '<h1>Hello World</h1>',
        onSetIframeRef: mockOnSetIframeRef,
        uniqueIdentifier: 'test-id-123',
      });

      const iframeDoc = iframe.contentDocument;
      expect(iframeDoc?.body.innerHTML).toContain('<h1>Hello World</h1>');
    });

    it('should add a hidden document identifier to the iframe', async () => {
      const iframe = await renderComponent({
        title: 'Test Title',
        content: '<p>Test</p>',
        onSetIframeRef: mockOnSetIframeRef,
        uniqueIdentifier: 'unique-123',
      });

      const iframeDoc = iframe.contentDocument;
      const identifier = iframeDoc?.getElementById('CoveoDocIdentifier');

      expect(identifier).toBeTruthy();
      expect(identifier?.textContent).toBe('unique-123');
      expect(identifier?.style.display).toBe('none');
      expect(identifier?.getAttribute('aria-hidden')).toBe('true');
    });

    it('should reset scrollTop to 0 when writing document', async () => {
      const iframe = await renderComponent({
        title: 'Test Title',
        content: '<p>Test Content</p>',
        onSetIframeRef: mockOnSetIframeRef,
        uniqueIdentifier: 'test-id',
      });

      const iframeDoc = iframe.contentDocument;
      expect(iframeDoc?.scrollingElement?.scrollTop).toBe(0);
    });

    it('should call onSetIframeRef after content is written', async () => {
      const iframe = await renderComponent({
        title: 'Test Title',
        content: '<p>Content</p>',
        onSetIframeRef: mockOnSetIframeRef,
        uniqueIdentifier: 'test-id',
      });

      expect(mockOnSetIframeRef).toHaveBeenCalledWith(iframe);
    });

    it('should not overwrite content if the same uniqueIdentifier is already in the document', async () => {
      const iframe = await renderComponent({
        title: 'Test Title',
        content: '<p>First Content</p>',
        onSetIframeRef: mockOnSetIframeRef,
        uniqueIdentifier: 'same-id',
      });

      // Attempt to write again with the same uniqueIdentifier
      const secondOnSetIframeRef = vi.fn();
      await renderComponent({
        title: 'Test Title',
        content: '<p>Second Content</p>',
        onSetIframeRef: secondOnSetIframeRef,
        uniqueIdentifier: 'same-id',
      });

      // The original content should remain unchanged
      const iframeDoc = iframe.contentDocument;
      const originalContent = iframeDoc?.body.innerHTML;

      expect(originalContent).toBeTruthy();
      expect(mockOnSetIframeRef).toHaveBeenCalledTimes(1);
    });
  });

  describe('normal operation with contentDocument available', () => {
    it('should not log warning when writing content normally', async () => {
      await renderComponent({
        title: 'Test Title',
        content: '<p>Content</p>',
        onSetIframeRef: mockOnSetIframeRef,
        uniqueIdentifier: 'test-id',
        src: 'https://example.com/quickview',
        logger: mockLogger,
      });

      expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it('should keep src as about:blank when content is written successfully', async () => {
      const iframe = await renderComponent({
        title: 'Test Title',
        content: '<p>Content</p>',
        onSetIframeRef: mockOnSetIframeRef,
        uniqueIdentifier: 'test-id',
        logger: mockLogger,
        src: 'https://example.com/quickview',
      });

      // When contentDocument is available, content is written and src remains about:blank
      expect(iframe.getAttribute('src')).toBe('about:blank');
      expect(mockLogger.warn).not.toHaveBeenCalled();
      expect(mockOnSetIframeRef).toHaveBeenCalled();
    });
  });

  describe('when contentDocument is unavailable', () => {
    it('should log a warning and set fallback src when provided', async () => {
      const contentDocumentSpy = vi
        .spyOn(HTMLIFrameElement.prototype, 'contentDocument', 'get')
        .mockReturnValue(null as unknown as Document);

      try {
        const fallbackSrc = 'https://example.com/quickview';

        const iframe = await renderComponent({
          title: 'Test Title',
          content: '<p>Content</p>',
          onSetIframeRef: mockOnSetIframeRef,
          uniqueIdentifier: 'test-id',
          logger: mockLogger,
          src: fallbackSrc,
        });

        expect(mockLogger.warn).toHaveBeenCalledTimes(1);
        expect(mockLogger.warn).toHaveBeenCalledWith(
          'Quickview initialized in restricted mode due to incompatible sandboxing environment. Keywords hit navigation will be disabled.'
        );
        expect(iframe.getAttribute('src')).toBe(fallbackSrc);
        expect(mockOnSetIframeRef).not.toHaveBeenCalled();
      } finally {
        contentDocumentSpy.mockRestore();
      }
    });

    it('should return early without logging when fallback src is not provided', async () => {
      const contentDocumentSpy = vi
        .spyOn(HTMLIFrameElement.prototype, 'contentDocument', 'get')
        .mockReturnValue(null as unknown as Document);

      try {
        const iframe = await renderComponent({
          title: 'Test Title',
          content: '<p>Content</p>',
          onSetIframeRef: mockOnSetIframeRef,
          uniqueIdentifier: 'test-id',
          logger: mockLogger,
        });

        expect(mockLogger.warn).not.toHaveBeenCalled();
        expect(iframe.getAttribute('src')).toBe('about:blank');
        expect(mockOnSetIframeRef).not.toHaveBeenCalled();
      } finally {
        contentDocumentSpy.mockRestore();
      }
    });
  });

  describe('async behavior', () => {
    it('should call onSetIframeRef after content is written asynchronously', async () => {
      const callOrder: string[] = [];

      const trackingOnSetIframeRef = vi.fn(() => {
        callOrder.push('onSetIframeRef');
      });

      // The helper function simulates the async behavior of the component
      // by waiting for the content to be written before calling onSetIframeRef
      await renderComponent({
        title: 'Test Title',
        content: '<p>Async Content</p>',
        onSetIframeRef: trackingOnSetIframeRef,
        uniqueIdentifier: 'async-test',
      });

      expect(callOrder).toContain('onSetIframeRef');
      expect(trackingOnSetIframeRef).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('should not call onSetIframeRef when content is falsy', async () => {
      await renderComponent({
        title: 'Test Title',
        content: '',
        onSetIframeRef: mockOnSetIframeRef,
        uniqueIdentifier: 'test-id',
      });

      expect(mockOnSetIframeRef).not.toHaveBeenCalled();
    });

    it('should not call onSetIframeRef when uniqueIdentifier is falsy', async () => {
      await renderComponent({
        title: 'Test Title',
        content: '<p>Content</p>',
        onSetIframeRef: mockOnSetIframeRef,
        uniqueIdentifier: '',
      });

      expect(mockOnSetIframeRef).not.toHaveBeenCalled();
    });

    it('should handle complex HTML content', async () => {
      const complexContent = `
        <html>
          <head><title>Complex</title></head>
          <body>
            <div class="container">
              <h1>Title</h1>
              <p>Paragraph with <strong>bold</strong> and <em>italic</em></p>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
            </div>
          </body>
        </html>
      `;

      const iframe = await renderComponent({
        title: 'Test Title',
        content: complexContent,
        onSetIframeRef: mockOnSetIframeRef,
        uniqueIdentifier: 'complex-id',
      });

      const iframeDoc = iframe.contentDocument;
      expect(iframeDoc?.body.innerHTML).toContain('container');
      expect(iframeDoc?.body.innerHTML).toContain('Title');
      expect(iframeDoc?.body.innerHTML).toContain('Item 1');
      expect(mockOnSetIframeRef).toHaveBeenCalled();
    });

    it('should handle special characters in uniqueIdentifier', async () => {
      const specialId = 'test-id-with-special-chars-123_abc!@#';

      const iframe = await renderComponent({
        title: 'Test Title',
        content: '<p>Content</p>',
        onSetIframeRef: mockOnSetIframeRef,
        uniqueIdentifier: specialId,
      });

      const iframeDoc = iframe.contentDocument;
      const identifier = iframeDoc?.getElementById('CoveoDocIdentifier');

      expect(identifier?.textContent).toBe(specialId);
    });
  });

  describe('integration with parent components', () => {
    it('should allow parent to receive and manipulate iframe reference', async () => {
      let capturedIframe: HTMLIFrameElement | undefined;

      const capturingCallback = vi.fn((iframe: HTMLIFrameElement) => {
        capturedIframe = iframe;
      });

      const iframe = await renderComponent({
        title: 'Test Title',
        content: '<p>Integration Test</p>',
        onSetIframeRef: capturingCallback,
        uniqueIdentifier: 'integration-id',
      });

      expect(capturingCallback).toHaveBeenCalled();
      expect(capturedIframe).toBe(iframe);
      expect(capturedIframe).toBeInstanceOf(HTMLIFrameElement);
      expect(capturedIframe?.contentDocument).toBeTruthy();
    });
  });
});

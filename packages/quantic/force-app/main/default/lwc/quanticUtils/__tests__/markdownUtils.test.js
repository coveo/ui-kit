// This is the same js file as what we load inside the LWC via a static resource.
import {transformMarkdownToHtml} from 'c/quanticUtils';
import {marked} from 'marked';

const removeLineBreaks = (text) => text.replace(/\n/g, '');

describe('c/markdownUtils', () => {
  describe('transformMarkdownToHtml', () => {
    it('should transform markdown text to HTML', () => {
      const text = 'Hello, world!';
      const result = transformMarkdownToHtml(text, marked);
      expect(removeLineBreaks(result)).toEqual('<p>Hello, world!</p>');
    });

    it('should transform markdown code to HTML <pre><code>', () => {
      const text = '```javascript\nconst foo = "bar";\n```';
      const result = transformMarkdownToHtml(text, marked);
      expect(removeLineBreaks(result)).toEqual(
        '<pre><code>const foo = &quot;bar&quot;;</code></pre>'
      );
    });

    it('should transform markdown heading to HTML <div> with data-level="answer-heading-${level}"', () => {
      const text = '# Hello, world!';
      const result = transformMarkdownToHtml(text, marked);
      expect(removeLineBreaks(result)).toEqual(
        '<div data-level="answer-heading-1" aria-label="Hello, world!">Hello, world!</div>'
      );
    });

    it('should transform markdown heading with formatting to HTML <div>', () => {
      const text = '# **bold** and *emphasized* title';
      const result = transformMarkdownToHtml(text, marked);
      expect(removeLineBreaks(result)).toEqual(
        '<div data-level="answer-heading-1" aria-label="bold and emphasized title"><strong>bold</strong> and <em>emphasized</em> title</div>'
      );
    });

    it('should transform markdown list item to HTML <li>', () => {
      const text = '- Hello, world!';
      const result = transformMarkdownToHtml(text, marked);
      expect(removeLineBreaks(result)).toEqual(
        '<ul><li>Hello, world!</li></ul>'
      );
    });

    it('should transform markdown table to HTML <div class="scrollable-table">', () => {
      const text = '| Header |\n| ------ |\n| Cell   |';
      const result = transformMarkdownToHtml(text, marked);
      expect(removeLineBreaks(result)).toEqual(
        '<div class="scrollable-table"><table><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Cell</td></tr></tbody></table></div>'
      );
    });

    it('should complete unclosed inline elements such as bold, italic, and code', () => {
      const textBold = '**bold';
      const resultBold = transformMarkdownToHtml(textBold, marked);
      expect(removeLineBreaks(resultBold)).toEqual(
        '<p><strong>bold</strong></p>'
      );

      const textItalic = '*italic';
      const resultItalic = transformMarkdownToHtml(textItalic, marked);
      expect(removeLineBreaks(resultItalic)).toEqual('<p><em>italic</em></p>');

      const textCode = '`code';
      const resultCode = transformMarkdownToHtml(textCode, marked);
      expect(removeLineBreaks(resultCode)).toEqual('<p><code>code</code></p>');
    });

    it('should transform markdown link to HTML <a> with data-answer-inline-link attribute', () => {
      const text = '[Google](https://google.com)';
      const result = transformMarkdownToHtml(text, marked);
      expect(removeLineBreaks(result)).toEqual(
        '<p><a href="https://google.com" data-answer-inline-link="true">Google</a></p>'
      );
    });

    it('should transform markdown link with title to HTML <a> with title attribute', () => {
      const text = '[Google](https://google.com "Search Engine")';
      const result = transformMarkdownToHtml(text, marked);
      expect(removeLineBreaks(result)).toEqual(
        '<p><a href="https://google.com" title="Search Engine" data-answer-inline-link="true">Google</a></p>'
      );
    });

    it('should escape special characters in link href', () => {
      const text = '[Link](https://example.com?param="value"&other=test)';
      const result = transformMarkdownToHtml(text, marked);
      expect(removeLineBreaks(result)).toEqual(
        '<p><a href="https://example.com?param=&quot;value&quot;&amp;other=test" data-answer-inline-link="true">Link</a></p>'
      );
    });

    it('should escape special characters in link title', () => {
      const text = '[Link](https://example.com "Title with <script> & quotes")';
      const result = transformMarkdownToHtml(text, marked);
      expect(removeLineBreaks(result)).toEqual(
        '<p><a href="https://example.com" title="Title with &amp;lt;script&amp;gt; &amp;amp; quotes" data-answer-inline-link="true">Link</a></p>'
      );
    });

    it('should render link text as span when href is missing', () => {
      const text = '[Link]()';
      const result = transformMarkdownToHtml(text, marked);
      expect(removeLineBreaks(result)).toEqual('<p><span>Link</span></p>');
    });
  });
});

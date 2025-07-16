import {describe, expect, it} from 'vitest';
import {transformMarkdownToHtml} from './markdown-utils.js';

describe('markdownUtils', () => {
  describe('transformMarkdownToHtml', () => {
    const textVariants = [
      {title: 'text', text: 'content'},
      {title: 'text with spaces', text: 'content with spaces'},
    ];

    const inlineElements = [
      {
        title: 'bold-italic',
        symbol: '***',
        html: '<strong part="answer-strong"><em part="answer-emphasis">{0}</em></strong>',
      },
      {
        title: 'bold',
        symbol: '**',
        html: '<strong part="answer-strong">{0}</strong>',
      },
      {
        title: 'italic',
        symbol: '*',
        html: '<em part="answer-emphasis">{0}</em>',
      },
      {
        title: 'code',
        symbol: '`',
        html: '<code part="answer-inline-code">{0}</code>',
      },
    ];

    const headings = [1, 2, 3, 4, 5, 6].map((level) => ({
      title: `level ${level} heading`,
      level,
      symbol: '#'.repeat(level),
    }));

    const removeLineBreaks = (text: string) => text.replace(/\n/g, '');
    const unindentHtml = (html: string) =>
      html.replace(/\s+</g, '<').replace(/>\s+/g, '>');

    it('should transform bold text', () => {
      const text = '**text**';

      const html = transformMarkdownToHtml(text);

      expect(removeLineBreaks(html)).toBe(
        removeLineBreaks(
          unindentHtml(`
            <p part="answer-paragraph">
              <strong part="answer-strong">text</strong>
            </p>
          `)
        )
      );
    });

    it('should transform italic text', () => {
      const text = '*text*';

      const html = transformMarkdownToHtml(text);

      expect(removeLineBreaks(html)).toBe(
        removeLineBreaks(
          unindentHtml(`
            <p part="answer-paragraph">
              <em part="answer-emphasis">text</em>
            </p>
          `)
        )
      );
    });

    it('should transform inline code', () => {
      const text = '`text`';

      const html = transformMarkdownToHtml(text);

      expect(removeLineBreaks(html)).toBe(
        removeLineBreaks(
          unindentHtml(`
            <p part="answer-paragraph">
              <code part="answer-inline-code">text</code>
            </p>
          `)
        )
      );
    });

    it('should escape HTML in inline code', () => {
      const text = '`<html>`';

      const html = transformMarkdownToHtml(text);

      expect(removeLineBreaks(html)).toBe(
        removeLineBreaks(
          unindentHtml(`
            <p part="answer-paragraph">
              <code part="answer-inline-code">&lt;html&gt;</code>
            </p>
          `)
        )
      );
    });

    it('should transform unordered lists', () => {
      const text = '* item A\n* item B';

      const html = transformMarkdownToHtml(text);

      expect(removeLineBreaks(html)).toBe(
        removeLineBreaks(
          unindentHtml(`
            <ul part="answer-unordered-list">
              <li part="answer-list-item">item A</li>
              <li part="answer-list-item">item B</li>
            </ul>
          `)
        )
      );
    });

    it('should not include paragraphs when unordered list items are separated by an empty line', () => {
      const text = '* item A\n\n* item B';

      const html = transformMarkdownToHtml(text);

      expect(removeLineBreaks(html)).toBe(
        removeLineBreaks(
          unindentHtml(`
            <ul part="answer-unordered-list">
              <li part="answer-list-item">item A</li>
              <li part="answer-list-item">item B</li>
            </ul>
          `)
        )
      );
    });

    it('should transform ordered lists', () => {
      const text = '1. item A\n2. item B';

      const html = transformMarkdownToHtml(text);

      expect(removeLineBreaks(html)).toBe(
        removeLineBreaks(
          unindentHtml(`
            <ol part="answer-ordered-list">
              <li part="answer-list-item">item A</li>
              <li part="answer-list-item">item B</li>
            </ol>
          `)
        )
      );
    });

    it('should not include paragraphs when ordered list items are separated by an empty line', () => {
      const text = '1. item A\n\n2. item B';

      const html = transformMarkdownToHtml(text);

      expect(removeLineBreaks(html)).toBe(
        removeLineBreaks(
          unindentHtml(`
            <ol part="answer-ordered-list">
              <li part="answer-list-item">item A</li>
              <li part="answer-list-item">item B</li>
            </ol>
          `)
        )
      );
    });

    it('should transform code blocks', () => {
      const text = '```\ntext\n```';

      const html = transformMarkdownToHtml(text);

      expect(removeLineBreaks(html)).toBe(
        removeLineBreaks(
          unindentHtml(`
            <pre part="answer-code-block">
              <code>text</code>
            </pre>
          `)
        )
      );
    });

    it('should transform quote blocks', () => {
      const text = '> text';

      const html = transformMarkdownToHtml(text);

      expect(removeLineBreaks(html)).toBe(
        removeLineBreaks(
          unindentHtml(`
            <blockquote part="answer-quote-block">
              <p part="answer-paragraph">text</p>
            </blockquote>
          `)
        )
      );
    });

    describe('tables', () => {
      it('should transform tables', () => {
        const text = '| Col A | Col B |\n| --- | --- |\n| A | B |';

        const html = transformMarkdownToHtml(text);

        expect(removeLineBreaks(html)).toBe(
          removeLineBreaks(
            unindentHtml(`
              <div part="answer-table-container" class="scrollable-table">
                <table part="answer-table">
                  <thead>
                    <tr>
                      <th part="answer-table-header">Col A</th>
                      <th part="answer-table-header">Col B</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td part="answer-table-content">A</td>
                      <td part="answer-table-content">B</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            `)
          )
        );
      });

      it('should escape HTML in table cell', () => {
        const text = '| Example |\n| --- |\n| <html> |';

        const html = transformMarkdownToHtml(text);

        expect(removeLineBreaks(html)).toBe(
          removeLineBreaks(
            unindentHtml(`
              <div part="answer-table-container" class="scrollable-table">
                <table part="answer-table">
                  <thead>
                    <tr>
                      <th part="answer-table-header">Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td part="answer-table-content">&lt;html&gt;</td>
                    </tr>
                  </tbody>
                </table>
              </div>`)
          )
        );
      });

      it('should keep HTML from Markdown formatting', () => {
        const text = '| Example |\n| --- |\n| **bold text** |';

        const html = transformMarkdownToHtml(text);

        expect(removeLineBreaks(html)).toBe(
          removeLineBreaks(
            unindentHtml(`
              <div part="answer-table-container" class="scrollable-table">
                <table part="answer-table">
                  <thead>
                    <tr>
                      <th part="answer-table-header">Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td part="answer-table-content">
                        <strong part="answer-strong">bold text</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            `)
          )
        );
      });
    });

    describe('headings', () => {
      headings.map((heading) => {
        it(`should transform ${heading.title}`, () => {
          const text = `${heading.symbol} title`;

          const html = transformMarkdownToHtml(text);

          expect(removeLineBreaks(html)).toBe(
            `<div part="answer-heading-${heading.level}" aria-label="title">title</div>`
          );
        });
      });

      it('should transform formatted heading', () => {
        const text = '# **bold** *emphasized* with `code` title';

        const html = transformMarkdownToHtml(text);

        expect(removeLineBreaks(html)).toBe(
          '<div part="answer-heading-1" aria-label="bold emphasized with code title"><strong part="answer-strong">bold</strong> <em part="answer-emphasis">emphasized</em> with <code part="answer-inline-code">code</code> title</div>'
        );
      });

      it('should transform heading with nested formatting', () => {
        const text = '# ***bold** emphasized with `code`* title';

        const html = transformMarkdownToHtml(text);

        expect(removeLineBreaks(html)).toBe(
          '<div part="answer-heading-1" aria-label="bold emphasized with code title"><em part="answer-emphasis"><strong part="answer-strong">bold</strong> emphasized with <code part="answer-inline-code">code</code></em> title</div>'
        );
      });
    });

    describe('with unclosed inline elements in text', () => {
      inlineElements.map((inlineElement) => {
        textVariants.map((textVariant) => {
          it(`should complete ${inlineElement.title} element for ${textVariant.title}`, () => {
            const text = `some incomplete ${inlineElement.symbol}${textVariant.text}`;

            const html = transformMarkdownToHtml(text);

            expect(removeLineBreaks(html)).toBe(
              `<p part="answer-paragraph">some incomplete ${inlineElement.html.replace('{0}', textVariant.text)}</p>`
            );
          });
        });
      });
    });

    describe('with unclosed inline elements in list items', () => {
      inlineElements.map((inlineElement) => {
        textVariants.map((textVariant) => {
          it(`should complete ${inlineElement.title} element for ${textVariant.title}`, () => {
            const text = `1. item A\n2. ${inlineElement.symbol}${textVariant.text}`;

            const html = transformMarkdownToHtml(text);

            expect(removeLineBreaks(html)).toBe(
              removeLineBreaks(
                unindentHtml(`
                  <ol part="answer-ordered-list">
                    <li part="answer-list-item">item A</li>
                    <li part="answer-list-item">${inlineElement.html.replace('{0}', textVariant.text)}</li>
                  </ol>
                `)
              )
            );
          });
        });
      });
    });

    describe('with escaped unclosed inline elements', () => {
      inlineElements.map((inlineElement) => {
        it(`should not complete ${inlineElement.title} element`, () => {
          const text = `text with ${inlineElement.symbol} that is not transformed`;

          const html = transformMarkdownToHtml(text);

          expect(removeLineBreaks(html)).toBe(
            `<p part="answer-paragraph">${text}</p>`
          );
        });
      });
    });

    describe('with nested inline elements', () => {
      it('should parse text correctly', () => {
        const text =
          'text with **bold text having *italic* and `code` nested elements**';

        const html = transformMarkdownToHtml(text);

        expect(removeLineBreaks(html)).toBe(
          removeLineBreaks(
            '<p part="answer-paragraph">text with <strong part="answer-strong">bold text having <em part="answer-emphasis">italic</em> and <code part="answer-inline-code">code</code> nested elements</strong></p>'
          )
        );
      });
    });
  });
});

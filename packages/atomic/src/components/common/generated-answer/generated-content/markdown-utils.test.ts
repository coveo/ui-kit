import {transformMarkdownToHtml} from './markdown-utils';

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
        html: '<strong><em>{0}</em></strong>',
      },
      {title: 'bold', symbol: '**', html: '<strong>{0}</strong>'},
      {title: 'italic', symbol: '*', html: '<em>{0}</em>'},
      {title: 'code', symbol: '`', html: '<code>{0}</code>'},
    ];

    const removeLineBreaks = (text: string) => text.replace(/\n/g, '');
    const unindentHtml = (html: string) =>
      html.replace(/\s+</g, '<').replace(/>\s+/g, '>');

    it('should transform headings', () => {
      const text = '# title';

      const html = transformMarkdownToHtml(text);

      expect(removeLineBreaks(html)).toBe('<h1>title</h1>');
    });

    it('should transform bold text', () => {
      const text = '**text**';

      const html = transformMarkdownToHtml(text);

      expect(removeLineBreaks(html)).toBe('<p><strong>text</strong></p>');
    });

    it('should transform italic text', () => {
      const text = '*text*';

      const html = transformMarkdownToHtml(text);

      expect(removeLineBreaks(html)).toBe('<p><em>text</em></p>');
    });

    it('should transform inline code', () => {
      const text = '`text`';

      const html = transformMarkdownToHtml(text);

      expect(removeLineBreaks(html)).toBe('<p><code>text</code></p>');
    });

    it('should transform unordered lists', () => {
      const text = '* item A\n* item B';

      const html = transformMarkdownToHtml(text);

      expect(removeLineBreaks(html)).toBe(
        '<ul><li>item A</li><li>item B</li></ul>'
      );
    });

    it('should not include paragraphs when unordered list items are separated by an empty line', () => {
      const text = '* item A\n\n* item B';

      const html = transformMarkdownToHtml(text);

      expect(removeLineBreaks(html)).toBe(
        '<ul><li>item A</li><li>item B</li></ul>'
      );
    });

    it('should transform ordered lists', () => {
      const text = '1. item A\n2. item B';

      const html = transformMarkdownToHtml(text);

      expect(removeLineBreaks(html)).toBe(
        '<ol><li>item A</li><li>item B</li></ol>'
      );
    });

    it('should not include paragraphs when ordered list items are separated by an empty line', () => {
      const text = '1. item A\n\n2. item B';

      const html = transformMarkdownToHtml(text);

      expect(removeLineBreaks(html)).toBe(
        '<ol><li>item A</li><li>item B</li></ol>'
      );
    });

    it('should transform code blocks', () => {
      const text = '```\ntext\n```';

      const html = transformMarkdownToHtml(text);

      expect(removeLineBreaks(html)).toBe('<pre><code>text</code></pre>');
    });

    it('should transform quote blocks', () => {
      const text = '> text';

      const html = transformMarkdownToHtml(text);

      expect(removeLineBreaks(html)).toBe(
        '<blockquote><p>text</p></blockquote>'
      );
    });

    it('should transform tables', () => {
      const text = '| Col A | Col B |\n| --- | --- |\n| A | B |';

      const html = transformMarkdownToHtml(text);

      expect(removeLineBreaks(html)).toBe(
        removeLineBreaks(
          unindentHtml(`
            <div class="scrollable-table">
              <table>
                <thead>
                  <tr>
                    <th>Col A</th>
                    <th>Col B</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>A</td>
                    <td>B</td>
                  </tr>
                </tbody>
              </table>
            </div>
          `)
        )
      );
    });

    describe('with unclosed inline elements in text', () => {
      inlineElements.map((inlineElement) => {
        textVariants.map((textVariant) => {
          it(`should complete ${inlineElement.title} element for ${textVariant.title}`, () => {
            const text = `some incomplete ${inlineElement.symbol}${textVariant.text}`;

            const html = transformMarkdownToHtml(text);

            expect(removeLineBreaks(html)).toBe(
              `<p>some incomplete ${inlineElement.html.replace('{0}', textVariant.text)}</p>`
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
                  <ol>
                    <li>item A</li>
                    <li>${inlineElement.html.replace('{0}', textVariant.text)}</li>
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

          expect(removeLineBreaks(html)).toBe(`<p>${text}</p>`);
        });
      });
    });

    describe('with nested inline elements', () => {
      it('should parse text correctly', () => {
        const text =
          'text with **bold text having *italic* and `code` nested elements**';

        const html = transformMarkdownToHtml(text);

        expect(removeLineBreaks(html)).toBe(
          '<p>text with <strong>bold text having <em>italic</em> and <code>code</code> nested elements</strong></p>'
        );
      });
    });
  });
});

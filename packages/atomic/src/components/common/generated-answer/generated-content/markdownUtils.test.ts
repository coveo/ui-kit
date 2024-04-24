import {transformMarkdownToHtml} from './markdownUtils';

describe('markdownUtils', () => {
  describe('transformMarkdownToHtml', () => {
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
      it('should complete bold element', () => {
        const text = 'some incomplete **content';

        const html = transformMarkdownToHtml(text);

        expect(removeLineBreaks(html)).toBe(
          '<p>some incomplete <strong>content</strong></p>'
        );
      });

      it('should complete italic element', () => {
        const text = 'some incomplete *content';

        const html = transformMarkdownToHtml(text);

        expect(removeLineBreaks(html)).toBe(
          '<p>some incomplete <em>content</em></p>'
        );
      });

      it('should complete bold-italic element', () => {
        const text = 'some incomplete ***content';

        const html = transformMarkdownToHtml(text);

        expect(removeLineBreaks(html)).toBe(
          '<p>some incomplete <strong><em>content</em></strong></p>'
        );
      });

      it('should complete code element', () => {
        const text = 'some incomplete `content';

        const html = transformMarkdownToHtml(text);

        expect(removeLineBreaks(html)).toBe(
          '<p>some incomplete <code>content</code></p>'
        );
      });
    });

    describe('with unclosed inline elements in list items', () => {
      it('should complete bold element', () => {
        const text = '1. item A\n2. **item';

        const html = transformMarkdownToHtml(text);

        expect(removeLineBreaks(html)).toBe(
          removeLineBreaks(
            unindentHtml(`
              <ol>
                <li>item A</li>
                <li><strong>item</strong></li>
              </ol>
            `)
          )
        );
      });

      it('should complete italic element', () => {
        const text = '1. item A\n2. *item';

        const html = transformMarkdownToHtml(text);

        expect(removeLineBreaks(html)).toBe(
          removeLineBreaks(
            unindentHtml(`
              <ol>
                <li>item A</li>
                <li><em>item</em></li>
              </ol>
            `)
          )
        );
      });

      it('should complete bold-italic element', () => {
        const text = '1. item A\n2. ***item';

        const html = transformMarkdownToHtml(text);

        expect(removeLineBreaks(html)).toBe(
          removeLineBreaks(
            unindentHtml(`
              <ol>
                <li>item A</li>
                <li><strong><em>item</em></strong></li>
              </ol>
            `)
          )
        );
      });

      it('should complete code element', () => {
        const text = '1. item A\n2. `item';

        const html = transformMarkdownToHtml(text);

        expect(removeLineBreaks(html)).toBe(
          removeLineBreaks(
            unindentHtml(`
              <ol>
                <li>item A</li>
                <li><code>item</code></li>
              </ol>
            `)
          )
        );
      });
    });

    describe('with escaped unclosed inline elements', () => {
      const inlineElementTests = [
        {title: 'italic', symbol: '*'},
        {title: 'bold', symbol: '**'},
        {title: 'bold-italic', symbol: '***'},
        {title: 'code', symbol: '`'},
      ];

      test.each(inlineElementTests)(
        'should not complete %i element',
        (testCase) => {
          const text = `text with ${testCase.symbol} that is not transformed`;

          const html = transformMarkdownToHtml(text);

          expect(removeLineBreaks(html)).toBe(`<p>${text}</p>`);
        }
      );
    });
  });
});

import {marked} from 'marked';

const unclosedElement = /(\*{1,3}|`)($|\w[\w\s]*$)/;

const completeUnclosedElement = (text: string) => {
  const match = unclosedElement.exec(text);
  if (match) {
    const symbol = match[1];

    const replacements: Record<string, string> = {
      '***': '<strong><em>$2</em></strong>',
      '**': '<strong>$2</strong>',
      '*': '<em>$2</em>',
      '`': '<code>$2</code>',
    };

    return text.replace(unclosedElement, replacements[symbol]);
  }

  return text;
};

const customRenderer = {
  /**
   * Custom Marked renderer to remove wrapping `<p>` element around list item content.
   * @param text The element text content.
   * @returns The list item element to render.
   */
  listitem(text: string) {
    const unwrappedText = text.replace(/^<p>/, '').replace(/<\/p>\n?$/, '');
    const withClosedElement = completeUnclosedElement(unwrappedText);
    return `<li>${withClosedElement}</li>`;
  },

  /**
   * Custom Marked renderer to wrap `<table>` element in a scrolling container.
   * @param header The table header content.
   * @param body The table body content.
   * @returns The element to render.
   */
  table(header: string, body: string) {
    return `<div class="scrollable-table"><table><thead>${header}</thead><tbody>${body}</tbody></table></div>`;
  },

  /**
   * Custom Marked renderer to complete unclosed inline elements such as bold, italic, and code.
   * @param text The text content.
   * @returns The corrected text content.
   */
  text(text: string) {
    return completeUnclosedElement(text);
  },
};

export const transformMarkdownToHtml = (text: string): string => {
  return marked.use({renderer: customRenderer}).parse(text) as string;
};

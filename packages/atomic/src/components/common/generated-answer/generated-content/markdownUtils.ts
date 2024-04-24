import {marked} from 'marked';

const unclosedItalic = /(?:\*)([\w\s]*)$/;
const unclosedStrong = /(?:\*{2})([\w\s]*)$/;
const unclosedStrongItalic = /(?:\*{3})([\w\s]*)$/;
const unclosedCode = /(?:`)([\w\s]*)$/;

const completeUnclosedElement = (text: string) => {
  if (unclosedStrongItalic.test(text)) {
    return text.replace(unclosedStrongItalic, '<strong><em>$1</em></strong>');
  }
  if (unclosedStrong.test(text)) {
    return text.replace(unclosedStrong, '<strong>$1</strong>');
  }
  if (unclosedItalic.test(text)) {
    return text.replace(unclosedItalic, '<em>$1</em>');
  }
  if (unclosedCode.test(text)) {
    return text.replace(unclosedCode, '<code>$1</code>');
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

const unclosedElement = /(\*{1,3}|`)($|\w[\w\s]*$)/;

/**
 * complete unclosed markdown elements in a string
 * @param {string} text
 * @returns {string}
 */
const completeUnclosedElement = (text) => {
  const match = unclosedElement.exec(text);
  if (match) {
    const symbol = match[1];

    const replacements = {
      '***': '<strong><em part="answer-emphasis">$2</em></strong>',
      '**': '<strong>$2</strong>',
      '*': '<em>$2</em>',
      '`': '<code>$2</code>',
    };

    return text.replace(unclosedElement, replacements[symbol]);
  }

  return text;
};

const escapeHtml = (text) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const customRenderer = {
  code(code) {
    return `<pre><code>${escapeHtml(code)}</code></pre>`;
  },

  /**
   * @param {string} text
   * @param {string} level
   */
  heading(text, level) {
    return `<div data-level="answer-heading-${level}" aria-label="${text}">${text}</div>`;
  },

  /**
   * Custom Marked renderer to remove wrapping `<p>` element around list item content.
   * @param {string} text The element text content.
   * @returns {string} The list item element to render.
   */
  listitem(text) {
    const unwrappedText = text.replace(/^<p[^>]*>/, '').replace(/<\/p>\n?/, '');
    const withClosedElement = completeUnclosedElement(unwrappedText);
    return `<li>${withClosedElement}</li>`;
  },

  /**
   * Custom Marked renderer to wrap `<table>` element in a scrolling container.
   * @param {string} header The table header content.
   * @param {string} body The table body content.
   * @returns {string} The element to render.
   */
  table(header, body) {
    return `<div class="scrollable-table"><table><thead>${header}</thead><tbody>${body}</tbody></table></div>`;
  },

  /**
   * Custom Marked renderer to complete unclosed inline elements such as bold, italic, and code.
   * @param {string} text The text content.
   * @returns {string} The corrected text content.
   */
  text(text) {
    return completeUnclosedElement(text);
  },
};

/**
 * Transform markdown text to HTML
 * @param {string} text
 * @param {object} marked The marked library object
 * @returns {string} HTML text corresponding to markdown
 */
export const transformMarkdownToHtml = (text, marked) => {
  marked.use({renderer: customRenderer});
  return marked.parse(text);
};

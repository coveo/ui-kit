import {marked} from 'marked';

const toInlinePlainText = (textWithHtml: string): string => {
  const withoutHtmlTags = textWithHtml.replace(/<[^>]*>/g, ' ');
  const withCollapsedWhitespaces = withoutHtmlTags.replace(/\s{2,}/g, ' ');

  return withCollapsedWhitespaces.trim();
};

const unclosedElement = /(\*{1,3}|`)($|\w[\w\s]*$)/;

const completeUnclosedElement = (text: string) => {
  const match = unclosedElement.exec(text);
  if (match) {
    const symbol = match[1];

    const replacements: Record<string, string> = {
      '***':
        '<strong part="answer-strong"><em part="answer-emphasis">$2</em></strong>',
      '**': '<strong part="answer-strong">$2</strong>',
      '*': '<em part="answer-emphasis">$2</em>',
      '`': '<code part="answer-inline-code">$2</code>',
    };

    return text.replace(unclosedElement, replacements[symbol]);
  }

  return text;
};

const escapeHtml = (text: string) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const customRenderer = {
  blockquote(quote: string) {
    return `<blockquote part="answer-quote-block">${quote}</blockquote>`;
  },

  code(code: string) {
    return `<pre part="answer-code-block"><code>${escapeHtml(code)}</code></pre>`;
  },

  codespan(text: string) {
    return `<code part="answer-inline-code">${text}</code>`;
  },

  em(text: string) {
    return `<em part="answer-emphasis">${text}</em>`;
  },

  heading(text: string, level: number) {
    const plainText = toInlinePlainText(text);

    return `<div part="answer-heading-${level}" aria-label="${plainText}">${text}</div>`;
  },

  html(text: string) {
    return escapeHtml(text);
  },

  list(body: string, ordered: boolean, start: number | '') {
    const type = ordered ? 'ol' : 'ul';
    const part = ordered ? 'answer-ordered-list' : 'answer-unordered-list';

    const tag =
      ordered && start !== 1
        ? `<${type} part="${part}" start="${start}">`
        : `<${type} part="${part}">`;

    return `${tag}${body}</${type}>`;
  },

  /**
   * Custom Marked renderer to remove wrapping `<p>` element around list item content.
   * @param text The element text content.
   * @returns The list item element to render.
   */
  listitem(text: string) {
    const unwrappedText = text
      .replace(/^<p[^>]*>/, '')
      .replace(/<\/p>\n?$/, '');
    const withClosedElement = completeUnclosedElement(unwrappedText);
    return `<li part="answer-list-item">${withClosedElement}</li>`;
  },

  paragraph(text: string) {
    return `<p part="answer-paragraph">${text}</p>`;
  },

  strong(text: string) {
    return `<strong part="answer-strong">${text}</strong>`;
  },

  /**
   * Custom Marked renderer to wrap `<table>` element in a scrolling container.
   * @param header The table header content.
   * @param body The table body content.
   * @returns The element to render.
   */
  table(header: string, body: string) {
    return `<div part="answer-table-container" class="scrollable-table"><table part="answer-table"><thead>${header}</thead><tbody>${body}</tbody></table></div>`;
  },

  tablecell(
    content: string,
    flags: {header: boolean; align: 'center' | 'left' | 'right' | null}
  ) {
    const type = flags.header ? 'th' : 'td';
    const part = flags.header ? 'answer-table-header' : 'answer-table-content';
    const tag = flags.align
      ? `<${type} part="${part}" align="${flags.align}">`
      : `<${type} part="${part}">`;

    return `${tag}${content}</${type}>`;
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

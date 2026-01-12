import type {PageEvent, RouterTarget} from 'typedoc';

let BLOCK_COUNTER = 0;
const CODE_BLOCK_REGEX =
  /<pre\b[^>]*>[\s\S]*?<code\b[^>]*>[\s\S]*?<\/code>[\s\S]*?<\/pre>/gi;

const CALLOUT_IN_TEXT_REGEX = /\/\/\s*callout\[((?:.|\n)*?)\]/i;
const FALLBACK_CALLOUT_HTML_REGEX =
  /(^|[^:])\/\/(?:\s|<[^>]+>)*callout\[(?:.|\n)*?\]/gi;

// ---------- Helpers (all arrow functions) ----------

const stripAllTags = (html: string): string => {
  let prev: string;
  do {
    prev = html;
    html = html.replace(/<[^>]+>/g, '');
  } while (html !== prev);
  return html;
};

const stripSpanWrappers = (html: string): string =>
  html.replace(/<\/?span\b[^>]*>/gi, '');

const decodeEntities = (s: string): string =>
  s
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&amp;/gi, '&');

const escapeAttr = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

/**
 * Allow only <a> tags; strip everything else.
 * For <a>, keep only safe href (http/https/mailto/#/relative). Remove other attrs.
 */
const sanitizeCalloutHtml = (input: string): string => {
  const decoded = decodeEntities(input);

  // Protect <a ...> and </a> tokens so we can strip everything else safely.
  const anchors: string[] = [];
  const protectedText = decoded.replace(/<\/?a\b[^>]*>/gi, (tag) => {
    const idx = anchors.length;
    anchors.push(tag);
    return `__ANCHOR_${idx}__`;
  });

  // Strip all other tags.
  let stripped = protectedText;
  let prevStripped: string;
  do {
    prevStripped = stripped;
    stripped = stripped.replace(/<[^>]+>/g, '');
  } while (stripped !== prevStripped);

  // Restore anchors, but sanitize opening <a> tags to only allow safe href.
  const restored = stripped.replace(/__ANCHOR_(\d+)__/g, (_m, nStr) => {
    const tag = anchors[Number(nStr)];
    if (!tag) return '';

    if (/^<\/a/i.test(tag)) return '</a>';

    const hrefMatch = tag.match(
      /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i
    );
    const href = (
      hrefMatch?.[1] ??
      hrefMatch?.[2] ??
      hrefMatch?.[3] ??
      ''
    ).trim();

    const isSafe =
      /^https?:\/\//i.test(href) ||
      /^mailto:/i.test(href) ||
      /^#/i.test(href) ||
      /^\.{0,2}\//.test(href);

    if (!href || !isSafe) return '';

    return `<a href="${escapeAttr(href)}" rel="noopener noreferrer">`;
  });

  return restored.trim();
};

const formatCalloutDisplay = (id: string) => {
  const width = id.length === 1 ? 16 : 32;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='16' viewBox='0 0 ${width} 16'>
    <circle cx='${width / 2}' cy='8' r='${width / 2}' stroke='black' stroke-width='1' fill='white'/>
    <text x='${width / 2}' y='9' text-anchor='middle' dominant-baseline='middle' font-family='sans-serif' font-size='14' font-weight='600' fill='black'>${id}</text>
  </svg>`;
  const src = `data:image/svg+xml;utf8,${svg}`;
  return `<a class="code-callout-ref" data-callout="${id}" href="#code-callout-${BLOCK_COUNTER}-${id}"> <img src="${src}" /> </a>`;
};

const processCodeInnerHtml = (codeInner: string) => {
  const callouts: string[] = [];

  let fallbackInner = codeInner;
  let hasIncrementedBlockCounter = false;
  fallbackInner = fallbackInner.replace(
    FALLBACK_CALLOUT_HTML_REGEX,
    (m: string, prefix: string) => {
      const normalized = decodeEntities(stripSpanWrappers(m));
      const plain = stripAllTags(normalized);

      const mm = plain.match(CALLOUT_IN_TEXT_REGEX);
      if (!mm) return m;

      const normalizedMatch = normalized.match(
        /\/\/\s*callout\[((?:.|\n)*?)\]/i
      );
      const payloadHtml = normalizedMatch?.[1] ?? '';
      const sanitized = sanitizeCalloutHtml(payloadHtml);

      if (sanitized.length === 0) return prefix;

      // Only incremeber the block counter once per block
      if (!hasIncrementedBlockCounter) {
        hasIncrementedBlockCounter = true;
        BLOCK_COUNTER++;
      }

      const id = `${callouts.length + 1}`;
      callouts.push(sanitized);

      return `${prefix}${formatCalloutDisplay(id)}`;
    }
  );

  return {codeInner: fallbackInner, callouts};
};

const codifyCallout = (callout: string): string => {
  return callout.replace(/`([^`]+)`/g, '<code>$1</code>');
};

const transformCodeBlockHtml = (blockHtml: string): string => {
  const codeStart = blockHtml.indexOf('<code');
  const codeTagEnd = blockHtml.indexOf('>', codeStart);
  const codeClose = blockHtml.lastIndexOf('</code>');

  if (codeStart === -1 || codeTagEnd === -1 || codeClose === -1)
    return blockHtml;

  const beforeCode = blockHtml.slice(0, codeTagEnd + 1);
  const originalCodeInner = blockHtml.slice(codeTagEnd + 1, codeClose);
  const afterCode = blockHtml.slice(codeClose);

  const {codeInner, callouts} = processCodeInnerHtml(originalCodeInner);
  if (callouts.length === 0) return blockHtml;

  const calloutLineItems = callouts
    .map(
      (c, i) =>
        `<li id="code-callout-${BLOCK_COUNTER}-${i + 1}">${codifyCallout(c)}</li>`
    )
    .join('');
  const calloutsHtml = `<section class="code-callout-list"><ol>${calloutLineItems}</ol></section>`;

  return `${beforeCode}${codeInner}${afterCode}${calloutsHtml}`;
};

export const handleRendererEndPage = (page: PageEvent<RouterTarget>): void => {
  if (!page.contents) return;

  BLOCK_COUNTER = 0;
  page.contents = page.contents.replace(CODE_BLOCK_REGEX, (blockHtml: string) =>
    transformCodeBlockHtml(blockHtml)
  );
};

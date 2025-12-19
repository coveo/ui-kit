import type {PageEvent, RouterTarget} from 'typedoc';

/**
 * Match entire code fences (tolerant to theme wrappers).
 */
const CODE_BLOCK_REGEX =
  /<pre\b[^>]*>[\s\S]*?<code\b[^>]*>[\s\S]*?<\/code>[\s\S]*?<\/pre>/gi;

/**
 * We prefer to match highlight.js "comment spans" and operate within them,
 * to preserve syntax highlighting for all non-comment code.
 *
 * This matches: <span class="...hljs-comment..."> ... </span>
 */
const HLJS_COMMENT_SPAN_REGEX =
  /<span\b[^>]*class="[^"]*\bhljs-comment\b[^"]*"[^>]*>[\s\S]*?<\/span>/gi;

/**
 * Callout syntax (case-insensitive) inside a single-line comment:
 *   // callout[ ... ]
 *
 * Payload can contain HTML. We'll sanitize later.
 */
const CALLOUT_IN_TEXT_REGEX = /\/\/\s*callout\[((?:.|\n)*?)\]/i;

/**
 * If comment isn't wrapped in a single hljs-comment span (some themes do weird splitting),
 * we fallback to a broader "HTML across spans" matcher for the *comment token sequence*.
 * This tries to find `//` then `callout[` then `]` and replace that region.
 */
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

/**
 * Extract callout payload from some HTML chunk (usually a comment span),
 * resilient to span fragmentation by normalizing it for parsing.
 */
const extractCalloutPayloadFromHtmlChunk = (
  htmlChunk: string
): string | null => {
  // Remove hljs <span> wrappers (but keep other tags like <a> if present as entities)
  // and decode entities so <a> becomes real HTML.
  const normalized = decodeEntities(stripSpanWrappers(htmlChunk));

  // Also build a plain-text version for reliably finding the callout boundaries.
  const plain = stripAllTags(normalized);

  const match = plain.match(CALLOUT_IN_TEXT_REGEX);
  if (!match) return null;

  // Now we need the payload as *HTML*, not plain text.
  // The payload in `plain` corresponds to what appears inside [].
  // We'll re-extract from normalized by locating `callout[` and the closing `]`
  // in a tag-stripped-but-entity-decoded string; then sanitize.
  //
  // Since normalized may contain tags, simplest is:
  //   - find indices in `plain`
  //   - but mapping indices back to `normalized` is hard
  //
  // Instead: do a second regex on normalized after removing only hljs spans.
  // This assumes `// callout[` and `]` survive in normalized as text (they do).
  const normalizedMatch = normalized.match(/\/\/\s*callout\[((?:.|\n)*?)\]/i);
  if (!normalizedMatch) return null;

  return normalizedMatch[1] ?? '';
};

const formatCalloutDisplay = (id: string) => {
  const width = id.length === 1 ? 16 : 32;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='16' viewBox='0 0 ${width} 16'>
    <circle cx='${width / 2}' cy='8' r='${width / 2}' stroke='black' stroke-width='1' fill='white'/>
    <text x='${width / 2}' y='9' text-anchor='middle' dominant-baseline='middle' font-family='sans-serif' font-size='14' font-weight='600' fill='black'>${id}</text>
  </svg>`;
  const src = `data:image/svg+xml;utf8,${svg}`;
  return `<a class="code-callout-ref" data-callout="${id}" href="#code-callout-hljs-${id}"> <img src="${src}" /> </a>`;
};

/**
 * Replace callout comments inside a codeInner HTML string while preserving highlighting:
 * - Prefer replacing entire hljs-comment spans that contain callouts.
 * - Fallback to a broad replace if we didn't catch any.
 */
const processCodeInnerHtml = (codeInner: string) => {
  const callouts: string[] = [];
  let didReplaceViaCommentSpan = false;

  const replaced = codeInner.replace(
    HLJS_COMMENT_SPAN_REGEX,
    (commentSpanHtml) => {
      const payloadHtml = extractCalloutPayloadFromHtmlChunk(commentSpanHtml);
      if (!payloadHtml) return commentSpanHtml;

      didReplaceViaCommentSpan = true;

      const sanitized = sanitizeCalloutHtml(payloadHtml);
      if (sanitized.length === 0) {
        // Remove the comment entirely if payload sanitizes to empty.
        return '';
      }

      const id = String(callouts.length + 1);
      callouts.push(sanitized);

      // Replace the entire comment span with a reference marker.
      // We add hljs-comment too so it looks "commenty" in highlighted code.
      return formatCalloutDisplay(id);
    }
  );

  if (didReplaceViaCommentSpan) {
    return {codeInner: replaced, callouts};
  }

  // Fallback: try to find // callout[...] across spans and replace it.
  // This is less precise than the comment-span approach, but helps in themes that
  // don't wrap comments cleanly.
  let fallbackInner = codeInner;
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

      if (sanitized.length === 0) return prefix; // remove entire comment

      const id = String(callouts.length + 1);
      callouts.push(sanitized);

      return `${prefix}${formatCalloutDisplay(id)}`;
    }
  );

  return {codeInner: fallbackInner, callouts};
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

  const calloutsHtml =
    `<section class="code-callout-list"><ol>` +
    callouts
      .map((c, i) => `<li id="code-callout-hljs-${i + 1}">${c}</li>`)
      .join('') +
    `</ol></section>`;

  return `${beforeCode}${codeInner}${afterCode}${calloutsHtml}`;
};

export const handleRendererEndPage = (page: PageEvent<RouterTarget>): void => {
  if (!page.contents) return;

  page.contents = page.contents.replace(CODE_BLOCK_REGEX, (blockHtml: string) =>
    transformCodeBlockHtml(blockHtml)
  );
};

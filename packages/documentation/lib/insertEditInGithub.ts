import * as fs from 'node:fs';
import * as path from 'node:path';
import type {PageEvent, Reflection} from 'typedoc';

const GITHUB_BASE = 'https://github.com/coveo/ui-kit/blob/main/';
const SOURCE_DOCS_REPO_PATH = 'packages/headless/source_docs';
const DOCUMENT_PAGE_PREFIX = 'documents/';

let mdSourceMap: Map<string, string> | null = null;

function normalizeKey(s?: string | null): string {
  if (!s) return '';
  return s
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/\.html$/, '');
}

/**
 * Scans `source_docs/` (relative to cwd, which is `packages/headless/`
 * during TypeDoc builds) and builds a map of
 * normalized slug → repo-relative file path.
 *
 * Example entry:
 *   `"usage/server-side-rendering/implement-search-parameter-support"`
 *     → `"packages/headless/source_docs/ssr-implement-search-parameter-support.md"`
 */
function buildMarkdownSourceMap(): Map<string, string> {
  if (mdSourceMap) return mdSourceMap;
  mdSourceMap = new Map();

  const sourceDocsDir = path.resolve(
    process.cwd(),
    path.basename(SOURCE_DOCS_REPO_PATH)
  );

  if (!fs.existsSync(sourceDocsDir)) {
    return mdSourceMap;
  }

  try {
    const files = fs
      .readdirSync(sourceDocsDir)
      .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));

    for (const file of files) {
      const filePath = path.join(sourceDocsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const repoRelativePath = `${SOURCE_DOCS_REPO_PATH}/${file}`;

      const fmMatch = content.match(/^---\s*([\s\S]*?)\s*---/);
      if (fmMatch) {
        const block = fmMatch[1];

        const slugMatch = block.match(/^\s*slug:\s*['"]?([^'"\n]+)['"]?\s*$/m);
        if (slugMatch) {
          mdSourceMap.set(normalizeKey(slugMatch[1]), repoRelativePath);
        }

        const titleMatch = block.match(
          /^\s*title:\s*['"]?([^'"\n]+)['"]?\s*$/m
        );
        if (titleMatch) {
          mdSourceMap.set(normalizeKey(titleMatch[1]), repoRelativePath);
        }
      }

      const baseName = normalizeKey(path.basename(file, path.extname(file)));
      mdSourceMap.set(baseName, repoRelativePath);
    }
  } catch {
    // Silently ignore — button simply won't appear for document pages
  }

  return mdSourceMap;
}

/**
 * Resolves a TypeDoc document page URL to a repo-relative `source_docs/` path.
 *
 * TypeDoc generates document pages at URLs like `documents/usage/proxy.html`
 * while frontmatter slugs are `usage/proxy`. The function strips the
 * `documents/` prefix and tries progressively shorter segments.
 *
 * Match strategies (in order):
 *   1. Direct slug match (e.g., `"usage/proxy"`)
 *   2. Progressive segment match — strips leading segments one at a time
 *   3. Last URL segment match (e.g., `"proxy"`)
 */
function inferSourceDocPath(pageUrl: string): string | null {
  let normalized = normalizeKey(pageUrl);

  // Strip the TypeDoc "documents/" prefix so URLs align with frontmatter slugs
  if (normalized.startsWith(DOCUMENT_PAGE_PREFIX)) {
    normalized = normalized.slice(DOCUMENT_PAGE_PREFIX.length);
  }

  const map = buildMarkdownSourceMap();

  // 1) Direct match against slug
  if (map.has(normalized)) {
    return map.get(normalized)!;
  }

  // 2) Progressive segment match (handles nested slugs)
  const segments = normalized.split('/').filter(Boolean);
  for (let i = 1; i < segments.length; i++) {
    const candidate = segments.slice(i).join('/');
    if (map.has(candidate)) {
      return map.get(candidate)!;
    }
  }

  // 3) Last segment match (broadest, least precise)
  const lastSegment = segments[segments.length - 1];
  if (lastSegment && map.has(lastSegment)) {
    return map.get(lastSegment)!;
  }

  return null;
}

/**
 * TypeDoc `PageEvent.END` handler that injects a floating
 * "Edit in GitHub" button into each rendered page.
 *
 * For code reflection pages the link points to the source file + line.
 * For document pages (markdown articles) the link points to the
 * corresponding file under `packages/headless/source_docs/`.
 */
export function insertEditInGithub(page: PageEvent<Reflection>) {
  const model = page.model as Reflection & {
    sources?: Array<{fullFileName?: string; line?: number}>;
  };

  let githubUrl: string | null = null;
  const pageUrl = page.url ?? '';

  // 1) Code reflections — derive from model.sources
  if (model?.sources?.length && model.sources[0]?.fullFileName) {
    const src = model.sources[0];
    const idx = src.fullFileName.indexOf('packages/');
    if (idx !== -1) {
      const relativePath = src.fullFileName.substring(idx).replace(/\\/g, '/');
      const line = src.line ?? 1;
      githubUrl = `${GITHUB_BASE}${relativePath}#L${line}`;
    }
  }

  // 2) Document pages — match page URL against source_docs slug map
  if (!githubUrl && String(pageUrl).startsWith(DOCUMENT_PAGE_PREFIX)) {
    const inferredPath = inferSourceDocPath(String(pageUrl));
    if (inferredPath) {
      githubUrl = `${GITHUB_BASE}${inferredPath}`;
    }
  }

  if (!githubUrl || !page.contents) {
    return;
  }

  /** Escape string for use inside HTML attribute values */
  function escapeHtmlAttr(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function buildButtonHtml(url: string): string {
    const safeHref = escapeHtmlAttr(encodeURI(String(url)));
    return `
    <div class="typedoc-edit-github">
      <a href="${safeHref}" target="_blank" rel="noopener noreferrer" aria-label="Edit in GitHub">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        <span class="typedoc-edit-github-label">Edit in GitHub</span>
      </a>
    </div>`;
  }

  const buttonHtml = buildButtonHtml(githubUrl);

  if (page.contents.includes('class="tsd-page-title"')) {
    // Note: this regex uses a non-greedy match and stops at the first </div>.
    // This is safe because TypeDoc's .tsd-page-title block currently contains
    // only inline elements (e.g. <h1>). If a future TypeDoc version introduces
    // nested <div> elements inside .tsd-page-title, this regex will need to be
    // replaced with a balanced-tag scanner or DOM parser.
    page.contents = page.contents.replace(
      /(<div\s+class="tsd-page-title">)([\s\S]*?)(<\/div>)/i,
      (_match, openTag, innerContent, closeTag) =>
        `${openTag}<div class="tsd-page-title-content">${innerContent}</div>${buttonHtml}${closeTag}`
    );
    return;
  }

  if (page.contents.includes('</body>')) {
    page.contents = page.contents.replace('</body>', `${buttonHtml}</body>`);
  } else {
    page.contents += buttonHtml;
  }
}

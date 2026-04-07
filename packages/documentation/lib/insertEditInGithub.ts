import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {basename, extname, join, resolve} from 'node:path';
import type {PageEvent, Reflection} from 'typedoc';

const GITHUB_BASE = 'https://github.com/coveo/ui-kit/blob/main/';
const SOURCE_DOCS_REPO_PATH = 'packages/headless/source_docs';
const DOCUMENT_PAGE_PREFIX = 'documents/';

let mdSourceMap: Map<string, string> | null = null;

/**
 * Normalizes a URL or slug for consistent map lookups.
 *
 * Examples:
 * - `"  Usage/Proxy.html  "` → `"usage/proxy"`
 * - `"/api/search/"` → `"api/search"`
 */
function normalizeKey(urlOrSlug?: string | null): string {
  if (!urlOrSlug) return '';

  const normalized = urlOrSlug.trim().toLowerCase();

  const leadingSlashesRemoved = normalized.replace(/^\/+/, '');
  const trailingSlashesRemoved = leadingSlashesRemoved.replace(/\/+$/, '');
  const htmlExtensionRemoved = trailingSlashesRemoved.replace(/\.html$/, '');

  return htmlExtensionRemoved;
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

  // Resolve the repository root relative to this file, then locate
  // `packages/headless/source_docs` from that root. This avoids
  // depending on the process current working directory which may vary
  // when TypeDoc is invoked from different locations.
  const __dirname = import.meta.dirname;
  const repoRoot = resolve(__dirname, '../../..');
  const sourceDocsDir = resolve(repoRoot, SOURCE_DOCS_REPO_PATH);

  if (!existsSync(sourceDocsDir)) {
    return mdSourceMap;
  }

  try {
    const files = readdirSync(sourceDocsDir).filter(
      (f) => f.endsWith('.md') || f.endsWith('.mdx')
    );

    for (const file of files) {
      const filePath = join(sourceDocsDir, file);
      const content = readFileSync(filePath, 'utf8');
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

      const baseName = normalizeKey(basename(file, extname(file)));
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

/** Escape string for use inside HTML attribute values */
function escapeHtmlAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildMetaTag(url: string): string {
  const safeContent = escapeHtmlAttr(String(url));
  return `<meta name="github-edit-url" content="${safeContent}">`;
}

/**
 * TypeDoc `PageEvent.END` handler that injects a `<meta name="github-edit-url">`
 * tag into each rendered page's `<head>`. The tag is read at runtime by
 * `insertSiteHeaderBar` to populate and reveal the "Edit in GitHub" navbar button.
 *
 * For code reflection pages the URL points to the source file + line.
 * For document pages (markdown articles) the URL points to the corresponding
 * file under `packages/headless/source_docs/`.
 */
export function insertEditInGithub(page: PageEvent<Reflection>) {
  // For Headless-React builds the sources are generated from `dist/` and
  // don't point to repo-editable files. We still want the header wrapper
  // CSS applied, so set a flag to skip only the button injection.
  let skipButton = false;
  try {
    skipButton = import.meta.dirname.includes('packages/headless-react');
  } catch {}

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
      if (relativePath.includes('/src/') && !relativePath.includes('/dist/')) {
        const line = src.line ?? 1;
        githubUrl = `${GITHUB_BASE}${relativePath}#L${line}`;
      }
    }
  }

  // 2) Document pages with explicit document/ prefix
  if (!githubUrl && String(pageUrl).startsWith(DOCUMENT_PAGE_PREFIX)) {
    const inferredPath = inferSourceDocPath(String(pageUrl));
    if (inferredPath) {
      githubUrl = `${GITHUB_BASE}${inferredPath}`;
    }
  }

  // 3) Root index.html (TypeDoc's alias for documents/index.html)
  if (!githubUrl && (pageUrl === 'index.html' || pageUrl === '')) {
    const inferredPath = inferSourceDocPath(
      `${DOCUMENT_PAGE_PREFIX}index.html`
    );
    if (inferredPath) {
      githubUrl = `${GITHUB_BASE}${inferredPath}`;
    }
  }

  if (!page.contents) {
    return;
  }

  if (githubUrl && !skipButton) {
    const metaTag = buildMetaTag(githubUrl);
    if (page.contents.includes('</head>')) {
      page.contents = page.contents.replace('</head>', `${metaTag}</head>`);
    }
  }
}

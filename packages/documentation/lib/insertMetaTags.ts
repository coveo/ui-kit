import {DocumentReflection, type PageEvent} from 'typedoc';
import type {TFrontMatter} from './types.js';

export const insertMetaTags = (page: PageEvent) => {
  if (!page.contents) return;

  const metaTags = [
    '<meta name="color-scheme" content="light dark">',
    '<meta name="theme-color" content="light">',
    '<meta name="docsSiteUrl" content="https://docs.coveo.com">',
    '<meta name="docsSiteBaseUrl" content="/en">',
  ];

  const isHandwrittenDoc = page.model instanceof DocumentReflection;

  if (isHandwrittenDoc) {
    const frontmatter = (page.model as DocumentReflection)
      .frontmatter as TFrontMatter;
    if (frontmatter?.pageTitle) {
      const titleMatch = page.contents.match(/<title>[^<]*<\/title>/i);
      if (titleMatch) {
        const suffix = titleMatch[0].match(/\|\s*([^<]*)<\/title>/i)?.[1] ?? '';
        const newTitle = suffix
          ? `<title>${frontmatter.pageTitle} | ${suffix}</title>`
          : `<title>${frontmatter.pageTitle}</title>`;
        page.contents = page.contents.replace(titleMatch[0], newTitle);
      }
    }
  } else {
    const titleMatch = page.contents.match(/<title>\s*([^<]*)<\/title>/i);
    if (titleMatch) {
      const originalTitle = titleMatch[1];
      const formattedName = originalTitle
        .split(' | ')[0]
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .toLowerCase();
      metaTags.push(
        `<meta name="docsSiteMeta" content="${formattedName} reference" />`
      );
    }
  }

  page.contents = page.contents.replace(
    /<\/head>/,
    `${metaTags.join('\n')}\n</head>`
  );
};

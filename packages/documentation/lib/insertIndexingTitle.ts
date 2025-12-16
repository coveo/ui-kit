import type {PageEvent} from 'typedoc';

export const insertIndexingTitle = (page: PageEvent) => {
  if (!page.contents) return;

  const titleMatch = page.contents.match(/<title>(.*?)<\/title>/);
  if (!titleMatch) return;

  const originalTitle = titleMatch[1];
  const parts = originalTitle.split(' | ');
  const name = parts[0];
  const splitName = name.replace(/([a-z])([A-Z])/g, '$1 $2');

  parts[0] = splitName;
  const indexingTitle = parts.join(' | ');

  page.contents = page.contents.replace(
    /<\/head>/,
    `<meta name="coveo-indexing-title" content="${indexingTitle}" />\n</head>`
  );
};

import type {PageEvent} from 'typedoc';

export const insertIndexingMeta = (page: PageEvent) => {
  if (!page.contents) return;

  const titleMatch = page.contents.match(/<title>(.*?)<\/title>/);
  if (!titleMatch) return;

  const originalTitle = titleMatch[1];
  const parts = originalTitle.split(' | ');
  const name = parts[0];
  const splitName = name.replace(/([a-z])([A-Z])/g, '$1 $2');
  const lowerCaseName = splitName.toLowerCase();

  page.contents = page.contents.replace(
    /<\/head>/,
    `<meta name="coveo-headless-indexing-meta" content="${lowerCaseName}" />\n</head>`
  );
};

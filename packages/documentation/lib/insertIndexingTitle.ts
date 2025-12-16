import type {PageEvent} from 'typedoc';

export const insertIndexingTitle = (page: PageEvent) => {
  if (!page.contents) return;

  const titleMatch = page.contents.match(/<title>(.*?)<\/title>/);
  if (!titleMatch) return;

  const originalTitle = titleMatch[1];
  const parts = originalTitle.split(' | ');
  const name = parts[0];
  const splitName = name.replace(/([a-z])([A-Z])/g, '$1 $2');
  const sentenceCaseName =
    splitName.charAt(0).toUpperCase() + splitName.slice(1).toLowerCase();

  parts[0] = sentenceCaseName;
  const indexingTitle = parts.join(' | ');

  page.contents = page.contents.replace(
    /<\/head>/,
    `<meta name="coveo-indexing-title" content="${indexingTitle}" />\n</head>`
  );
};

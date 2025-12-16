import {DocumentReflection, type PageEvent} from 'typedoc';

export const insertMetaTags = (page: PageEvent) => {
  if (!page.contents) return;

  const metaTags = [
    '<meta name="color-scheme" content="light dark">',
    '<meta name="theme-color" content="light">',
    '<meta name="docsSiteUrl" content="https://docs.coveo.com">',
    '<meta name="docsSiteBaseUrl" content="/en">',
  ];

  const isHandwrittenDoc = page.model instanceof DocumentReflection;

  if (!isHandwrittenDoc) {
    const titleMatch = page.contents.match(/<title>\s*([^<]*)<\/title>/i);
    if (titleMatch) {
      const originalTitle = titleMatch[1];
      const parts = originalTitle.split(' | ');
      const name = parts[0];
      const splitName = name
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
      const formattedName = splitName.toLowerCase();
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

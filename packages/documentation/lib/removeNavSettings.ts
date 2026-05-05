import {DocumentReflection, type PageEvent} from 'typedoc';

export const removeNavSettings = (page: PageEvent) => {
  if (!page.contents) return;

  const isHandwrittenDoc = page.model instanceof DocumentReflection;

  if (isHandwrittenDoc || page.url === 'index.html') {
    page.contents = page.contents.replace(
      /<div class="tsd-navigation settings">[\s\S]*?<\/details>\s*<\/div>/,
      ''
    );
  }
};

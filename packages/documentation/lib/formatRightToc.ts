import type {PageEvent} from 'typedoc';

export const formatRightToc = (page: PageEvent) => {
  if (!page.contents) return;

  page.contents = page.contents.replace(
    /(tsd-page-navigation">)<summary class="tsd-accordion-summary">[\s\S]*?<\/summary>/,
    '$1<summary class="tsd-accordion-summary"></summary><div class="right-toc-text">In this article</div>'
  );

  // Remove the top-level heading link from the right-hand TOC while preserving the list structure
  page.contents = page.contents.replace(
    /(<div class="tsd-accordion-details">)\s*<a[^>]*>[\s\S]*?<\/a>\s*(<ul>[\s\S]*?<\/ul>)\s*(<\/div>\s*<\/details>)/,
    '$1$2$3'
  );
};

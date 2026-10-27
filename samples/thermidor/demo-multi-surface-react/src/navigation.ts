/**
 * A page of the storefront, as its URL names it. A search or listing page also names the surface
 * it showed, so the server can send that surface again, with its state, when the page is shown
 * again.
 */
export type Page =
  | {page: 'home'}
  | {page: 'assistant'; prompt: string}
  | {page: 'search'; query: string; surface?: string}
  | {page: 'listing'; slug: string; surface?: string};

/** The page a URL names: `/`, `/assistant?q=`, `/search?q=` or `/listing/<slug>`, with `surface`. */
export function pageFromUrl({pathname, search}: {pathname: string; search: string}): Page {
  const params = new URLSearchParams(search);
  const surface = params.get('surface') || undefined;
  const [section, slug] = pathname.split('/').filter(Boolean).map(decodeURIComponent);
  const query = params.get('q')?.trim();
  if (section === 'assistant' && query) {
    return {page: 'assistant', prompt: query};
  }
  if (section === 'search' && query) {
    return {page: 'search', query, ...(surface && {surface})};
  }
  if (section === 'listing' && slug) {
    return {page: 'listing', slug, ...(surface && {surface})};
  }
  return {page: 'home'};
}

/** The URL of `page`, which `pageFromUrl` reads back. */
export function urlOf(page: Page): string {
  const params = new URLSearchParams();
  switch (page.page) {
    case 'home':
      return '/';
    case 'assistant':
      params.set('q', page.prompt);
      return `/assistant?${params}`;
    case 'search':
      params.set('q', page.query);
      if (page.surface) {
        params.set('surface', page.surface);
      }
      return `/search?${params}`;
    case 'listing':
      if (page.surface) {
        params.set('surface', page.surface);
      }
      return `/listing/${encodeURIComponent(page.slug)}${params.size ? `?${params}` : ''}`;
  }
}

/** The listing pages of the previewed storefront, as the Merchandising Hub lists them. */
export const LISTINGS: ReadonlyArray<{slug: string; name: string}> = [
  {slug: 'water-sports', name: 'Water Sports'},
  {slug: 'surfing', name: 'Surfing'},
  {slug: 'surfboards', name: 'Surfboards'},
  {slug: 'paddling', name: 'Paddling'},
  {slug: 'life-jackets', name: 'Life Jackets'},
  {slug: 'snorkeling-diving', name: 'Snorkeling & Diving'},
  {slug: 'wetsuits-drysuits', name: 'Wetsuits & Drysuits'},
  {slug: 'accessories', name: 'Water Sports Accessories'},
];

export function listingName(slug: string): string {
  return LISTINGS.find((listing) => listing.slug === slug)?.name ?? slug;
}

/** How the browser's history names `page`. */
export function pageName(page: Page): string {
  switch (page.page) {
    case 'home':
      return 'Home';
    case 'assistant':
      return `“${page.prompt}”`;
    case 'search':
      return `Results for “${page.query}”`;
    case 'listing':
      return listingName(page.slug);
  }
}

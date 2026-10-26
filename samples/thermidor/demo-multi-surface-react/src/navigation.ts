/** One visit to a page. A new visit, even to the same page, gives the page fresh surfaces. */
export type Visit =
  | {id: number; page: 'home'}
  | {id: number; page: 'assistant'; prompt: string}
  | {id: number; page: 'search'; query: string}
  | {id: number; page: 'listing'; slug: string};

/**
 * The visits of the tab, oldest first, and the one shown. Going back shows an earlier visit again,
 * with its id, so the page draws the surfaces it already has and sends nothing.
 */
export interface History {
  visits: readonly Visit[];
  index: number;
}

let visitCount = 0;

function nextId(): number {
  visitCount += 1;
  return visitCount;
}

export function visitHome(): Visit {
  return {id: nextId(), page: 'home'};
}

export function visitAssistant(prompt: string): Visit {
  return {id: nextId(), page: 'assistant', prompt};
}

export function visitSearch(query: string): Visit {
  return {id: nextId(), page: 'search', query};
}

export function visitListing(slug: string): Visit {
  return {id: nextId(), page: 'listing', slug};
}

export function startHistory(): History {
  return {visits: [visitHome()], index: 0};
}

/** Shows `visit` after the current one. The visits that were ahead of the current one are dropped. */
export function pushVisit(history: History, visit: Visit): History {
  return {visits: [...history.visits.slice(0, history.index + 1), visit], index: history.index + 1};
}

/** Shows the visit before the current one again. */
export function goBack(history: History): History {
  return history.index === 0 ? history : {...history, index: history.index - 1};
}

export function currentVisit(history: History): Visit {
  return history.visits[history.index];
}

export function previousVisit(history: History): Visit | undefined {
  return history.visits[history.index - 1];
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

/** How a Back button names the page of `visit`. */
export function pageName(visit: Visit): string {
  switch (visit.page) {
    case 'home':
      return 'home';
    case 'assistant':
      return `“${visit.prompt}”`;
    case 'search':
      return `results for “${visit.query}”`;
    case 'listing':
      return listingName(visit.slug);
  }
}

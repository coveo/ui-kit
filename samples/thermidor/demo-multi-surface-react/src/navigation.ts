/**
 * One visit to a page. A new visit, even to the same page, gives the page fresh surfaces. The
 * assistant and search pages belong to a conversation (`thread`, the id of the visit that opened
 * it): the assistant page and the search pages' chat panels all show and continue it.
 */
export type Visit =
  | {id: number; page: 'home'}
  | {id: number; page: 'assistant'; prompt: string; thread: number}
  | {
      id: number;
      page: 'search';
      query: string;
      thread: number;
      /** The conversation turn whose search the page shows; without it, the page sends `query`. */
      openingTurnId?: string;
    }
  | {id: number; page: 'listing'; slug: string};

/** The conversation a visit belongs to, if any. */
export function threadOf(visit: Visit): number | undefined {
  return visit.page === 'assistant' || visit.page === 'search' ? visit.thread : undefined;
}

let visitCount = 0;

function nextId(): number {
  visitCount += 1;
  return visitCount;
}

export function visitHome(): Visit {
  return {id: nextId(), page: 'home'};
}

/** An assistant page, in the conversation `thread`, or in a new one. */
export function visitAssistant(prompt: string, thread?: number): Visit {
  const id = nextId();
  return {id, page: 'assistant', prompt, thread: thread ?? id};
}

/**
 * A search page, in the conversation `thread`, or in a new one. It sends `query`, or shows the
 * search of the conversation turn `openingTurnId`.
 */
export function visitSearch(query: string, thread?: number, openingTurnId?: string): Visit {
  const id = nextId();
  return {id, page: 'search', query, thread: thread ?? id, openingTurnId};
}

export function visitListing(slug: string): Visit {
  return {id: nextId(), page: 'listing', slug};
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

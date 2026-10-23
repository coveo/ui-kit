/** One visit to a page. A new visit, even to the same page, gives the page fresh surfaces. */
export type Visit =
  | {id: number; page: 'home'}
  | {id: number; page: 'assistant'; prompt: string}
  | {id: number; page: 'search'; query: string}
  | {id: number; page: 'listing'; slug: string};

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

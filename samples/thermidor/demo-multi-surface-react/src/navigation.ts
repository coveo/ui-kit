import type {StorefrontView} from './session/storefront-session.js';

/**
 * One visit to a page. A new visit, even to the same page, gives the page fresh surfaces. A prompt
 * visit sends its prompt once, on its view, and the page follows what the server answers.
 */
export type Visit =
  | {id: number; page: 'home'}
  | {id: number; page: 'prompt'; prompt: string; view: StorefrontView}
  | {id: number; page: 'listing'; slug: string};

let visitCount = 0;

function nextId(): number {
  visitCount += 1;
  return visitCount;
}

export function visitHome(): Visit {
  return {id: nextId(), page: 'home'};
}

/**
 * A prompt sent on the session shell (`storefront-preview`), where the server routes it by its
 * intent, or on another view, such as a follow-up the assistant suggested.
 */
export function visitPrompt(prompt: string, view: StorefrontView = 'storefront-preview'): Visit {
  return {id: nextId(), page: 'prompt', prompt, view};
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

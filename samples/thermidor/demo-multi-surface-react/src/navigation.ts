import type {StorefrontView} from './session/storefront-session.js';

/**
 * One visit to a page. A new visit, even to the same page, gives the page fresh surfaces. A prompt
 * visit sends its prompt once, on its view, and the page follows what the server answers. Prompt
 * visits belong to a conversation (`thread`, the id of the visit that opened it): the assistant
 * layout and the search layout's chat panel both show and continue it.
 */
export type Visit =
  | {id: number; page: 'home'}
  | {
      id: number;
      page: 'prompt';
      prompt: string;
      view: StorefrontView;
      thread: number;
      /** The conversation turn whose search the page shows; with it, the page sends nothing. */
      openingTurnId?: string;
    }
  | {id: number; page: 'listing'; slug: string};

/** The conversation a visit belongs to, if any. */
export function threadOf(visit: Visit): number | undefined {
  return visit.page === 'prompt' ? visit.thread : undefined;
}

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
 * intent, or on another view, such as a follow-up the assistant suggested. It joins the
 * conversation `thread`, or opens a new one.
 */
export function visitPrompt(
  prompt: string,
  view: StorefrontView = 'storefront-preview',
  thread?: number
): Visit {
  const id = nextId();
  return {id, page: 'prompt', prompt, view, thread: thread ?? id};
}

/** The search layout on the search a turn of the conversation `thread` drew. */
export function visitResults(query: string, thread: number, openingTurnId: string): Visit {
  return {
    id: nextId(),
    page: 'prompt',
    prompt: query,
    view: 'storefront-preview',
    thread,
    openingTurnId,
  };
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

/**
 * The view a listing page's own turns are sent on. The published contract has no view for
 * listings, so it reuses the search view; a turn's visit keeps it apart from a search page.
 */
export const LISTING_VIEW: StorefrontView = 'storefront-preview-search';

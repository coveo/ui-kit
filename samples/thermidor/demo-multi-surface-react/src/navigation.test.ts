import {describe, expect, it} from 'vitest';
import {
  currentVisit,
  goBack,
  pageName,
  previousVisit,
  pushVisit,
  startHistory,
  visitAssistant,
  visitListing,
  visitSearch,
} from './navigation.js';

describe('navigation history', () => {
  it('opens on a home visit, with nothing to go back to', () => {
    const history = startHistory();

    expect(currentVisit(history).page).toBe('home');
    expect(previousVisit(history)).toBeUndefined();
    expect(goBack(history)).toBe(history);
  });

  it('goes back to the earlier visit itself, with its id', () => {
    const listing = visitListing('surfing');
    const history = pushVisit(pushVisit(startHistory(), listing), visitAssistant('wetsuits'));

    expect(previousVisit(history)).toBe(listing);
    expect(currentVisit(goBack(history))).toBe(listing);
  });

  it('drops the visits ahead of the current one when a new visit opens', () => {
    const search = visitSearch('kayak');
    const back = goBack(pushVisit(pushVisit(startHistory(), visitListing('surfing')), search));

    const history = pushVisit(back, visitAssistant('wetsuits'));

    expect(history.visits.map(({page}) => page)).toEqual(['home', 'listing', 'assistant']);
    expect(history.visits).not.toContain(search);
  });
});

describe('pageName', () => {
  it('names each page for a Back button', () => {
    expect(pageName(startHistory().visits[0])).toBe('home');
    expect(pageName(visitListing('snorkeling-diving'))).toBe('Snorkeling & Diving');
    expect(pageName(visitSearch('kayak'))).toBe('results for “kayak”');
    expect(pageName(visitAssistant('which kayak?'))).toBe('“which kayak?”');
  });
});

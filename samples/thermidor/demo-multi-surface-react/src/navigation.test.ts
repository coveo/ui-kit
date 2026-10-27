import {describe, expect, it} from 'vitest';
import {pageFromUrl, pageName, urlOf, type Page} from './navigation.js';

const at = (url: string) => {
  const {pathname, search} = new URL(url, 'http://localhost');
  return pageFromUrl({pathname, search});
};

describe('pageFromUrl', () => {
  it('reads each page, and the surface a search or listing page showed', () => {
    expect(at('/')).toEqual({page: 'home'});
    expect(at('/assistant?q=which+kayak%3F')).toEqual({page: 'assistant', prompt: 'which kayak?'});
    expect(at('/search?q=kayak&surface=ui-1f')).toEqual({
      page: 'search',
      query: 'kayak',
      surface: 'ui-1f',
    });
    expect(at('/listing/surfing')).toEqual({page: 'listing', slug: 'surfing'});
    expect(at('/listing/surfing?surface=ui-1f')).toEqual({
      page: 'listing',
      slug: 'surfing',
      surface: 'ui-1f',
    });
  });

  it('opens the home page for a URL that names no page', () => {
    expect(at('/search')).toEqual({page: 'home'});
    expect(at('/assistant?q=%20')).toEqual({page: 'home'});
    expect(at('/listing')).toEqual({page: 'home'});
    expect(at('/checkout')).toEqual({page: 'home'});
  });
});

describe('urlOf', () => {
  it('builds a URL that reads back as the same page', () => {
    const pages: Page[] = [
      {page: 'home'},
      {page: 'assistant', prompt: 'gift ideas under $50 & more'},
      {page: 'search', query: 'kayak'},
      {page: 'search', query: 'kayak', surface: 'ui-1f'},
      {page: 'listing', slug: 'snorkeling-diving'},
      {page: 'listing', slug: 'surfing', surface: 'ui-1f'},
    ];

    for (const page of pages) {
      expect(at(urlOf(page))).toEqual(page);
    }
    expect(urlOf({page: 'listing', slug: 'surfing', surface: 'ui-1f'})).toBe(
      '/listing/surfing?surface=ui-1f'
    );
  });
});

describe('pageName', () => {
  it('names each page', () => {
    expect(pageName({page: 'home'})).toBe('Home');
    expect(pageName({page: 'listing', slug: 'snorkeling-diving'})).toBe('Snorkeling & Diving');
    expect(pageName({page: 'search', query: 'kayak'})).toBe('Results for “kayak”');
    expect(pageName({page: 'assistant', prompt: 'which kayak?'})).toBe('“which kayak?”');
  });
});

import {highlightSearchResult} from './facet-search-utils';

describe('#highlightSearchResult', () => {
  it('should highlight the first instance of the query ', () => {
    expect(highlightSearchResult('test', 't')).toBe(
      '<span part="search-highlight" class="font-bold">t</span>est'
    );
  });

  it('should match multiple characters', () => {
    expect(highlightSearchResult('test', 'te')).toBe(
      '<span part="search-highlight" class="font-bold">te</span>st'
    );
  });

  it('should be case insensitive', () => {
    expect(highlightSearchResult('Test', 'tE')).toBe(
      '<span part="search-highlight" class="font-bold">Te</span>st'
    );
  });

  it('should escape result & query', () => {
    expect(
      highlightSearchResult('<script>console.log("hmm")<script>', 'con')
    ).toBe(
      '&lt;script&gt;<span part="search-highlight" class="font-bold">con</span>sole.log(&quot;hmm&quot;)&lt;script&gt;'
    );
  });
});

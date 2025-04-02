import {buildStaticFilterValue} from './static-filter-value.js';

describe('#buildStaticFilterValue', () => {
  it('when #state is not specified, it defaults to idle', () => {
    const caption = 'a';
    const expression = 'b';
    const value = buildStaticFilterValue({caption, expression});

    expect(value).toEqual({caption, expression, state: 'idle'});
  });

  it('when #state is specified, it uses the specified value', () => {
    const caption = 'a';
    const expression = 'b';
    const state = 'selected';
    const value = buildStaticFilterValue({caption, expression, state});

    expect(value).toEqual({caption, expression, state});
  });
});

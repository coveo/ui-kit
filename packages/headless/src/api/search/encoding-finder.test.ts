import {Response} from 'cross-fetch';
import {findEncoding} from './encoding-finder';

describe('#findEncoding', () => {
  it('when the response has no content-type header, it returns UTF-8', () => {
    const response = new Response('', {headers: {}});
    expect(findEncoding(response)).toBe('UTF-8');
  });

  it('when the content-type header does not contain a charset, it returns UTF-8', () => {
    const headers = {'content-type': 'text/html'};
    const response = new Response('', {headers});

    expect(findEncoding(response)).toBe('UTF-8');
  });

  it('when the content-type header has a charset, it returns the charset value', () => {
    const headers = {'content-type': 'text/html; charset=UTF-16'};
    const response = new Response('', {headers});

    expect(findEncoding(response)).toBe('UTF-16');
  });
});

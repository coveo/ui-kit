import {render} from 'lit';
import {recentQueryText} from './recent-queries';

describe('recentQueryText', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  test('when query is empty, should render the value without highlights', () => {
    render(recentQueryText({props: {query: '', value: 'value'}}), container);

    const element = container.querySelector('span');
    expect(element).toHaveAttribute('part', 'recent-query-text');
    expect(element).toHaveTextContent('value');
  });

  test('when query is not empty, should render the value with highlights', () => {
    render(recentQueryText({props: {query: 'va', value: 'value'}}), container);

    const element = container.querySelector('span');
    expect(element).toHaveAttribute('part', 'recent-query-text');
    expect(element).toHaveTextContent('value');
    const boldSpan = element?.querySelector('span');
    expect(boldSpan).toHaveAttribute('part', 'recent-query-text-highlight');
    expect(boldSpan).toHaveTextContent('lue');
  });
});

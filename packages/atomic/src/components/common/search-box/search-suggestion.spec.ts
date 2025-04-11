import {createTestI18n} from '@/vitest-utils/i18n-utils';
import {html, render} from 'lit';
import {
  buttonSearchSuggestion,
  simpleSearchSuggestion,
} from './search-suggestion';

describe('buttonSearchSuggestion', () => {
  let container: HTMLElement;

  beforeEach(async () => {
    container = document.createElement('div');
    document.body.appendChild(container);

    const i18n = await createTestI18n();
    render(
      buttonSearchSuggestion({
        props: {
          i18n,
          id: 'id',
          suggestion: {key: 'key', content: html`content`, query: 'query'},
          isSelected: true,
          side: 'left',
          index: 0,
          lastIndex: 1,
          isDoubleList: false,
        },
      }),
      container
    );
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  test('part is set correctly', () => {
    const element = container.querySelector('button');
    expect(element).toHaveAttribute(
      'part',
      'suggestion active-suggestion suggestion-with-query'
    );
  });

  test('class is set correctly', () => {
    const element = container.querySelector('button');
    expect(element).toHaveClass('bg-neutral-light');
  });
});

describe('simpleSearchSuggestion', () => {
  let container: HTMLElement;

  beforeEach(async () => {
    container = document.createElement('div');
    document.body.appendChild(container);

    const i18n = await createTestI18n();
    render(
      simpleSearchSuggestion({
        props: {
          i18n,
          id: 'id',
          suggestion: {key: 'key', content: html`content`, query: 'query'},
          isSelected: true,
          side: 'left',
          index: 0,
          lastIndex: 1,
          isDoubleList: false,
        },
      }),
      container
    );
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  test('part is set correctly', () => {
    const element = container.querySelector('span');
    expect(element).toHaveAttribute(
      'part',
      'suggestion active-suggestion suggestion-with-query'
    );
  });

  test('class is set correctly', () => {
    const element = container.querySelector('span');
    expect(element).toHaveClass('bg-neutral-light');
  });
});

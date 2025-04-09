import {createTestI18n} from '@/vitest-utils/i18n-utils';
import {render} from 'lit';
import {searchBoxTextArea} from './text-area';

describe('searchBoxTextArea', () => {
  let container: HTMLElement;

  const setupElement = async (loading: boolean, value: string) => {
    const i18n = await createTestI18n();

    render(
      searchBoxTextArea({
        props: {
          textAreaRef: document.createElement('textarea'),
          loading,
          i18n,
          value,
          ariaLabel: 'Search',
          onClear: () => {},
          popup: {
            id: 'id',
            activeDescendant: 'activeDescendant',
            expanded: false,
            hasSuggestions: false,
          },
          onInput: () => {},
          onFocus: () => {},
          onBlur: () => {},
          onChange: () => {},
          onKeyDown: () => {},
        },
      }),
      container
    );
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  test('placeholder is set correctly', async () => {
    await setupElement(false, '');
    const textArea = container.querySelector('textarea');
    expect(textArea).toHaveAttribute('placeholder', 'Search');
  });

  test('when loading, should show the loading spinner', async () => {
    await setupElement(true, '');
    const loadingSpinner = container.querySelector('.loading');
    expect(loadingSpinner).toBeInTheDocument();
  });

  test('when not loading and when value is not empty, should show the clear button', async () => {
    await setupElement(false, 'value');
    const clearButtonWrapper = container.querySelector(
      '[part="clear-button-wrapper"]'
    );
    expect(clearButtonWrapper).toBeInTheDocument();
  });
});

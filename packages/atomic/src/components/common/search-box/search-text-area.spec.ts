import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {userEvent} from '@vitest/browser/context';
import {html} from 'lit';
import {createRef} from 'lit/directives/ref.js';
import {vi, expect} from 'vitest';
import {renderSearchBoxTextArea} from './search-text-area';

describe('#renderSearchBoxTextArea', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = (
    overrides: Partial<
      Parameters<typeof renderSearchBoxTextArea>[0]['props']
    > = {}
  ) => {
    return renderFunctionFixture(
      html`${renderSearchBoxTextArea({
        props: {
          i18n,
          textAreaRef: createRef<HTMLTextAreaElement>(),
          loading: false,
          value: '',
          ariaLabel: 'Search',
          title: 'Search',
          onClear: vi.fn(),
          popup: {
            id: 'popup-id',
            activeDescendant: 'active-descendant',
            expanded: true,
            hasSuggestions: true,
          },
          onInput: vi.fn(),
          onFocus: vi.fn(),
          onBlur: vi.fn(),
          onChange: vi.fn(),
          onKeyDown: vi.fn(),
          onKeyUp: vi.fn(),
          ...overrides,
        },
      })}`
    );
  };

  const getElement = async (
    overrides: Partial<
      Parameters<typeof renderSearchBoxTextArea>[0]['props']
    > = {}
  ) => {
    const element = await renderComponent(overrides);
    const textarea = element.querySelector('textarea[part="textarea"]');
    const expander = element.querySelector('div[part="textarea-expander"]');
    const clearButton = element.querySelector(
      'div[part="clear-button-wrapper"]'
    );
    const loadingSpinner = element.querySelector('span[part="loading"]');
    return {element, textarea, expander, clearButton, loadingSpinner};
  };

  it('should have the "textarea-expander" part on the container', async () => {
    const {expander} = await getElement();
    expect(expander!).toBeInTheDocument();
  });

  it('should have the right title on the textarea', async () => {
    const {textarea} = await getElement({title: 'Test Title'});
    expect(textarea!).toHaveAttribute('title', 'Test Title');
  });

  it('should have the "textarea" part on the textarea', async () => {
    const {textarea} = await getElement();
    expect(textarea!).toBeInTheDocument();
  });

  it('should have the right aria-label on the textarea', async () => {
    const {textarea} = await getElement({ariaLabel: 'Test Aria Label'});
    expect(textarea!).toHaveAttribute('aria-label', 'Test Aria Label');
  });

  it('should have the right placeholder on the textarea', async () => {
    const {textarea} = await getElement();
    expect(textarea!).toHaveAttribute('placeholder', 'Search');
  });

  it('should sync the text with the replica when filling text', async () => {
    const {textarea, expander} = await getElement();
    await userEvent.fill(textarea!, 'Test input');
    expect(expander!).toHaveAttribute('data-replicated-value', 'Test input');
  });

  it('should collapse the text area on blur event', async () => {
    const {textarea, expander} = await getElement();
    await userEvent.click(textarea!);
    expect(expander).toHaveClass('expanded');
    await userEvent.click(document.body);
    expect(expander).not.toHaveClass('expanded');
  });

  it('should expand the text area on focus event', async () => {
    const {textarea, expander} = await getElement();
    await userEvent.click(textarea!);
    expect(expander).toHaveClass('expanded');
  });

  it('should have the right active descendant', async () => {
    const {textarea} = await getElement({
      popup: {
        activeDescendant: 'test-active-descendant',
        id: '',
        expanded: false,
        hasSuggestions: false,
      },
    });
    expect(textarea).toHaveAttribute(
      'aria-activedescendant',
      'test-active-descendant'
    );
  });

  it('should have the right aria-controls', async () => {
    const {textarea} = await getElement({
      popup: {
        activeDescendant: '',
        id: 'test-id',
        expanded: false,
        hasSuggestions: false,
      },
    });
    expect(textarea).toHaveAttribute('aria-controls', 'test-id');
  });

  it('should show the loading spinner when loading is true', async () => {
    const {loadingSpinner} = await getElement({loading: true});
    expect(loadingSpinner!).toBeInTheDocument();
  });

  it('should have the "loading" part on the loading spinner', async () => {
    const {loadingSpinner} = await getElement({loading: true});
    expect(loadingSpinner).toHaveAttribute('part', 'loading');
  });

  it('should show the text area clear button when loading is false and value is not empty', async () => {
    const {clearButton} = await getElement({loading: false, value: 'Test'});
    expect(clearButton).toBeInTheDocument();
  });

  it('should reset the replica value when clicking the clear button', async () => {
    const {textarea, expander, clearButton} = await getElement({
      loading: false,
      value: 'Test',
    });

    await userEvent.fill(textarea!, 'Test input');
    expect(expander).toHaveAttribute('data-replicated-value', 'Test input');
    if (textarea instanceof HTMLTextAreaElement) {
      textarea.value = '';
    }
    await userEvent.click(clearButton!);
    expect(expander).toHaveAttribute('data-replicated-value', '');
  });
});

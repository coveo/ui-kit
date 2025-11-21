import type {SmartSnippetFeedback} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderModalOption} from './modal-option';

describe('#renderModalOption', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const correspondingAnswer: SmartSnippetFeedback = 'does_not_answer';
  const id = 'test-option-id';
  const localeKey = 'smart-snippet-feedback-reason-does-not-answer';
  const onChange = vi.fn();

  const renderComponent = async (
    currentAnswer?: SmartSnippetFeedback | 'other'
  ) => {
    return await renderFunctionFixture(
      html`${renderModalOption({
        props: {
          correspondingAnswer,
          currentAnswer,
          i18n,
          id,
          localeKey,
          onChange,
        },
      })}`
    );
  };

  it('should render with valid props', async () => {
    const element = await renderComponent();
    expect(element).toBeDefined();
  });

  it('should render container div with correct part', async () => {
    const element = await renderComponent();
    const container = element.querySelector('[part="reason"]');

    expect(container).not.toBeNull();
    expect(container?.tagName).toBe('DIV');
    expect(container).toHaveClass('flex', 'items-center');
  });

  it('should render radio input with correct attributes', async () => {
    const element = await renderComponent();
    const radio = element.querySelector('input[type="radio"]');

    expect(radio).not.toBeNull();
    expect(radio?.getAttribute('id')).toBe(id);
    expect(radio?.getAttribute('name')).toBe('answer');
    expect(radio?.part).toContain('reason-radio');
    expect(radio).toHaveClass('mr-2', 'h-4', 'w-4');
    expect(radio?.hasAttribute('required')).toBe(true);
  });

  it('should render label with correct attributes', async () => {
    const element = await renderComponent();
    const label = element.querySelector('label');

    expect(label).not.toBeNull();
    expect(label?.getAttribute('for')).toBe(id);
    expect(label?.part).toContain('reason-label');
  });

  it('should render translated label text', async () => {
    const element = await renderComponent();
    const label = element.querySelector('label');

    expect(label).toHaveTextContent(i18n.t(localeKey));
  });

  it('should not be checked when currentAnswer does not match', async () => {
    const element = await renderComponent('other');
    const radio = element.querySelector(
      'input[type="radio"]'
    ) as HTMLInputElement;

    expect(radio.checked).toBe(false);
  });

  it('should be checked when currentAnswer matches correspondingAnswer', async () => {
    const element = await renderComponent(correspondingAnswer);
    const radio = element.querySelector(
      'input[type="radio"]'
    ) as HTMLInputElement;

    expect(radio.checked).toBe(true);
  });

  it('should call onChange when radio is changed', async () => {
    const element = await renderComponent();
    const radio = element.querySelector(
      'input[type="radio"]'
    ) as HTMLInputElement;

    radio.dispatchEvent(new Event('change'));

    expect(onChange).toHaveBeenCalled();
  });
});

import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderModalFooter} from './modal-footer';

describe('#renderModalFooter', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const formId = 'test-form-id';
  const onClick = vi.fn();

  const renderComponent = async () => {
    return await renderFunctionFixture(
      html`${renderModalFooter({
        props: {formId, i18n, onClick},
      })}`
    );
  };

  it('should render with valid props', async () => {
    const element = await renderComponent();
    expect(element).toBeDefined();
  });

  it('should render container div with correct attributes', async () => {
    const element = await renderComponent();
    const container = element.querySelector('[part="buttons"]');

    expect(container).not.toBeNull();
    expect(container?.tagName).toBe('DIV');
    expect(container?.getAttribute('slot')).toBe('footer');
    expect(container).toHaveClass('flex', 'justify-end', 'gap-2');
  });

  it('should render cancel button with correct part', async () => {
    const element = await renderComponent();
    const cancelButton = element.querySelector('[part="cancel-button"]');

    expect(cancelButton).not.toBeNull();
    expect(cancelButton?.tagName).toBe('BUTTON');
  });

  it('should render cancel button with translated text', async () => {
    const element = await renderComponent();
    const cancelButton = element.querySelector('[part="cancel-button"]');

    expect(cancelButton).toHaveTextContent(i18n.t('cancel'));
  });

  it('should call onClick when cancel button is clicked', async () => {
    const element = await renderComponent();
    const cancelButton = element.querySelector(
      '[part="cancel-button"]'
    ) as HTMLButtonElement;

    cancelButton.click();

    expect(onClick).toHaveBeenCalled();
  });

  it('should render submit button with correct part and attributes', async () => {
    const element = await renderComponent();
    const submitButton = element.querySelector('[part="submit-button"]');

    expect(submitButton).not.toBeNull();
    expect(submitButton?.tagName).toBe('BUTTON');
    expect(submitButton?.getAttribute('type')).toBe('submit');
    expect(submitButton?.getAttribute('form')).toBe(formId);
  });

  it('should render submit button with translated text', async () => {
    const element = await renderComponent();
    const submitButton = element.querySelector('[part="submit-button"]');

    expect(submitButton).toHaveTextContent(i18n.t('feedback-send'));
  });
});

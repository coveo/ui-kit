import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {type CancelProps, renderCancel} from './cancel';

describe('#renderCancel', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const locators = (element: Element) => ({
    get button() {
      return element.querySelector('button[part="cancel-button"]');
    },
  });

  const renderComponent = async (props: Partial<CancelProps> = {}) => {
    return await renderFunctionFixture(
      html`${renderCancel({
        props: {
          i18n,
          onClick: vi.fn(),
          ...props,
        },
      })}`
    );
  };

  it('should render with valid props', async () => {
    const element = await renderComponent();
    expect(element).toBeDefined();
  });

  it('should render button with the correct part', async () => {
    const element = await renderComponent();
    const button = locators(element).button;

    expect(button).not.toBeNull();
    expect(button?.tagName).toBe('BUTTON');
    expect(button?.part).toContain('cancel-button');
  });

  it('should render button with correct text', async () => {
    const element = await renderComponent();
    const button = locators(element).button;

    expect(button).toHaveTextContent('Cancel last action');
  });

  it('should render button with primary style', async () => {
    const element = await renderComponent();
    const button = locators(element).button;

    expect(button?.classList).toContain('btn-primary');
  });

  it('should render button with correct classes', async () => {
    const element = await renderComponent();
    const button = locators(element).button;

    expect(button).toHaveClass('my-3', 'px-2.5', 'py-3', 'font-bold');
  });

  it('should call onClick when button is clicked', async () => {
    const handleClick = vi.fn();
    const element = await renderComponent({onClick: handleClick});
    const button = locators(element).button as HTMLButtonElement;

    button.click();

    expect(handleClick).toHaveBeenCalledOnce();
  });
});

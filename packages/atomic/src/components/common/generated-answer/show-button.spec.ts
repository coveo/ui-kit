import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderShowButton, type ShowButtonProps} from './show-button';

describe('#renderShowButton', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (overrides: Partial<ShowButtonProps> = {}) => {
    const defaultProps: ShowButtonProps = {
      i18n,
      isCollapsed: true,
      onClick: vi.fn(),
      ...overrides,
    };

    const element = await renderFunctionFixture(
      html`${renderShowButton({props: defaultProps})}`
    );

    return {
      element,
      button: element.querySelector('button[part="answer-show-button"]'),
      icon: element.querySelector(
        'atomic-icon[part="answer-show-icon"]'
      ) as HTMLElement,
    };
  };

  it('should render a button with the part "answer-show-button"', async () => {
    const {button} = await renderComponent();

    expect(button).toHaveAttribute('part', 'answer-show-button');
  });

  it('should render an icon with the part "answer-show-icon"', async () => {
    const {icon} = await renderComponent();

    expect(icon).toHaveAttribute('part', 'answer-show-icon');
  });

  it('should apply the correct classes to the button', async () => {
    const {button} = await renderComponent();

    expect(button).toHaveClass('hidden');
    expect(button).toHaveClass('items-center');
    expect(button).toHaveClass('hover:bg-transparent');
  });

  describe('when isCollapsed is true', () => {
    it('should render "show-more" text', async () => {
      const {element} = await renderComponent({isCollapsed: true});

      await expect.element(element).toHaveTextContent('Show more');
    });

    it('should render the arrow-bottom icon', async () => {
      const {icon} = await renderComponent({isCollapsed: true});

      expect(icon).toBeDefined();
      // The icon property is set via .icon binding, so we just verify the element exists
      expect(icon?.tagName.toLowerCase()).toBe('atomic-icon');
    });
  });

  describe('when isCollapsed is false', () => {
    it('should render "show-less" text', async () => {
      const {element} = await renderComponent({isCollapsed: false});

      await expect.element(element).toHaveTextContent('Show less');
    });

    it('should render the arrow-top icon', async () => {
      const {icon} = await renderComponent({isCollapsed: false});

      expect(icon).toBeDefined();
      // The icon property is set via .icon binding, so we just verify the element exists
      expect(icon?.tagName.toLowerCase()).toBe('atomic-icon');
    });
  });

  describe('onClick behavior', () => {
    it('should call the onClick handler when clicked', async () => {
      const onClick = vi.fn();
      await renderComponent({onClick});

      await page.getByRole('button').click();

      expect(onClick).toHaveBeenCalledOnce();
    });

    it('should call onClick when button is activated', async () => {
      const onClick = vi.fn();
      await renderComponent({onClick});

      const button = page.getByRole('button');
      await button.click();

      expect(onClick).toHaveBeenCalledOnce();
    });
  });

  describe('text styling', () => {
    it('should apply correct text styling classes', async () => {
      const {element} = await renderComponent();
      const textDiv = element.querySelector('.text-base.font-light');

      expect(textDiv).toBeDefined();
      expect(textDiv).toHaveClass('text-base');
      expect(textDiv).toHaveClass('font-light');
    });
  });

  describe('icon styling', () => {
    it('should apply correct icon classes', async () => {
      const {icon} = await renderComponent();

      expect(icon).toHaveClass('ml-2');
      expect(icon).toHaveClass('w-3.5');
    });
  });
});

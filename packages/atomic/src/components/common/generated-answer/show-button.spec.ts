import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import ArrowBottomIcon from '../../../images/arrow-bottom-rounded.svg';
import ArrowTopIcon from '../../../images/arrow-top-rounded.svg';
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

  describe('when isCollapsed is true', () => {
    it('should render "show-more" text', async () => {
      const {element} = await renderComponent({isCollapsed: true});

      await expect.element(element).toHaveTextContent('Show more');
    });

    it('should render the arrow-bottom icon', async () => {
      const {icon} = await renderComponent({isCollapsed: true});

      expect(icon).toHaveAttribute('icon', ArrowBottomIcon);
    });
  });

  describe('when isCollapsed is false', () => {
    it('should render "show-less" text', async () => {
      const {element} = await renderComponent({isCollapsed: false});

      await expect.element(element).toHaveTextContent('Show less');
    });

    it('should render the arrow-top icon', async () => {
      const {icon} = await renderComponent({isCollapsed: false});

      expect(icon).toHaveAttribute('icon', ArrowTopIcon);
    });
  });

  it('should call the onClick handler when clicked', async () => {
    const onClick = vi.fn();
    const {button} = await renderComponent({onClick});
    button?.classList.remove('hidden');
    await page.getByRole('button').click();

    expect(onClick).toHaveBeenCalledOnce();
  });
});

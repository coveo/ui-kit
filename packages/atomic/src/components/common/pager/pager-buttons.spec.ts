import type {i18n as I18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import ArrowLeftIcon from '../../../images/arrow-left-rounded.svg';
import ArrowRightIcon from '../../../images/arrow-right-rounded.svg';
import {
  renderPageButtons,
  renderPagerNextButton,
  renderPagerPageButton,
  renderPagerPreviousButton,
} from './pager-buttons';

describe('pagerButtons', () => {
  let i18n: I18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  describe('pagerPreviousButton', () => {
    it('should render the button with the correct attributes', async () => {
      const element = await renderFunctionFixture(
        html`
          ${renderPagerPreviousButton({
            props: {
              i18n,
              icon: ArrowLeftIcon,
            },
          })}
        `
      );

      const button = element.querySelector('button');
      expect(button).toHaveAttribute('aria-label', 'Previous');
      expect(button).toHaveClass('btn-outline-primary');
      expect(button).toHaveAttribute('part', 'previous-button');
    });

    it('should render the icon with the correct attributes', async () => {
      const element = await renderFunctionFixture(
        html`
          ${renderPagerPreviousButton({
            props: {
              i18n,
              icon: ArrowLeftIcon,
            },
          })}
        `
      );

      const icon = element.querySelector('atomic-icon');
      expect(icon).toHaveAttribute('part', 'previous-button-icon');
    });
  });

  describe('pagerNextButton', () => {
    it('should render the button with the correct attributes', async () => {
      const element = await renderFunctionFixture(
        html`
          ${renderPagerNextButton({
            props: {
              i18n,
              icon: ArrowRightIcon,
            },
          })}
        `
      );

      const button = element.querySelector('button');
      expect(button).toHaveAttribute('aria-label', 'Next');
      expect(button).toHaveClass('btn-outline-primary');
      expect(button).toHaveAttribute('part', 'next-button');
    });

    it('should render the icon with the correct attributes', async () => {
      const element = await renderFunctionFixture(
        html`
          ${renderPagerNextButton({
            props: {
              i18n,
              icon: ArrowRightIcon,
            },
          })}
        `
      );

      const icon = element.querySelector('atomic-icon');
      expect(icon).toHaveClass('w-5');
    });
  });

  describe('pagerPageButton', () => {
    it('should render the button with the correct attributes', async () => {
      const element = await renderFunctionFixture(
        html`
          ${renderPagerPageButton({
            props: {
              groupName: 'pager',
              page: 1,
              isSelected: false,
              text: '1',
            },
          })}
        `
      );

      const input = element.querySelector('input');
      expect(input).toHaveAttribute('aria-label', '1');
      expect(input).toHaveAttribute('type', 'radio');
      expect(input).toHaveAttribute('name', 'pager');
      expect(input).toHaveAttribute('value', '1');
    });

    it('should render with the correct attributes when not selected', async () => {
      const element = await renderFunctionFixture(
        html`
          ${renderPagerPageButton({
            props: {
              groupName: 'pager',
              page: 1,
              isSelected: false,
              text: '1',
            },
          })}
        `
      );

      const input = element.querySelector('input');
      expect(input).toHaveAttribute('aria-current', 'false');
      expect(input).toHaveAttribute('part', 'page-button');
    });

    it('should render with the correct attributes when selected', async () => {
      const element = await renderFunctionFixture(
        html`
          ${renderPagerPageButton({
            props: {
              groupName: 'pager',
              page: 1,
              isSelected: true,
              text: '1',
            },
          })}
        `
      );

      const input = element.querySelector('input');
      expect(input).toHaveAttribute('aria-current', 'page');
      expect(input).toHaveAttribute('part', 'page-button active-page-button');
    });
  });

  describe('pagerPageButtons', () => {
    it('should render the list of buttons with the correct attributes', async () => {
      const element = await renderFunctionFixture(
        html`
          ${renderPageButtons({
            props: {
              i18n,
            },
          })(html`
            ${renderPagerPageButton({
              props: {groupName: 'pager', page: 1, isSelected: true, text: '1'},
            })}
            ${renderPagerPageButton({
              props: {
                groupName: 'pager',
                page: 2,
                isSelected: false,
                text: '2',
              },
            })}
          `)}
        `
      );

      const div = element.querySelector('div');
      expect(div).toHaveAttribute('role', 'radiogroup');
      expect(div).toHaveAttribute('aria-label', 'Pagination');
      expect(div).toHaveAttribute('part', 'page-buttons');
    });

    it('should render the list of children', async () => {
      const element = await renderFunctionFixture(
        html`
          ${renderPageButtons({
            props: {
              i18n,
            },
          })(html`
            ${renderPagerPageButton({
              props: {groupName: 'pager', page: 1, isSelected: true, text: '1'},
            })}
            ${renderPagerPageButton({
              props: {
                groupName: 'pager',
                page: 2,
                isSelected: false,
                text: '2',
              },
            })}
          `)}
        `
      );

      const inputs = element.querySelectorAll('input');
      expect(inputs).toHaveLength(2);
    });
  });

  describe('accessibility', () => {
    it('should render with aria-roledescription set to link', async () => {
      const element = await renderFunctionFixture(
        html`
          ${renderPagerPageButton({
            props: {
              groupName: 'pager',
              page: 1,
              isSelected: false,
              text: '1',
            },
          })}
        `
      );

      const input = element.querySelector('input');
      expect(input).toHaveAttribute('aria-roledescription', 'link');
    });

    it('should change focus target when input is tab', async () => {
      const onFocusCallback = vi.fn().mockResolvedValue(undefined);

      const element = await renderFunctionFixture(
        html`
          ${renderPagerPageButton({
            props: {
              groupName: 'pager',
              page: 1,
              isSelected: false,
              text: '1',
              onFocusCallback,
            },
          })}${renderPagerPageButton({
            props: {
              groupName: 'pager',
              page: 2,
              isSelected: false,
              text: '2',
              onFocusCallback,
            },
          })}
        `
      );

      const elements = Array.from(element.querySelectorAll('[type="radio"]'));
      elements[0].dispatchEvent(
        new KeyboardEvent('keydown', {key: 'Tab', bubbles: true})
      );

      await vi.waitFor(() => {
        expect(onFocusCallback).toHaveBeenCalledTimes(1);
        expect(onFocusCallback).toHaveBeenCalledWith(
          elements,
          elements[0],
          elements[1]
        );
      });
    });
    it('should change focus target when input is shift + tab', async () => {
      const onFocusCallback = vi.fn().mockResolvedValue(undefined);

      const element = await renderFunctionFixture(
        html`
          ${renderPagerPageButton({
            props: {
              groupName: 'pager',
              page: 1,
              isSelected: false,
              text: '1',
              onFocusCallback,
            },
          })}${renderPagerPageButton({
            props: {
              groupName: 'pager',
              page: 2,
              isSelected: false,
              text: '2',
              onFocusCallback,
            },
          })}
        `
      );

      const elements = Array.from(element.querySelectorAll('[type="radio"]'));
      elements[1].dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Tab',
          bubbles: true,
          shiftKey: true,
        })
      );

      await vi.waitFor(() => {
        expect(onFocusCallback).toHaveBeenCalledTimes(1);
        expect(onFocusCallback).toHaveBeenCalledWith(
          elements,
          elements[1],
          elements[0]
        );
      });
    });
  });
});

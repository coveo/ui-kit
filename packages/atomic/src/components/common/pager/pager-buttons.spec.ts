import type {i18n as I18n} from 'i18next';
import {html, render} from 'lit';
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest';
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
  let container: HTMLElement;
  let i18n: I18n;

  describe('pagerPreviousButton', () => {
    beforeEach(async () => {
      i18n = await createTestI18n();
      container = document.createElement('div');
      document.body.appendChild(container);

      render(
        html`
          ${renderPagerPreviousButton({
            props: {
              i18n,
              icon: ArrowLeftIcon,
            },
          })}
        `,
        container
      );
    });

    afterEach(() => {
      document.body.removeChild(container);
    });

    test('should render the button with the correct attributes', () => {
      const button = container.querySelector('button');
      expect(button).toHaveAttribute('aria-label', 'Previous');
      expect(button).toHaveClass('btn-outline-primary');
      expect(button).toHaveAttribute('part', 'previous-button');
    });

    test('should render the icon with the correct attributes', () => {
      const icon = container.querySelector('atomic-icon');
      expect(icon).toHaveAttribute('part', 'previous-button-icon');
    });
  });

  describe('pagerNextButton', () => {
    beforeEach(async () => {
      i18n = await createTestI18n();
      container = document.createElement('div');
      document.body.appendChild(container);
      render(
        html`
          ${renderPagerNextButton({
            props: {
              i18n,
              icon: ArrowRightIcon,
            },
          })}
        `,
        container
      );
    });

    afterEach(() => {
      document.body.removeChild(container);
    });

    test('should render the button with the correct attributes', () => {
      const button = container.querySelector('button');
      expect(button).toHaveAttribute('aria-label', 'Next');
      expect(button).toHaveClass('btn-outline-primary');
      expect(button).toHaveAttribute('part', 'next-button');
    });

    test('should render the icon with the correct attributes', () => {
      const icon = container.querySelector('atomic-icon');
      expect(icon).toHaveClass('w-5');
    });
  });

  describe('pagerPageButton', () => {
    beforeEach(async () => {
      i18n = await createTestI18n();
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.removeChild(container);
    });

    test('should render the button with the correct attributes', () => {
      render(
        html`
          ${renderPagerPageButton({
            props: {
              groupName: 'pager',
              page: 1,
              isSelected: false,
              text: '1',
            },
          })}
        `,
        container
      );

      const input = container.querySelector('input');
      expect(input).toHaveAttribute('aria-label', '1');
      expect(input).toHaveAttribute('type', 'radio');
      expect(input).toHaveAttribute('name', 'pager');
      expect(input).toHaveAttribute('value', '1');
    });

    test('should render with the correct attributes when not selected', () => {
      render(
        html`
          ${renderPagerPageButton({
            props: {
              groupName: 'pager',
              page: 1,
              isSelected: false,
              text: '1',
            },
          })}
        `,
        container
      );

      const input = container.querySelector('input');
      expect(input).toHaveAttribute('aria-current', 'false');
      expect(input).toHaveAttribute('part', 'page-button');
    });

    test('should render with the correct attributes when selected', () => {
      render(
        html`
          ${renderPagerPageButton({
            props: {
              groupName: 'pager',
              page: 1,
              isSelected: true,
              text: '1',
            },
          })}
        `,
        container
      );

      const input = container.querySelector('input');
      expect(input).toHaveAttribute('aria-current', 'page');
      expect(input).toHaveAttribute('part', 'page-button active-page-button');
    });
  });

  describe('pagerPageButtons', () => {
    beforeEach(async () => {
      i18n = await createTestI18n();
      container = document.createElement('div');
      document.body.appendChild(container);
      render(
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
        `,
        container
      );
    });

    afterEach(() => {
      document.body.removeChild(container);
    });

    test('should render the list of buttons with the correct attributes', () => {
      const div = container.querySelector('div');
      expect(div).toHaveAttribute('role', 'radiogroup');
      expect(div).toHaveAttribute('aria-label', 'Pagination');
      expect(div).toHaveAttribute('part', 'page-buttons');
    });

    test('should render the list of children', () => {
      const inputs = container.querySelectorAll('input');
      expect(inputs).toHaveLength(2);
    });
  });

  describe('accessibility', () => {
    beforeEach(async () => {
      i18n = await createTestI18n();
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    test('should render with aria-roledescription set to link', () => {
      render(
        html`
          ${renderPagerPageButton({
            props: {
              groupName: 'pager',
              page: 1,
              isSelected: false,
              text: '1',
            },
          })}
        `,
        container
      );

      const input = container.querySelector('input');
      expect(input).toHaveAttribute('aria-roledescription', 'link');
    });

    test('should change focus target when input is tab', async () => {
      const onFocusCallback = vi.fn().mockResolvedValue(undefined);

      render(
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
        `,
        container
      );

      const elements = Array.from(container.querySelectorAll('[type="radio"]'));
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
    test('should change focus target when input is shift + tab', async () => {
      const onFocusCallback = vi.fn().mockResolvedValue(undefined);

      render(
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
        `,
        container
      );

      const elements = Array.from(container.querySelectorAll('[type="radio"]'));
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

import type {i18n as I18n} from 'i18next';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {encodeForDomAttribute} from '@/src/utils/string-utils';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  getPartialInstantItemElement,
  getPartialInstantItemShowAllElement,
  renderInstantItemShowAllButton,
} from './instant-item';

vi.mock('../../../utils/string-utils', {spy: true});

describe('instant-item', () => {
  describe('#getPartialInstantItemElement', () => {
    let i18n: I18n;

    beforeAll(async () => {
      i18n = await createTestI18n();
    });

    it('should return the correct object structure', () => {
      const result = getPartialInstantItemElement(
        i18n,
        'itemTitle',
        'itemUniqueId'
      );

      expect(result).toEqual({
        ariaLabel: 'itemTitle, instant result',
        key: 'instant-result-itemUniqueId',
        part: 'instant-results-item',
      });
    });

    it('should call encodeForDomAttribute with the itemUniqueId', () => {
      const itemUniqueId = 'itemUniqueId';
      getPartialInstantItemElement(i18n, 'itemTitle', itemUniqueId);

      expect(encodeForDomAttribute).toHaveBeenCalledWith(itemUniqueId);
    });
  });

  describe('#getPartialInstantItemShowAllElement', () => {
    let i18n: I18n;

    beforeAll(async () => {
      i18n = await createTestI18n();
    });

    it('should return the correct object structure', () => {
      const result = getPartialInstantItemShowAllElement(i18n);

      expect(result).toEqual({
        key: 'instant-results-show-all-button',
        part: 'instant-results-show-all',
        ariaLabel: 'See all results',
      });
    });
  });

  describe('#renderInstantItemShowAllButton', () => {
    let i18n: I18n;

    beforeAll(async () => {
      i18n = await createTestI18n();
    });

    it('should render the button with the correct text', () => {
      const button = renderInstantItemShowAllButton({i18n});

      expect(button).toBeInstanceOf(HTMLElement);
      expect(button.textContent?.trim()).toBe('See all results');
      expect(button.getAttribute('part')).toBe(
        'instant-results-show-all-button'
      );
    });

    it('should have the correct class for button style', () => {
      const button = renderInstantItemShowAllButton({i18n});

      expect(button.classList.contains('btn-text-primary')).toBe(true);
    });

    it('should have the correct part', () => {
      const button = renderInstantItemShowAllButton({i18n});

      expect(button.getAttribute('part')).toBe(
        'instant-results-show-all-button'
      );
    });
  });
});

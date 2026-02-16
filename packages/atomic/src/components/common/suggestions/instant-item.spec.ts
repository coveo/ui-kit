import type {i18n as I18n} from 'i18next';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {encodeForDomAttribute} from '@/src/utils/string-utils';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  getPartialInstantItemElement,
  getPartialInstantItemShowAllElement,
  renderInstantItemShowAllButton,
} from './instant-item';

vi.mock('@/src/utils/string-utils', {spy: true});

describe('instant-item', () => {
  describe('#getPartialInstantItemElement', () => {
    let i18n: I18n;

    beforeAll(async () => {
      i18n = await createTestI18n();
    });

    it('should return the correct object structure', () => {
      const result = getPartialInstantItemElement(
        i18n,
        'instant-products-suggestion-label',
        'itemTitle',
        'itemUniqueId'
      );

      expect(result).toEqual({
        ariaLabel: 'itemTitle, instant product',
        key: 'instant-result-itemUniqueId',
        part: 'instant-results-item',
      });
    });

    it('should call encodeForDomAttribute with the itemUniqueId', () => {
      const itemUniqueId = 'itemUniqueId';
      getPartialInstantItemElement(
        i18n,
        'instant-products-suggestion-label',
        'itemTitle',
        itemUniqueId
      );

      expect(encodeForDomAttribute).toHaveBeenCalledWith(itemUniqueId);
    });
  });

  describe('#getPartialInstantItemShowAllElement', () => {
    let i18n: I18n;

    beforeAll(async () => {
      i18n = await createTestI18n();
    });

    it('should return the correct object structure', () => {
      const result = getPartialInstantItemShowAllElement(
        i18n,
        'show-all-products'
      );

      expect(result).toEqual({
        key: 'instant-results-show-all-button',
        part: 'instant-results-show-all',
        ariaLabel: 'See all products',
      });
    });
  });

  describe('#renderInstantItemShowAllButton', () => {
    let i18n: I18n;

    beforeAll(async () => {
      i18n = await createTestI18n();
    });

    it('should render the button with the correct text', () => {
      const button = renderInstantItemShowAllButton({
        i18n,
        i18nKey: 'show-all-products',
      });

      expect(button).toBeInstanceOf(HTMLElement);
      expect(button.textContent?.trim()).toBe('See all products');
      expect(button.getAttribute('part')).toBe(
        'instant-results-show-all-button'
      );
    });

    it('should have the correct class for button style', () => {
      const button = renderInstantItemShowAllButton({
        i18n,
        i18nKey: 'show-all-products',
      });

      expect(button.classList.contains('btn-text-primary')).toBe(true);
    });

    it('should have the correct part', () => {
      const button = renderInstantItemShowAllButton({
        i18n,
        i18nKey: 'show-all-products',
      });

      expect(button.getAttribute('part')).toBe(
        'instant-results-show-all-button'
      );
    });

    it('should have pointer-events-none class to allow clicks on parent', () => {
      const button = renderInstantItemShowAllButton({
        i18n,
        i18nKey: 'show-all-products',
      });

      expect(button.classList.contains('pointer-events-none')).toBe(true);
    });
  });
});

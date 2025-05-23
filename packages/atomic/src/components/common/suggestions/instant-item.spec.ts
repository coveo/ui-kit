import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {i18n as I18n} from 'i18next';
import {describe, beforeAll, it, expect, vi} from 'vitest';
import {
  getPartialInstantItemElement,
  getPartialInstantItemShowAllElement,
  renderInstantItemShowAllButton,
} from './instant-item';

vi.mock('../../../utils/string-utils', () => ({
  encodeForDomAttribute: vi.fn((value) => value),
}));

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
    const encodeForDomAttribute = (value: string) => value;
    const itemUniqueId = 'itemUniqueId';
    const result = getPartialInstantItemElement(
      i18n,
      'itemTitle',
      itemUniqueId
    );

    expect(result.key).toBe(
      `instant-result-${encodeForDomAttribute(itemUniqueId)}`
    );
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
    expect(button.getAttribute('part')).toBe('instant-results-show-all-button');
  });

  it('should have the correct class for button style', () => {
    const button = renderInstantItemShowAllButton({i18n});

    expect(button.classList.contains('btn-text-primary')).toBe(true);
  });

  it('should have the correct part', () => {
    const button = renderInstantItemShowAllButton({i18n});

    expect(button.getAttribute('part')).toBe('instant-results-show-all-button');
  });
});

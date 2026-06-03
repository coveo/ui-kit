import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {type RatingProps, renderRating} from './rating';

describe('#renderRating', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (overrides: Partial<RatingProps> = {}) => {
    const defaultProps: RatingProps = {
      i18n,
      numberOfTotalIcons: 5,
      numberOfActiveIcons: 3,
      icon: '<svg>star</svg>',
      ...overrides,
    };

    const element = await renderFunctionFixture(
      html`${renderRating({props: defaultProps})}`
    );

    return {
      ratingContainer: element.querySelector('div[part="value-rating"]'),
      inactiveIcons: element.querySelectorAll('.z-0 atomic-icon'),
      activeIconsContainer: element.querySelector('.z-1'),
      activeIcons: element.querySelectorAll('.z-1 atomic-icon'),
      allIcons: element.querySelectorAll('atomic-icon'),
    };
  };

  it('should render the rating container with correct part', async () => {
    const {ratingContainer} = await renderComponent();

    expect(ratingContainer).toHaveAttribute('part', 'value-rating');
  });

  it('should render the rating container with role img', async () => {
    const {ratingContainer} = await renderComponent();

    expect(ratingContainer).toHaveAttribute('role', 'img');
  });

  it('should render correct aria-label from i18n', async () => {
    const {ratingContainer} = await renderComponent({
      numberOfActiveIcons: 4,
      numberOfTotalIcons: 5,
    });

    expect(ratingContainer).toHaveAttribute('aria-label', '4 stars out of 5');
  });

  it('should render correct number of total icons', async () => {
    const {allIcons} = await renderComponent({numberOfTotalIcons: 7});

    expect(allIcons).toHaveLength(14); // 7 inactive + 7 active
  });

  it('should render inactive icons with correct class', async () => {
    const {inactiveIcons} = await renderComponent();

    inactiveIcons.forEach((icon) => {
      expect(icon).toHaveClass('text-rating-icon-inactive');
    });
  });

  it('should render active icons with correct class', async () => {
    const {activeIcons} = await renderComponent();

    activeIcons.forEach((icon) => {
      expect(icon).toHaveClass('text-rating-icon-active');
    });
  });

  it('should set correct width percentage for active icons container', async () => {
    const {activeIconsContainer} = await renderComponent({
      numberOfActiveIcons: 3,
      numberOfTotalIcons: 5,
    });

    expect(activeIconsContainer).toHaveStyle('width: 60%');
  });

  it('should apply custom icon size when provided', async () => {
    const {allIcons} = await renderComponent({iconSize: 1.5});

    allIcons.forEach((icon) => {
      expect(icon).toHaveStyle('width: 1.5rem; height: 1.5rem');
    });
  });

  it('should use default icon size when not provided', async () => {
    const {allIcons} = await renderComponent();

    allIcons.forEach((icon) => {
      expect(icon).toHaveStyle('width: 0.75rem; height: 0.75rem');
    });
  });

  it('should render icons with correct part attribute', async () => {
    const {allIcons} = await renderComponent();

    allIcons.forEach((icon) => {
      expect(icon).toHaveAttribute('part', 'value-rating-icon');
    });
  });

  it('should handle zero active icons', async () => {
    const {activeIconsContainer} = await renderComponent({
      numberOfActiveIcons: 0,
    });

    expect(activeIconsContainer).toHaveStyle('width: 0%');
  });

  it('should handle full rating', async () => {
    const {activeIconsContainer} = await renderComponent({
      numberOfActiveIcons: 5,
      numberOfTotalIcons: 5,
    });

    expect(activeIconsContainer).toHaveStyle('width: 100%');
  });

  it('should handle fractional active icons', async () => {
    const {activeIconsContainer} = await renderComponent({
      numberOfActiveIcons: 3.7,
      numberOfTotalIcons: 5,
    });

    expect(activeIconsContainer).toHaveStyle('width: 74%');
  });
});

import type {Result} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicResult} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-result-fixture';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {AtomicResultRating} from './atomic-result-rating';
import './atomic-result-rating';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-result-rating', () => {
  let i18n: i18n;
  let mockResult: Result;

  const locators = {
    getRatingContainer: (element: AtomicResultRating) =>
      element?.querySelector('[part="value-rating"]'),
    getRatingIcons: (element: AtomicResultRating) =>
      element?.querySelectorAll('atomic-icon[part="value-rating-icon"]'),
    getFilledIconsContainer: (element: AtomicResultRating) =>
      element?.querySelector('.z-1'),
  };

  beforeEach(async () => {
    console.error = vi.fn();

    i18n = await createTestI18n();

    mockResult = buildFakeResult({
      raw: {
        snrating: 4.0,
        custom_rating: 3.5,
        invalid_rating: 'not-a-number',
        zero_rating: 0,
        null_rating: null,
      },
    });
  });

  const renderComponent = async (
    options: {
      field?: string;
      maxValueInIndex?: number;
      icon?: string;
      result?: Result | null;
    } = {}
  ) => {
    const resultToUse = 'result' in options ? options.result : mockResult;
    const {element} = await renderInAtomicResult<AtomicResultRating>({
      template: html`<atomic-result-rating
        field=${ifDefined(options.field)}
        max-value-in-index=${ifDefined(options.maxValueInIndex)}
        icon=${ifDefined(options.icon)}
      ></atomic-result-rating>`,
      selector: 'atomic-result-rating',
      result: resultToUse === null ? undefined : resultToUse,
      bindings: (bindings) => {
        bindings.i18n = i18n;
        return bindings;
      },
    });

    return element;
  };

  it('should be defined', () => {
    const el = document.createElement('atomic-result-rating');
    expect(el).toBeInstanceOf(AtomicResultRating);
  });

  describe('with default properties', () => {
    it('should render rating with specified field', async () => {
      const element = await renderComponent({field: 'snrating'});
      const ratingContainer = locators.getRatingContainer(element);

      expect(element).toBeDefined();
      expect(ratingContainer).toBeInTheDocument();
    });

    it('should use default maxValueInIndex of 5', async () => {
      const element = await renderComponent({field: 'snrating'});
      const icons = locators.getRatingIcons(element);

      expect(icons).toHaveLength(10); // 5 empty + 5 filled icons
    });

    it('should display rating for snrating field', async () => {
      const element = await renderComponent({field: 'snrating'}); // snrating: 4.0, maxValueInIndex: 5
      const ratingContainer = locators.getRatingContainer(element);

      expect(ratingContainer).toBeInTheDocument();
      expect(ratingContainer).toHaveAttribute('aria-label', '4 stars out of 5');
    });
  });

  describe('with custom field', () => {
    it('should render rating using custom field', async () => {
      const element = await renderComponent({field: 'custom_rating'});
      const ratingContainer = locators.getRatingContainer(element);

      expect(ratingContainer).toBeInTheDocument();
      expect(ratingContainer).toHaveAttribute(
        'aria-label',
        '3.5 stars out of 5'
      );
    });

    it('should render nothing when field value is null', async () => {
      const element = await renderComponent({field: 'null_rating'});
      const ratingContainer = locators.getRatingContainer(element);

      expect(ratingContainer).toBeNull();
      expect(element.textContent?.trim()).toBe('');
    });

    it('should handle zero rating', async () => {
      const element = await renderComponent({field: 'zero_rating'});
      const ratingContainer = locators.getRatingContainer(element);

      expect(ratingContainer).toBeInTheDocument();
      expect(ratingContainer).toHaveAttribute('aria-label', '0 stars out of 5');
    });
  });

  describe('with custom maxValueInIndex', () => {
    it('should render correct number of icons for custom max value', async () => {
      const element = await renderComponent({
        field: 'snrating',
        maxValueInIndex: 10,
      });
      const icons = locators.getRatingIcons(element);

      expect(icons).toHaveLength(20); // 10 empty + 10 filled icons
    });

    it('should display rating with custom max value', async () => {
      const element = await renderComponent({
        field: 'snrating',
        maxValueInIndex: 10,
      });
      const ratingContainer = locators.getRatingContainer(element);

      expect(ratingContainer).toBeInTheDocument();
      expect(ratingContainer).toHaveAttribute(
        'aria-label',
        '4 stars out of 10'
      );
    });
  });

  describe('with custom icon', () => {
    it('should use custom icon when provided', async () => {
      const customIcon = '<svg>custom-star</svg>';
      const element = await renderComponent({
        field: 'snrating',
        icon: customIcon,
      });
      const icons = locators.getRatingIcons(element);

      icons?.forEach((icon) => {
        expect(icon).toHaveAttribute('icon', customIcon);
      });
    });
  });

  describe('accessibility', () => {
    it('should have correct aria-label for rating', async () => {
      const element = await renderComponent({field: 'snrating'});
      const ratingContainer = locators.getRatingContainer(element);

      expect(ratingContainer).toHaveAttribute('aria-label', '4 stars out of 5');
    });

    it('should have role="img" for rating container', async () => {
      const element = await renderComponent({field: 'snrating'});
      const ratingContainer = locators.getRatingContainer(element);

      expect(ratingContainer).toHaveAttribute('role', 'img');
    });
  });

  describe('error handling', () => {
    it('should handle invalid field values gracefully', async () => {
      const element = await renderComponent({field: 'invalid_rating'});
      const ratingContainer = locators.getRatingContainer(element);

      // Should not render when there's an error
      expect(ratingContainer).toBeNull();
      expect(element.error).toBeDefined();
    });

    it('should handle missing result gracefully', async () => {
      const element = await renderComponent({field: 'snrating', result: null});
      const ratingContainer = locators.getRatingContainer(element);

      expect(ratingContainer).toBeNull();
      expect(element.textContent?.trim()).toBe('');
    });
  });

  describe('property reflection', () => {
    it('should reflect field property to attribute', async () => {
      const element = await renderComponent({field: 'custom_field'});

      expect(element).toHaveAttribute('field', 'custom_field');
    });

    it('should reflect max-value-in-index property to attribute', async () => {
      const element = await renderComponent({
        field: 'snrating',
        maxValueInIndex: 10,
      });

      expect(element).toHaveAttribute('max-value-in-index', '10');
    });

    it('should reflect icon property to attribute', async () => {
      const customIcon = 'custom-icon';
      const element = await renderComponent({
        field: 'snrating',
        icon: customIcon,
      });

      expect(element).toHaveAttribute('icon', customIcon);
    });
  });

  describe('component lifecycle', () => {
    it('should initialize correctly', async () => {
      const element = await renderComponent({field: 'snrating'});

      expect(element.bindings).toBeDefined();
    });

    it('should update when properties change', async () => {
      const element = await renderComponent({field: 'snrating'});

      // Change the field property
      element.field = 'custom_rating';
      await element.updateComplete;

      const ratingContainer = locators.getRatingContainer(element);
      expect(ratingContainer).toHaveAttribute(
        'aria-label',
        '3.5 stars out of 5'
      );
    });

    it('should update when maxValueInIndex changes', async () => {
      const element = await renderComponent({field: 'snrating'});

      // Change the maxValueInIndex property
      element.maxValueInIndex = 10;
      await element.updateComplete;

      const ratingContainer = locators.getRatingContainer(element);
      expect(ratingContainer).toHaveAttribute(
        'aria-label',
        '4 stars out of 10'
      );
    });
  });
});

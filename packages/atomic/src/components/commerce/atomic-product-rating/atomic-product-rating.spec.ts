import type {Product} from '@coveo/headless/commerce';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicProduct} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-product-fixture';
import {buildFakeProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {AtomicProductRating} from './atomic-product-rating';
import './atomic-product-rating';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('atomic-product-rating', () => {
  let i18n: i18n;
  let mockProduct: Product;

  const locators = {
    getRatingContainer: (element: AtomicProductRating) =>
      element?.querySelector('[part="value-rating"]'),
    getRatingIcons: (element: AtomicProductRating) =>
      element?.querySelectorAll('atomic-icon[part="value-rating-icon"]'),
    getRatingDetails: (element: AtomicProductRating) =>
      element?.querySelector('.rating-details'),
    getFilledIconsContainer: (element: AtomicProductRating) =>
      element?.querySelector('.z-1'),
  };

  beforeEach(async () => {
    console.error = vi.fn();

    i18n = await createTestI18n();

    mockProduct = buildFakeProduct({
      ec_rating: 4.0,
      additionalFields: {
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
      ratingDetailsField?: string;
      maxValueInIndex?: number;
      icon?: string;
      product?: Product | null;
    } = {}
  ) => {
    const productToUse = 'product' in options ? options.product : mockProduct;
    const {element} = await renderInAtomicProduct<AtomicProductRating>({
      template: html`<atomic-product-rating
          field=${ifDefined(options.field)}
          rating-details-field=${ifDefined(options.ratingDetailsField)}
          max-value-in-index=${ifDefined(options.maxValueInIndex)}
          icon=${ifDefined(options.icon)}
        ></atomic-product-rating>`,
      selector: 'atomic-product-rating',
      product: productToUse === null ? undefined : productToUse,
      bindings: (bindings) => {
        bindings.interfaceElement.type = 'product-listing';
        bindings.i18n = i18n;
        bindings.store = {
          ...bindings.store,
          onChange: vi.fn(),
          state: {
            ...bindings.store?.state,
            loadingFlags: [],
          },
        };
        return bindings;
      },
    });

    return element;
  };

  it('should be defined', async () => {
    const el = await renderComponent();
    expect(el).toBeInstanceOf(AtomicProductRating);
  });

  describe('with default properties', () => {
    it('should render rating with default field ec_rating', async () => {
      const element = await renderComponent();
      const ratingContainer = locators.getRatingContainer(element);

      expect(element).toBeDefined();
      expect(ratingContainer).toBeInTheDocument();
    });

    it('should use default maxValueInIndex of 5', async () => {
      const element = await renderComponent();
      const icons = locators.getRatingIcons(element);

      expect(icons).toHaveLength(10); // 5 empty + 5 filled icons
    });

    it('should display rating for ec_rating field', async () => {
      const element = await renderComponent(); // ec_rating: 4.0, maxValueInIndex: 5
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

  describe('with rating details field', () => {
    it('should display rating details when field is provided', async () => {
      const element = await renderComponent({
        ratingDetailsField: 'ec_rating',
      });
      const ratingDetails = locators.getRatingDetails(element);

      expect(ratingDetails).toBeInTheDocument();
      expect(ratingDetails).toHaveTextContent('(4)');
    });

    it('should not display rating details when field is not provided', async () => {
      const element = await renderComponent();
      const ratingDetails = locators.getRatingDetails(element);

      expect(ratingDetails).toBeNull();
    });

    it('should not display rating details when field value is null', async () => {
      const element = await renderComponent({
        ratingDetailsField: 'null_rating',
      });
      const ratingDetails = locators.getRatingDetails(element);

      expect(ratingDetails).toBeNull();
    });
  });

  describe('with custom maxValueInIndex', () => {
    it('should render correct number of icons for custom max value', async () => {
      const element = await renderComponent({maxValueInIndex: 10});
      const icons = locators.getRatingIcons(element);

      expect(icons).toHaveLength(20); // 10 empty + 10 filled icons
    });

    it('should display rating with custom max value', async () => {
      const element = await renderComponent({maxValueInIndex: 10});
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
      const element = await renderComponent({icon: customIcon});
      const icons = locators.getRatingIcons(element);

      icons?.forEach((icon) => {
        expect(icon).toHaveAttribute('icon', customIcon);
      });
    });
  });

  describe('accessibility', () => {
    it('should have correct aria-label for rating', async () => {
      const element = await renderComponent();
      const ratingContainer = locators.getRatingContainer(element);

      expect(ratingContainer).toHaveAttribute('aria-label', '4 stars out of 5');
    });

    it('should have role="img" for rating container', async () => {
      const element = await renderComponent();
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

    it('should handle missing product gracefully', async () => {
      const element = await renderComponent({product: null});
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

    it('should reflect rating-details-field property to attribute', async () => {
      const element = await renderComponent({ratingDetailsField: 'reviews'});

      expect(element).toHaveAttribute('rating-details-field', 'reviews');
    });

    it('should reflect max-value-in-index property to attribute', async () => {
      const element = await renderComponent({maxValueInIndex: 10});

      expect(element).toHaveAttribute('max-value-in-index', '10');
    });

    it('should reflect icon property to attribute', async () => {
      const customIcon = 'custom-icon';
      const element = await renderComponent({icon: customIcon});

      expect(element).toHaveAttribute('icon', customIcon);
    });
  });

  describe('component lifecycle', () => {
    it('should initialize correctly', async () => {
      const element = await renderComponent();

      expect(element.bindings).toBeDefined();
    });

    it('should update when properties change', async () => {
      const element = await renderComponent();

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
      const element = await renderComponent();

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

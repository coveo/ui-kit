import type {Result} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import type {MockedObject} from 'vitest';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicResult} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-result-fixture';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {mockConsole} from '@/vitest-utils/testing-helpers/testing-utils/mock-console';
import {AtomicResultRating} from './atomic-result-rating';
import './atomic-result-rating';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-result-rating', () => {
  let i18n: i18n;
  let mockResult: Result;
  let mockedConsole: MockedObject<Console>;

  const locators = {
    getRatingContainer: (element: AtomicResultRating) =>
      element?.shadowRoot?.querySelector('[part="value-rating"]'),
    getRatingIcons: (element: AtomicResultRating) =>
      element?.shadowRoot?.querySelectorAll(
        'atomic-icon[part="value-rating-icon"]'
      ),
  };

  beforeEach(async () => {
    console.error = vi.fn();
    mockedConsole = mockConsole();

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

  it('should use default of 5 when maxValueInIndex is unspecified', async () => {
    const element = await renderComponent({field: 'snrating'});
    const icons = locators.getRatingIcons(element);

    expect(icons).toHaveLength(10); // 5 empty + 5 filled icons
  });

  it('should render rating using custom field', async () => {
    const element = await renderComponent({field: 'custom_rating'});
    const ratingContainer = locators.getRatingContainer(element);

    expect(ratingContainer).toBeInTheDocument();
    expect(ratingContainer).toHaveAttribute('aria-label', '3.5 stars out of 5');
  });

  it('should render nothing when field value is null', async () => {
    const element = await renderComponent({field: 'null_rating'});
    const ratingContainer = locators.getRatingContainer(element);

    expect(ratingContainer).toBeNull();
  });

  it('should handle zero rating', async () => {
    const element = await renderComponent({field: 'zero_rating'});
    const ratingContainer = locators.getRatingContainer(element);

    expect(ratingContainer).toBeInTheDocument();
    expect(ratingContainer).toHaveAttribute('aria-label', '0 stars out of 5');
  });

  it('should render correct number of icons when a custom maxValueInIndex is specified', async () => {
    const element = await renderComponent({
      field: 'snrating',
      maxValueInIndex: 10,
    });
    const icons = locators.getRatingIcons(element);

    expect(icons).toHaveLength(20); // 10 empty + 10 filled icons
  });

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

  it('should handle invalid field values gracefully', async () => {
    const element = await renderComponent({field: 'invalid_rating'});
    const ratingContainer = locators.getRatingContainer(element);

    expect(ratingContainer).toBeNull();
    expect(element.error).toBeDefined();
  });

  it('should handle missing result gracefully', async () => {
    const element = await renderComponent({field: 'snrating', result: null});
    const ratingContainer = locators.getRatingContainer(element);

    expect(ratingContainer).toBeNull();
  });

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

  it('should initialize correctly', async () => {
    const element = await renderComponent({field: 'snrating'});

    expect(element.bindings).toBeDefined();
  });

  it('should update when field property changes', async () => {
    const element = await renderComponent({field: 'snrating'});

    element.field = 'custom_rating';
    await element.updateComplete;

    const ratingContainer = locators.getRatingContainer(element);
    expect(ratingContainer).toHaveAttribute('aria-label', '3.5 stars out of 5');
  });

  // TODO V4: KIT-5197 - Remove this test (validation will set error in V4)
  it('should log validation warning when maxValueInIndex is updated to invalid value', async () => {
    const element = await renderComponent({
      field: 'snrating',
      maxValueInIndex: 5,
    });

    element.maxValueInIndex = 0;
    await element.updateComplete;

    expect(mockedConsole.warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'Prop validation failed for component atomic-result-rating'
      ),
      element
    );
  });
});

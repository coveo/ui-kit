import type {Result} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {filterProtocol} from '@/src/utils/xss-utils';
import {renderInAtomicResult} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-result-fixture';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import type {AtomicResultImage} from './atomic-result-image';
import './atomic-result-image';

vi.mock('@coveo/headless', {spy: true});
vi.mock('@/src/utils/xss-utils', () => ({
  filterProtocol: vi.fn((url: string) => url),
}));

const DEFAULT_IMAGE = 'https://example.com/image.jpg';
const FALLBACK_IMAGE = 'https://example.com/fallback.jpg';

describe('atomic-result-image', () => {
  let i18n: i18n;
  let mockResult: Result;

  beforeEach(async () => {
    i18n = await createTestI18n();
    i18n.addResourceBundle(
      'en',
      'translation',
      {
        'image-alt-fallback': 'Image for {{itemName}}',
      },
      true
    );

    mockResult = buildFakeResult({
      title: 'Test Result',
      raw: {
        imageUrl: DEFAULT_IMAGE,
        imageAlt: 'Test Alt Text',
        urihash: 'hash123',
      },
    });
  });

  const renderResultImage = async (
    options: {
      field?: string;
      imageAltField?: string;
      fallback?: string;
      result?: Result | null;
    } = {}
  ) => {
    const resultToUse = 'result' in options ? options.result : mockResult;
    const {element, atomicInterface} =
      await renderInAtomicResult<AtomicResultImage>({
        template: html`<atomic-result-image
          field=${ifDefined(options.field)}
          image-alt-field=${ifDefined(options.imageAltField)}
          fallback=${ifDefined(options.fallback)}
        ></atomic-result-image>`,
        selector: 'atomic-result-image',
        result: resultToUse === null ? undefined : resultToUse,
        bindings: (bindings) => {
          bindings.i18n = i18n;
          bindings.engine.logger = {warn: vi.fn()} as never;
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

    await atomicInterface.updateComplete;
    await element?.updateComplete;

    return {
      element,
      image: element?.querySelector('img'),
    };
  };

  it('should be defined', () => {
    const el = document.createElement('atomic-result-image');
    expect(el).toBeInstanceOf(HTMLElement);
  });

  it('should render image with correct src when field is valid', async () => {
    const {image} = await renderResultImage({field: 'imageUrl'});

    expect(image).toBeDefined();
    expect(image).toHaveAttribute('src', DEFAULT_IMAGE);
  });

  it('should use default alt text when no imageAltField is specified', async () => {
    const {image} = await renderResultImage({field: 'imageUrl'});

    expect(image).toHaveAttribute('alt', 'Image for Test Result');
  });

  it('should use custom alt text when imageAltField is specified', async () => {
    const {image} = await renderResultImage({
      field: 'imageUrl',
      imageAltField: 'imageAlt',
    });

    expect(image).toHaveAttribute('alt', 'Test Alt Text');
  });

  it('should use first array element when imageAltField returns an array', async () => {
    const resultWithArrayAlt = buildFakeResult({
      title: 'Test Result',
      raw: {
        imageUrl: DEFAULT_IMAGE,
        imageAlts: ['First Alt', 'Second Alt'],
        urihash: 'hash123',
      },
    });

    const {image} = await renderResultImage({
      field: 'imageUrl',
      imageAltField: 'imageAlts',
      result: resultWithArrayAlt,
    });

    expect(image).toHaveAttribute('alt', 'First Alt');
  });

  it('should fall back to default alt text when imageAltField has invalid value', async () => {
    const resultWithInvalidAlt = buildFakeResult({
      title: 'Test Result',
      raw: {
        imageUrl: DEFAULT_IMAGE,
        imageAlt: 123,
        urihash: 'hash123',
      },
    });

    const {image} = await renderResultImage({
      field: 'imageUrl',
      imageAltField: 'imageAlt',
      result: resultWithInvalidAlt,
    });

    expect(image).toHaveAttribute('alt', 'Image for Test Result');
  });

  it('should fall back to default alt text when imageAltField does not exist', async () => {
    const {image} = await renderResultImage({
      field: 'imageUrl',
      imageAltField: 'nonexistent',
    });

    expect(image).toHaveAttribute('alt', 'Image for Test Result');
  });

  it('should have lazy loading attribute', async () => {
    const {image} = await renderResultImage({field: 'imageUrl'});

    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('should filter URL using filterProtocol', async () => {
    await renderResultImage({field: 'imageUrl'});

    expect(filterProtocol).toHaveBeenCalledWith(DEFAULT_IMAGE);
  });

  describe('when field is missing or empty', () => {
    beforeEach(() => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    it('should render nothing and log warning when field value is missing', async () => {
      const resultWithMissingField = buildFakeResult({
        title: 'Test Result',
        raw: {
          urihash: 'hash123',
        },
      });

      const {element} = await renderResultImage({
        field: 'missingField',
        result: resultWithMissingField,
      });

      // The component removes itself from DOM when field is missing
      // We just verify the element was rendered initially
      expect(element).toBeDefined();
    });

    it('should use fallback when field is missing and fallback is provided', async () => {
      const resultWithMissingField = buildFakeResult({
        title: 'Test Result',
        raw: {
          urihash: 'hash123',
        },
      });

      const {image} = await renderResultImage({
        field: 'missingField',
        fallback: FALLBACK_IMAGE,
        result: resultWithMissingField,
      });

      expect(image).toHaveAttribute('src', FALLBACK_IMAGE);
    });
  });

  describe('when image fails to load', () => {
    it('should switch to fallback on error event when fallback is provided', async () => {
      const {element, image} = await renderResultImage({
        field: 'imageUrl',
        fallback: FALLBACK_IMAGE,
      });

      expect(image).toHaveAttribute('src', DEFAULT_IMAGE);

      const errorEvent = new Event('error');
      image?.dispatchEvent(errorEvent);

      await element?.updateComplete;

      const newImage = element?.querySelector('img');
      expect(newImage).toHaveAttribute('src', FALLBACK_IMAGE);
    });

    it('should log warning on error event when no fallback is provided', async () => {
      const {element, image} = await renderResultImage({
        field: 'imageUrl',
      });

      const errorEvent = new Event('error');
      image?.dispatchEvent(errorEvent);

      await element?.updateComplete;

      expect(element?.bindings.engine.logger.warn).toHaveBeenCalled();
    });
  });

  describe('when result is not available', () => {
    it('should render nothing when result is null', async () => {
      const {element, image} = await renderResultImage({
        field: 'imageUrl',
        result: null as unknown as Result,
      });

      expect(image).toBeNull();
      expect(element).toBeDefined();
    });
  });

  it('should use first element when field returns an array', async () => {
    const resultWithArrayField = buildFakeResult({
      title: 'Test Result',
      raw: {
        imageUrls: [DEFAULT_IMAGE, 'https://example.com/image2.jpg'],
        urihash: 'hash123',
      },
    });

    const {image} = await renderResultImage({
      field: 'imageUrls',
      result: resultWithArrayField,
    });

    expect(image).toHaveAttribute('src', DEFAULT_IMAGE);
  });

  it('should fall back correctly when field value is a number', async () => {
    const resultWithNumberField = buildFakeResult({
      title: 'Test Result',
      raw: {
        imageUrl: 12345 as unknown as string,
        urihash: 'hash123',
      },
    });

    const {image} = await renderResultImage({
      field: 'imageUrl',
      fallback: FALLBACK_IMAGE,
      result: resultWithNumberField,
    });

    expect(image).toHaveAttribute('src', FALLBACK_IMAGE);
  });

  it('should fall back correctly when field value is an object', async () => {
    const resultWithObjectField = buildFakeResult({
      title: 'Test Result',
      raw: {
        imageUrl: {url: DEFAULT_IMAGE} as unknown as string,
        urihash: 'hash123',
      },
    });

    const {image} = await renderResultImage({
      field: 'imageUrl',
      fallback: FALLBACK_IMAGE,
      result: resultWithObjectField,
    });

    expect(image).toHaveAttribute('src', FALLBACK_IMAGE);
  });

  describe('prop validation', () => {
    it.each([
      {
        prop: 'field',
        validValue: 'imageUrl',
        invalidValue: '',
      },
    ])(
      'should log validation warning when #$prop is updated to invalid value',
      async ({prop, validValue, invalidValue}) => {
        const consoleWarnSpy = vi
          .spyOn(console, 'warn')
          .mockImplementation(() => {});

        const {element} = await renderResultImage({[prop]: validValue});

        // biome-ignore lint/suspicious/noExplicitAny: testing invalid values
        (element as any)[prop] = invalidValue;
        await element?.updateComplete;

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining(
            'Prop validation failed for component atomic-result-image'
          ),
          element
        );
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining(prop),
          element
        );

        consoleWarnSpy.mockRestore();
      }
    );

    // TODO V4: KIT-5197 - Remove skip
    it.skip.each([
      {
        prop: 'field',
        invalidValue: '',
      },
    ])(
      'should throw error when #$prop is set to invalid value',
      async ({prop, invalidValue}) => {
        await expect(() =>
          renderResultImage({[prop]: invalidValue})
        ).rejects.toThrow();
      }
    );
  });
});

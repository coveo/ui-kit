import {
  buildProductTemplatesManager,
  type Product,
} from '@coveo/headless/commerce';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {ItemTarget} from '@/src/components/common/layout/item-layout-utils';
import type {TemplateProviderProps} from '@/src/components/common/template-provider/template-provider';
import {ProductTemplateProvider} from './product-template-provider';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('ProductTemplateProvider', () => {
  const registerTemplates = vi.fn();

  beforeEach(() => {
    vi.mocked(buildProductTemplatesManager).mockReturnValue({
      registerTemplates,
      selectLinkTemplate: vi.fn(),
      selectTemplate: vi.fn(),
    });
  });

  describe('#constructor', () => {
    it('should create an instance', () => {
      const productTemplateProvider = productTemplateProviderFixture();

      expect(productTemplateProvider).toBeInstanceOf(ProductTemplateProvider);
    });

    it('should call the headless #buildProductTemplatesManager function', () => {
      productTemplateProviderFixture();

      expect(buildProductTemplatesManager).toHaveBeenCalled();
    });

    describe("when #includeDefaultTemplate is 'true' and #templateElements is empty", () => {
      beforeEach(() => {
        vi.useFakeTimers();
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it('should register the default template without conditions', async () => {
        productTemplateProviderFixture({
          includeDefaultTemplate: true,
          templateElements: [],
        });

        await vi.runAllTimersAsync();

        expect(registerTemplates).toHaveBeenCalledExactlyOnceWith(
          expect.objectContaining({
            conditions: expect.arrayContaining([]),
          })
        );
      });

      it('should register the correct default product template', async () => {
        productTemplateProviderFixture({
          includeDefaultTemplate: true,
          templateElements: [],
        });

        await vi.runAllTimersAsync();

        expect(registerTemplates).toHaveBeenCalledExactlyOnceWith(
          expect.objectContaining({
            conditions: expect.arrayContaining([]),
          })
        );

        const defaultTemplate = registerTemplates.mock.lastCall?.[0].content;
        expect(defaultTemplate).toBeInstanceOf(DocumentFragment);

        expect(defaultTemplate.children.length).toBe(2);

        expect(defaultTemplate.children[0]?.nodeName).toBe(
          'ATOMIC-PRODUCT-SECTION-NAME'
        );
        expect(defaultTemplate.children[0].children.length).toBe(1);
        expect(defaultTemplate.children[0].children[0]?.nodeName).toBe(
          'ATOMIC-PRODUCT-LINK'
        );
        await expect(defaultTemplate.children[0].children[0]).toHaveClass(
          'font-bold'
        );

        expect(defaultTemplate.children[1]?.nodeName).toBe(
          'ATOMIC-PRODUCT-SECTION-VISUAL'
        );
        expect(defaultTemplate.children[1].children.length).toBe(1);
        expect(defaultTemplate.children[1].children[0]?.nodeName).toBe(
          'ATOMIC-PRODUCT-IMAGE'
        );
        expect(defaultTemplate.children[1].children[0]).toHaveAttribute(
          'field',
          'ec_thumbnails'
        );
      });

      it('should register the correct default link template when #gridCellLinkTarget is undefined', async () => {
        productTemplateProviderFixture({
          includeDefaultTemplate: true,
          templateElements: [],
        });

        await vi.runAllTimersAsync();

        const defaultLinkTemplate =
          registerTemplates.mock.lastCall?.[0].linkContent;
        expect(defaultLinkTemplate).toBeInstanceOf(DocumentFragment);

        expect(defaultLinkTemplate.children.length).toBe(1);
        expect(defaultLinkTemplate.children[0]?.nodeName).toBe(
          'ATOMIC-PRODUCT-LINK'
        );
      });

      it('should register the correct default link template when #gridCellLinkTarget is defined', async () => {
        productTemplateProviderFixture(
          {includeDefaultTemplate: true, templateElements: []},
          '_blank'
        );

        await vi.runAllTimersAsync();

        const defaultLinkTemplate =
          registerTemplates.mock.lastCall?.[0].linkContent;
        expect(defaultLinkTemplate).toBeInstanceOf(DocumentFragment);

        expect(defaultLinkTemplate.children.length).toBe(1);
        expect(defaultLinkTemplate.children[0]?.nodeName).toBe(
          'ATOMIC-PRODUCT-LINK'
        );
        expect(defaultLinkTemplate.children[0].children.length).toBe(1);
        expect(defaultLinkTemplate.children[0].children[0]).toHaveAttribute(
          'slot',
          'attributes'
        );
        expect(defaultLinkTemplate.children[0].children[0]).toHaveAttribute(
          'target',
          '_blank'
        );
      });
    });
  });

  const productTemplateProviderFixture = (
    props: Partial<TemplateProviderProps<Product>> = {},
    gridCellLinkTarget?: ItemTarget
  ) => {
    return new ProductTemplateProvider(
      {
        getResultTemplateRegistered: vi.fn(),
        getTemplateHasError: vi.fn(),
        setTemplateHasError: vi.fn(),
        templateElements: [],
        includeDefaultTemplate: true,
        setResultTemplateRegistered: vi.fn(),
        ...props,
      },
      gridCellLinkTarget
    );
  };
});

import {buildProductTemplatesManager, Product} from '@coveo/headless/commerce';
import {describe, expect, it, vi} from 'vitest';
import {ItemTarget} from '../../common/layout/display-options';
import {TemplateProviderProps} from '../../common/template-provider/template-provider';
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
    it('should create instance', () => {
      const instance = createInstance();

      expect(instance).toBeInstanceOf(ProductTemplateProvider);
    });

    it('should call #buildProductTemplatesManager', () => {
      createInstance();

      expect(buildProductTemplatesManager).toHaveBeenCalled();
    });

    describe("when #includeDefaultTemplate is 'true' and #templateElements is empty", () => {
      it('should register default template without conditions', async () => {
        createInstance({includeDefaultTemplate: true, templateElements: []});

        await completeMacrotasks();

        expect(registerTemplates).toHaveBeenCalledOnce();
        expect(registerTemplates.mock.lastCall?.[0].conditions.length).toBe(0);
      });

      it('should register correct default product template', async () => {
        createInstance({includeDefaultTemplate: true, templateElements: []});

        await completeMacrotasks();

        expect(registerTemplates).toHaveBeenCalledOnce();
        expect(registerTemplates.mock.lastCall?.[0].conditions.length).toBe(0);

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
        expect(defaultTemplate.children[0].children[0]).toHaveClass(
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

      it('should register correct default link template when #gridCellLinkTarget is undefined', async () => {
        createInstance({includeDefaultTemplate: true, templateElements: []});

        await completeMacrotasks();

        const defaultLinkTemplate =
          registerTemplates.mock.lastCall?.[0].linkContent;
        expect(defaultLinkTemplate).toBeInstanceOf(DocumentFragment);

        expect(defaultLinkTemplate.children.length).toBe(1);
        expect(defaultLinkTemplate.children[0]?.nodeName).toBe(
          'ATOMIC-PRODUCT-LINK'
        );
      });

      it('should register correct default link template when #gridCellLinkTarget is defined', async () => {
        createInstance(
          {includeDefaultTemplate: true, templateElements: []},
          '_blank'
        );

        await completeMacrotasks();

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

  const createInstance = (
    props?: Partial<TemplateProviderProps<Product>>,
    gridCellLinkTarget?: ItemTarget
  ) => {
    return new ProductTemplateProvider(
      {
        getResultTemplateRegistered:
          props?.getResultTemplateRegistered ?? vi.fn(),
        getTemplateHasError: props?.getTemplateHasError ?? vi.fn(),
        setTemplateHasError: props?.setTemplateHasError ?? vi.fn(),
        templateElements: props?.templateElements ?? [],
        includeDefaultTemplate: props?.includeDefaultTemplate ?? true,
        setResultTemplateRegistered:
          props?.setResultTemplateRegistered ?? vi.fn(),
      },
      gridCellLinkTarget
    );
  };

  const completeMacrotasks = async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  };
});

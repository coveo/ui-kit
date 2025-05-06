import type {TemplatesManager} from '@coveo/headless';
import {describe, expect, it, vi} from 'vitest';
import {TemplateProvider, TemplateProviderProps} from './template-provider';

describe('TemplateProvider', () => {
  describe('#constructor', () => {
    it('should create an instance', () => {
      const instance = createInstance();

      expect(instance).toBeInstanceOf(TestTemplateProvider);
    });

    it('should call the received #buildManager function', () => {
      const buildManager = vi.fn(() => ({
        registerTemplates: vi.fn(),
        selectTemplate: vi.fn(),
        selectLinkTemplate: vi.fn(),
      }));

      createInstance({}, buildManager);

      expect(buildManager).toHaveBeenCalledOnce();
    });

    it("should call the #props.setResultTemplatesRegistered function with 'true'", async () => {
      const setResultTemplateRegistered = vi.fn();

      createInstance({
        setResultTemplateRegistered,
      });

      await completeMicrotasks();

      expect(setResultTemplateRegistered).toHaveBeenCalledOnce();
      expect(setResultTemplateRegistered).toHaveBeenCalledWith(true);
    });

    describe('when #props.templateElements is not empty', () => {
      it("should call the #props.setTemplateHasError function with 'true' when #getTemplate resolves to null on any template element", async () => {
        const setTemplateHasError = vi.fn();

        createInstance({
          templateElements: [
            buildFakeTemplateElement(),
            buildFakeTemplateElement(vi.fn().mockResolvedValue(null)),
          ],
          setTemplateHasError,
        });

        await completeMicrotasks();

        expect(setTemplateHasError).toHaveBeenCalledOnce();
        expect(setTemplateHasError).toHaveBeenCalledWith(true);
      });

      it('should not call the #props.setTemplateHasError function when #getTemplate resolves to a template on every template element', async () => {
        const setTemplateHasError = vi.fn();

        createInstance({
          templateElements: [
            buildFakeTemplateElement(),
            buildFakeTemplateElement(),
          ],
          setTemplateHasError,
        });

        await completeMicrotasks();

        expect(setTemplateHasError).not.toHaveBeenCalled();
      });

      it('should register only valid custom templates', async () => {
        const registerTemplates = vi.fn();

        const buildManager = vi.fn().mockReturnValueOnce({
          registerTemplates,
          selectTemplate: vi.fn(),
          selectLinkTemplate: vi.fn(),
        });

        const getTemplate1 = vi.fn().mockResolvedValue({
          content: 'Test Content',
          linkContent: 'Test Link Content',
          conditions: [],
        });

        const getTemplate2 = vi.fn().mockResolvedValue({
          content: 'Test Content 2',
          linkContent: 'Test Link Content 2',
          conditions: [],
        });

        createInstance(
          {
            templateElements: [
              buildFakeTemplateElement(getTemplate1),
              buildFakeTemplateElement(vi.fn().mockResolvedValue(null)),
              buildFakeTemplateElement(getTemplate2),
            ],
          },
          buildManager
        );

        await completeMicrotasks();

        expect(registerTemplates).toHaveBeenCalledOnce();
        expect(registerTemplates).toHaveBeenCalledWith(
          getTemplate1.mock.settledResults[0].value,
          getTemplate2.mock.settledResults[0].value
        );
      });

      it("should not register the default template when #props.includeDefaultTemplate is 'true'", async () => {
        const registerTemplates = vi.fn();

        const buildManager = vi.fn().mockReturnValueOnce({
          registerTemplates,
          selectTemplate: vi.fn(),
          selectLinkTemplate: vi.fn(),
        });

        createInstance(
          {
            includeDefaultTemplate: true,
            templateElements: [
              buildFakeTemplateElement(vi.fn().mockResolvedValue(null)),
            ],
          },
          buildManager
        );

        await completeMicrotasks();

        expect(registerTemplates).toHaveBeenCalledOnce();
        expect(registerTemplates).toHaveBeenCalledWith(...[]);
      });
    });

    describe('when #props.templateElements is empty', () => {
      it('should not call the #props.setTemplateHasError function', async () => {
        const setTemplateHasError = vi.fn();

        createInstance({
          templateElements: [],
          setTemplateHasError,
        });

        await completeMicrotasks();

        expect(setTemplateHasError).not.toHaveBeenCalled();
      });

      it("should register the default template when #props.includeDefaultTemplate is 'true'", async () => {
        const registerTemplates = vi.fn();

        const buildManager = vi.fn().mockReturnValueOnce({
          registerTemplates,
          selectTemplate: vi.fn(),
          selectLinkTemplate: vi.fn(),
        });

        createInstance(
          {
            includeDefaultTemplate: true,
            templateElements: [],
          },
          buildManager
        );

        await completeMicrotasks();

        expect(registerTemplates).toHaveBeenCalledOnce();
        expect(registerTemplates.mock.lastCall?.[0].content.textContent).toBe(
          'Default Template'
        );
        expect(
          registerTemplates.mock.lastCall?.[0].linkContent.textContent
        ).toBe('Default Link Template');
        expect(registerTemplates.mock.lastCall?.[0].conditions.length).toBe(0);
      });

      it('should not register the default template when #props.includeDefaultTemplate is "false"', async () => {
        const registerTemplates = vi.fn();

        const buildManager = vi.fn().mockReturnValueOnce({
          registerTemplates,
          selectTemplate: vi.fn(),
          selectLinkTemplate: vi.fn(),
        });

        createInstance(
          {
            includeDefaultTemplate: false,
            templateElements: [],
          },
          buildManager
        );

        await completeMicrotasks();

        expect(registerTemplates).toHaveBeenCalledOnce();
        expect(registerTemplates).toHaveBeenCalledWith(...[]);
      });
    });
  });

  describe('#getTemplateContent', () => {
    it('should call the #templateManager.selectTemplate function with the provided item', async () => {
      const item = {id: 'item1'};
      const buildManager = () => ({
        registerTemplates: vi.fn(),
        selectTemplate,
        selectLinkTemplate: vi.fn(),
      });
      const selectTemplate = vi.fn();
      const fixture = await createInstance({}, buildManager);

      fixture.getTemplateContent(item);

      expect(selectTemplate).toHaveBeenCalledOnce();
      expect(selectTemplate).toHaveBeenCalledWith(item);
    });
  });

  describe('#getLinkTemplateContent', () => {
    it('should call the #templateManager.selectLinkTemplate function with the provided item', async () => {
      const item = {id: 'item1'};
      const buildManager = () => ({
        registerTemplates: vi.fn(),
        selectTemplate: vi.fn(),
        selectLinkTemplate,
      });
      const selectLinkTemplate = vi.fn();
      const fixture = createInstance({}, buildManager);

      fixture.getLinkTemplateContent(item);

      expect(selectLinkTemplate).toHaveBeenCalledOnce();
      expect(selectLinkTemplate).toHaveBeenCalledWith(item);
    });
  });

  describe('#getEmptyTemplateContent', () => {
    it('should return an empty DocumentFragment', async () => {
      const fixture = createInstance();

      const result = fixture.getEmptyLinkTemplateContent();

      expect(result).toBeInstanceOf(DocumentFragment);
    });
  });

  describe('#templatesRegistered', () => {
    it('should call the #props.getResultTemplateRegistered function', async () => {
      const getResultTemplateRegistered = vi.fn();
      const fixture = createInstance({getResultTemplateRegistered});

      fixture.templatesRegistered;

      expect(getResultTemplateRegistered).toHaveBeenCalledOnce();
    });
  });

  describe('#hasError', () => {
    it('should call the #props.getTemplateHasError function', async () => {
      const getTemplateHasError = vi.fn();
      const fixture = await createInstance({getTemplateHasError});

      fixture.hasError;

      expect(getTemplateHasError).toHaveBeenCalledOnce();
    });
  });

  class TestTemplateProvider extends TemplateProvider<unknown> {
    constructor(
      props: TemplateProviderProps<unknown>,
      buildManager: () => TemplatesManager<
        unknown,
        DocumentFragment,
        DocumentFragment
      >
    ) {
      super(props, buildManager);
    }

    protected makeDefaultTemplate() {
      const content = document.createDocumentFragment();
      content.append(document.createTextNode('Default Template'));

      const linkContent = document.createDocumentFragment();
      linkContent.append(document.createTextNode('Default Link Template'));

      return {
        content,
        linkContent,
        conditions: [],
      };
    }
  }

  const createInstance = (
    props?: Partial<TemplateProviderProps<unknown>>,
    buildManager?: () => TemplatesManager<
      unknown,
      DocumentFragment,
      DocumentFragment
    >
  ) => {
    return new TestTemplateProvider(
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
      buildManager ??
        vi.fn(() => ({
          registerTemplates: vi.fn(),
          selectTemplate: vi.fn(),
          selectLinkTemplate: vi.fn(),
        }))
    );
  };

  const buildFakeTemplateElement = (
    getTemplate = vi.fn().mockResolvedValue(expect.any(Object))
  ) => {
    return {
      ...document.createElement('template'),
      getTemplate,
    };
  };

  const completeMicrotasks = async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  };
});

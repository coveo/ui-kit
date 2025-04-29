import {TemplatesManager} from '@coveo/headless';
import {describe, expect, test, vi} from 'vitest';
import {TemplateProvider, TemplateProviderProps} from './template-provider';

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
    return {
      content: document.createDocumentFragment(),
      linkContent: document.createDocumentFragment(),
      conditions: [],
    };
  }
}

describe('TemplateProvider', () => {
  let _fixture: TestTemplateProvider;
  const buildManager: () => TemplatesManager<
    unknown,
    DocumentFragment,
    DocumentFragment
  > = vi.fn(() => ({
    registerTemplates: vi.fn(),
    selectTemplate: vi.fn(),
    selectLinkTemplate: vi.fn(),
  }));

  beforeEach(() => {
    vi.resetAllMocks();

    _fixture = new TestTemplateProvider(
      {
        getResultTemplateRegistered: vi.fn(),
        getTemplateHasError: vi.fn(),
        setTemplateHasError: vi.fn(),
        templateElements: [],
        includeDefaultTemplate: true,
        setResultTemplateRegistered: vi.fn(),
      },
      buildManager
    );
  });

  describe('#constructor', () => {
    test('should call #buildManager', () => {
      expect(buildManager).toHaveBeenCalledOnce();
    });
    test('should call #getTemplate on each item in #props.templateElements', () => {});
    test("when #getTemplate is null, should call #props.setTemplateHasError, with 'true'", () => {});
  });

  describe('#getTemplateContent', () => {
    test('should call #templateManager.selectTemplate with item', () => {});
  });

  describe('#getLinkTemplateContent', () => {
    test('should call #templateManager.selectLinkTemplate with item', () => {});
  });

  describe('#getEmptyTemplateContent', () => {
    test('should return empty DocumentFragment', () => {});
  });

  describe('#templatesRegistered', () => {
    test('should call #props.getResultTemplateRegistered', () => {});
  });

  describe('#hasError', () => {
    test('should call #props.getTemplateHasError', () => {});
  });
});

import {buildResultTemplatesManager, type Result} from '@coveo/headless';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {ItemTarget} from '@/src/components/common/layout/item-layout-utils';
import type {TemplateProviderProps} from '@/src/components/common/template-provider/template-provider';
import type {AnyBindings} from '../interface/bindings';
import {ResultTemplateProvider} from './result-template-provider';

vi.mock('@coveo/headless', {spy: true});

describe('ResultTemplateProvider', () => {
  const registerTemplates = vi.fn();

  beforeEach(() => {
    vi.mocked(buildResultTemplatesManager).mockReturnValue({
      registerTemplates,
      selectLinkTemplate: vi.fn(),
      selectTemplate: vi.fn(),
    });
  });

  describe('#constructor', () => {
    it('should create an instance', () => {
      const resultTemplateProvider = resultTemplateProviderFixture();

      expect(resultTemplateProvider).toBeInstanceOf(ResultTemplateProvider);
    });

    it('should call the headless #buildResultTemplatesManager function', () => {
      resultTemplateProviderFixture();

      expect(buildResultTemplatesManager).toHaveBeenCalled();
    });

    describe("when #includeDefaultTemplate is 'true' and #templateElements is empty", () => {
      beforeEach(() => {
        vi.useFakeTimers();
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it('should register the default template without conditions', async () => {
        resultTemplateProviderFixture({
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

      it('should register the correct default result template', async () => {
        resultTemplateProviderFixture({
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

        expect(defaultTemplate.children.length).toBe(1);
        expect(defaultTemplate.children[0]?.nodeName).toBe(
          'ATOMIC-RESULT-LINK'
        );
      });

      it('should register the correct default link template when #gridCellLinkTarget is undefined', async () => {
        resultTemplateProviderFixture({
          includeDefaultTemplate: true,
          templateElements: [],
        });

        await vi.runAllTimersAsync();

        const defaultLinkTemplate =
          registerTemplates.mock.lastCall?.[0].linkContent;
        expect(defaultLinkTemplate).toBeInstanceOf(DocumentFragment);

        expect(defaultLinkTemplate.children.length).toBe(1);
        expect(defaultLinkTemplate.children[0]?.nodeName).toBe(
          'ATOMIC-RESULT-LINK'
        );
      });

      it('should register the correct default link template when #gridCellLinkTarget is defined', async () => {
        resultTemplateProviderFixture(
          {includeDefaultTemplate: true, templateElements: []},
          '_blank'
        );

        await vi.runAllTimersAsync();

        const defaultLinkTemplate =
          registerTemplates.mock.lastCall?.[0].linkContent;
        expect(defaultLinkTemplate).toBeInstanceOf(DocumentFragment);

        expect(defaultLinkTemplate.children.length).toBe(1);
        expect(defaultLinkTemplate.children[0]?.nodeName).toBe(
          'ATOMIC-RESULT-LINK'
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

  const resultTemplateProviderFixture = (
    props: Partial<TemplateProviderProps<Result>> = {},
    gridCellLinkTarget?: ItemTarget
  ) => {
    const mockBindings = {
      engine: {},
    } as AnyBindings;

    return new ResultTemplateProvider(
      {
        getResultTemplateRegistered: vi.fn(),
        getTemplateHasError: vi.fn(),
        setTemplateHasError: vi.fn(),
        templateElements: [],
        includeDefaultTemplate: true,
        setResultTemplateRegistered: vi.fn(),
        bindings: mockBindings,
        ...props,
      },
      gridCellLinkTarget
    );
  };
});

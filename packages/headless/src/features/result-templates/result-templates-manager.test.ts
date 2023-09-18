import {fieldsReducer as fields} from '../../features/fields/fields-slice';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test/mock-engine';
import {buildMockResult} from '../../test/mock-result';
import {ResultTemplate} from './result-templates';
import {
  ResultTemplatesManager,
  buildResultTemplatesManager,
} from './result-templates-manager';

describe('result template manager', () => {
  let resultTemplateManager: ResultTemplatesManager<string>;
  let engine: MockSearchEngine;

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
    resultTemplateManager = buildResultTemplatesManager(engine);
  });

  it('adds the correct reducers to the engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({fields});
  });

  describe('registration & selection', () => {
    it('returns a registered template that matches', () => {
      resultTemplateManager.registerTemplates({
        content: '{{title}}',
        conditions: [() => true, () => true],
      });

      expect(resultTemplateManager.selectTemplate(buildMockResult())).toBe(
        '{{title}}'
      );
    });

    it('does not return a registered template that does not match', () => {
      resultTemplateManager.registerTemplates({
        content: '{{title}}',
        conditions: [() => true, () => false],
      });

      expect(
        resultTemplateManager.selectTemplate(buildMockResult())
      ).toBeNull();
    });

    it(`when multiple templates match
        it returns the one with the highest priority`, () => {
      resultTemplateManager.registerTemplates(
        {
          content: '{{title1}}',
          conditions: [() => true],
          priority: 10,
        },
        {
          content: '{{title2}}',
          conditions: [() => true],
          priority: 20,
        }
      );

      expect(resultTemplateManager.selectTemplate(buildMockResult())).toBe(
        '{{title2}}'
      );
    });

    it(`when multiple templates match & have the same priority
        it should keep the same registration order (return the first one registered)`, () => {
      resultTemplateManager.registerTemplates(
        {
          content: '{{title1}}',
          conditions: [() => true],
        },
        {
          content: '{{title2}}',
          conditions: [() => true],
        },
        {
          content: '{{title3}}',
          conditions: [() => true],
        }
      );

      expect(resultTemplateManager.selectTemplate(buildMockResult())).toBe(
        '{{title1}}'
      );
    });

    it('validates the template', () => {
      expect(() =>
        resultTemplateManager.registerTemplates(
          undefined as unknown as ResultTemplate<string>
        )
      ).toThrow();
      expect(() =>
        resultTemplateManager.registerTemplates({
          content: 'abc',
        } as unknown as ResultTemplate<string>)
      ).toThrow();
      expect(() =>
        resultTemplateManager.registerTemplates({
          conditions: [() => true],
        } as unknown as ResultTemplate<string>)
      ).toThrow();
    });
  });
});

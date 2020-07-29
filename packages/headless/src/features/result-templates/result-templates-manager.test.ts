import {ResultTemplatesManager} from './result-templates-manager';
import {buildMockResult} from '../../test/mock-result';
import {buildMockEngine} from '../../test/mock-engine';

describe('result template manager', () => {
  let resultTemplateManager: ResultTemplatesManager<string>;

  beforeEach(() => {
    resultTemplateManager = new ResultTemplatesManager(buildMockEngine());
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

    it('does not return a registered template that doesn not match', () => {
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
  });
});

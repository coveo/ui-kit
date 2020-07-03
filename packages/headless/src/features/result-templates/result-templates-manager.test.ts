import {ResultTemplatesManager} from './result-templates-manager';
import {buildMockResult} from '../../test/mock-result';

describe('result template manager', () => {
  let resultTemplateManager: ResultTemplatesManager<string>;

  beforeEach(() => {
    resultTemplateManager = new ResultTemplatesManager();
  });

  describe('registration & selection', () => {
    it('returns a registered template that matches', () => {
      resultTemplateManager.registerTemplates({
        content: '{{title}}',
        matches: [() => true, () => true],
      });

      expect(resultTemplateManager.selectTemplate(buildMockResult())).toBe(
        '{{title}}'
      );
    });

    it('does not return a registered template that doesn not match', () => {
      resultTemplateManager.registerTemplates({
        content: '{{title}}',
        matches: [() => true, () => false],
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
          matches: [() => true],
          priority: 10,
        },
        {
          content: '{{title2}}',
          matches: [() => true],
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
          matches: [() => true],
        },
        {
          content: '{{title2}}',
          matches: [() => true],
        },
        {
          content: '{{title3}}',
          matches: [() => true],
        }
      );

      expect(resultTemplateManager.selectTemplate(buildMockResult())).toBe(
        '{{title1}}'
      );
    });
  });
});

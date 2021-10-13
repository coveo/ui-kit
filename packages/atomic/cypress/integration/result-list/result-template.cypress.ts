import {generateComponentHTML, TestFixture} from '../../fixtures/test-fixture';
import {assertContainsComponentError} from '../common-assertions';
import {
  addResultList,
  buildTemplateWithoutSections,
  buildTemplateWithSections,
} from './result-list-actions';
import {
  resultListComponent,
  ResultListSelectors,
} from './result-list-selectors';
import * as ResultTemplateAssertions from './result-template-assertions';
import {
  resultTemplateComponent,
  ResultTemplateSelectors,
} from './result-template-selectors';

function buildCustomTemplateContent(id = 'template-content') {
  const element = generateComponentHTML('span', {id});
  element.innerText = 'Anything';
  return element;
}

const addScript = (content: string) => (fixture: TestFixture) => {
  const element = generateComponentHTML('script');
  element.innerHTML = content;
  fixture.withElement(element);
};

const addBaseTextSize = (size: string) => (fixture: TestFixture) => {
  const element = generateComponentHTML('style');
  element.innerHTML = `
    body {
      --atomic-text-base: ${size}
    }
  `;
  fixture.withElement(element);
};

const addFieldValueInResponse =
  (field: string, fieldValue: string | null) => (fixture: TestFixture) => {
    fixture.withCustomResponse((response) =>
      response.results.forEach((result) => {
        if (fieldValue === null) {
          delete result.raw[field];
        } else {
          result.raw[field] = fieldValue;
        }
      })
    );
  };

describe('Result Template Component', () => {
  describe(`when not a child of an "${resultListComponent}" component`, () => {
    beforeEach(() => {
      new TestFixture()
        .withElement(buildTemplateWithoutSections(buildCustomTemplateContent()))
        .init();
    });

    assertContainsComponentError(ResultTemplateSelectors, true);
  });

  describe('when it does not have a "template" element as a child', () => {
    beforeEach(() => {
      const templateEl = generateComponentHTML(resultTemplateComponent);
      templateEl.appendChild(generateComponentHTML('p'));
      new TestFixture().with(addResultList(templateEl)).init();
    });

    assertContainsComponentError(ResultTemplateSelectors, true);
  });

  describe('without any conditions nor sections', () => {
    const textSize = '128px';
    beforeEach(() => {
      new TestFixture()
        .with(
          addResultList(
            buildTemplateWithoutSections(buildCustomTemplateContent())
          )
        )
        .with(addBaseTextSize(textSize))
        .init();
    });

    ResultTemplateAssertions.assertRendersTemplate(true);

    it('should not move result children', () => {
      ResultListSelectors.firstResultRoot().should(
        'not.have.css',
        'display',
        'grid'
      );
    });

    it('should not change the font size', () => {
      ResultTemplateSelectors.customContent().should(
        'have.css',
        'font-size',
        textSize
      );
    });
  });

  describe('with a title section', () => {
    const textSize = '128px';
    beforeEach(() => {
      new TestFixture()
        .with(
          addResultList(
            buildTemplateWithSections({title: buildCustomTemplateContent()})
          )
        )
        .with(addBaseTextSize(textSize))
        .init();
    });

    it('should move result children', () => {
      ResultListSelectors.firstResultRoot().should(
        'have.css',
        'display',
        'grid'
      );
    });

    it('should change the font size', () => {
      ResultTemplateSelectors.customContent().should(
        'not.have.css',
        'font-size',
        textSize
      );
    });
  });

  describe('with a must-match-x prop', () => {
    const field = 'filetype';
    const expectedFieldValue = 'abc';
    function setupMustMatch(fieldValue: string | null) {
      new TestFixture()
        .with(
          addResultList(
            buildTemplateWithoutSections(buildCustomTemplateContent(), {
              [`must-match-${field}`]: expectedFieldValue,
            })
          )
        )
        .with(addFieldValueInResponse(field, fieldValue))
        .init();
    }

    describe('when there is no field', () => {
      beforeEach(() => setupMustMatch(null));

      ResultTemplateAssertions.assertRendersTemplate(false);
    });

    describe('when the field value matches', () => {
      beforeEach(() => setupMustMatch(expectedFieldValue));

      ResultTemplateAssertions.assertRendersTemplate(true);
    });

    describe('when the field value does not matche', () => {
      beforeEach(() => setupMustMatch('some other field value'));

      ResultTemplateAssertions.assertRendersTemplate(false);
    });
  });

  describe('with a must-not-match-x prop', () => {
    const field = 'filetype';
    const expectedFieldValue = 'abc';
    function setupMustMatch(fieldValue: string | null) {
      new TestFixture()
        .with(
          addResultList(
            buildTemplateWithoutSections(buildCustomTemplateContent(), {
              [`must-not-match-${field}`]: expectedFieldValue,
            })
          )
        )
        .with(addFieldValueInResponse(field, fieldValue))
        .init();
    }

    describe('when there is no field', () => {
      beforeEach(() => setupMustMatch(null));

      ResultTemplateAssertions.assertRendersTemplate(true);
    });

    describe('when the field value matches', () => {
      beforeEach(() => setupMustMatch(expectedFieldValue));

      ResultTemplateAssertions.assertRendersTemplate(false);
    });

    describe('when the field value does not match', () => {
      beforeEach(() => setupMustMatch('some other field value'));

      ResultTemplateAssertions.assertRendersTemplate(true);
    });
  });

  describe('with custom conditions', () => {
    const templateId = 'mytemplate';
    function setupCustomCondition(values: boolean[]) {
      new TestFixture()
        .with(
          addResultList(
            buildTemplateWithoutSections(buildCustomTemplateContent(), {
              id: templateId,
            })
          )
        )
        .with(
          addScript(`
            document.querySelector('atomic-result-template#${templateId}').conditions = [
              ${values.map((value) => `() => ${value}`).join(',')}
            ];
          `)
        )
        .init();
    }

    describe('when all conditions are fulfilled', () => {
      beforeEach(() => setupCustomCondition([true, true, true]));

      ResultTemplateAssertions.assertRendersTemplate(true);
    });

    describe("when a condition isn't fulfilled", () => {
      beforeEach(() => setupCustomCondition([true, false, true]));

      ResultTemplateAssertions.assertRendersTemplate(false);
    });

    describe("when all conditions aren't fulfilled", () => {
      beforeEach(() => setupCustomCondition([false, false, false]));

      ResultTemplateAssertions.assertRendersTemplate(false);
    });
  });
});

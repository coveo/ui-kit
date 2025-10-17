import {tableElementTagName} from '../../../src/components/common/table-element-utils';
import {generateComponentHTML, TestFixture} from '../../fixtures/test-fixture';
import {
  assertConsoleWarning,
  assertContainsComponentError,
} from '../common-assertions';
import {
  addFieldValueInResponse,
  addResultList,
  buildTemplateWithoutSections,
  buildTemplateWithSections,
} from './result-list-actions';
import {
  resultListComponent,
  ResultListSelectors,
  resultSectionTags,
} from './result-list-selectors';
import {addResultTable} from './result-table-actions';
import {ResultTableSelectors} from './result-table-selectors';
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

  describe('when it has both section and non-section elements', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addResultList(
            buildTemplateWithoutSections([
              new Text('hello'),
              generateComponentHTML(resultSectionTags.actions),
            ])
          )
        )
        .init();
    });

    assertConsoleWarning(true);
  });

  describe('when it has strictly section and table-element elements', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addResultList(
            buildTemplateWithoutSections([
              generateComponentHTML(tableElementTagName),
              new Text('    \n    '),
              generateComponentHTML(resultSectionTags.actions),
            ])
          )
        )
        .init();
    });

    assertContainsComponentError(ResultTemplateSelectors, false);
    assertConsoleWarning(false);
  });

  describe('with a visual section', () => {
    function setupVisualSection(imageSize: string) {
      new TestFixture()
        .with(
          addResultList(
            buildTemplateWithoutSections([
              generateComponentHTML('atomic-result-section-visual', {
                'image-size': imageSize,
              }),
            ])
          )
        )
        .init();
    }

    describe('with an icon image size', () => {
      const imageSize = 'icon';
      beforeEach(() => {
        setupVisualSection(imageSize);
      });

      ResultTemplateAssertions.assertResultImageSize(imageSize);
    });

    describe('with a small image size', () => {
      const imageSize = 'small';
      beforeEach(() => {
        setupVisualSection(imageSize);
      });

      ResultTemplateAssertions.assertResultImageSize(imageSize);
    });
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
      ResultTemplateSelectors.customContentInList().should(
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
      ResultTemplateSelectors.customContentInList().should(
        'not.have.css',
        'font-size',
        textSize
      );
    });
  });

  describe('with table elements', () => {
    describe('in a result list', () => {
      beforeEach(() => {
        new TestFixture()
          .with(
            addResultTable(
              [{label: 'Anything', content: generateComponentHTML('span')}],
              {display: 'list'}
            )
          )
          .init();
      });

      it('does not render table elements', () => {
        ResultTemplateSelectors.tableElements()
          .should('exist')
          .and('not.be.visible');
      });
    });

    describe('in a result table with sections', () => {
      const textSize = '128px';
      beforeEach(() => {
        new TestFixture()
          .with(
            addResultTable([
              {
                label: 'Author',
                content: buildTemplateWithSections({
                  title: buildCustomTemplateContent(),
                }),
              },
            ])
          )
          .with(addBaseTextSize(textSize))
          .init();
      });

      it('should move result children', () => {
        ResultTableSelectors.firstRowCellsContent()
          .first()
          .should('have.css', 'display', 'grid');
      });

      it('should change the font size', () => {
        ResultTemplateSelectors.customContentIntable().should(
          'not.have.css',
          'font-size',
          textSize
        );
      });
    });

    describe('in a result table with a visual section', () => {
      function setupVisualSection(imageSize: string) {
        new TestFixture()
          .with(
            addResultTable([
              {
                label: 'Author',
                content: buildTemplateWithoutSections(
                  generateComponentHTML('atomic-result-section-visual', {
                    'image-size': imageSize,
                  })
                ),
              },
            ])
          )
          .init();
      }

      describe('with an icon image size', () => {
        const imageSize = 'icon';
        beforeEach(() => {
          setupVisualSection(imageSize);
        });

        ResultTemplateAssertions.assertCellImageSize(imageSize);
      });

      describe('with a small image size', () => {
        const imageSize = 'small';
        beforeEach(() => {
          setupVisualSection(imageSize);
        });

        ResultTemplateAssertions.assertCellImageSize(imageSize);
      });
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

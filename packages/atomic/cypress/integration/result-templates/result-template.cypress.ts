import {modifySearchResultAt} from '../../utils/network';
import {setUpPage} from '../../utils/setupComponent';
import {ComponentErrorSelectors} from '../component-error-selectors';
import {
  resultListComponent,
  ResultListSelectors,
} from '../result-list-selectors';
import {
  resultTemplateComponent,
  ResultTemplateSelectors,
} from './result-template-selectors';

describe('Result Template Component', () => {
  describe(`when not a child of an "${ResultListSelectors.component}" component`, () => {
    it(`should render an "${ComponentErrorSelectors.component}" component`, () => {
      setUpPage(resultTemplateComponent());
      cy.get(ResultTemplateSelectors.component)
        .shadow()
        .find(ComponentErrorSelectors.component)
        .should('be.visible');
    });
  });

  describe('when it does not have a "template" element has a child', () => {
    it(`should render an "${ComponentErrorSelectors.component}" component (in the result list)`, () => {
      setUpPage(resultListComponent(resultTemplateComponent('<p>test</p>')));
      cy.get(ResultListSelectors.component)
        .find(ResultTemplateSelectors.component)
        .shadow()
        .find(ComponentErrorSelectors.component)
        .should('be.visible');
    });
  });

  it('should save the template content in order to render', () => {
    const content = '<h3>template content</h3>';
    setUpPage(
      resultListComponent(
        resultTemplateComponent(`<template>${content}</template>`)
      )
    );
    cy.get(ResultListSelectors.component)
      .find('atomic-result')
      .first()
      .shadow()
      .then((firstResult) => {
        expect(firstResult[0].innerHTML).contain(content);
      });
  });

  const customTemplate = '<template>Custom template</template>';

  function firstResultShouldUseCustomTemplate() {
    cy.get(ResultListSelectors.component)
      .find('atomic-result')
      .first()
      .shadow()
      .then((firstResult) => {
        expect(firstResult[0].innerHTML).contain('Custom template');
      });
  }

  it('the "must-match-x" prop should add a condition to the template', () => {
    const filetype = 'veryspecificfiletype';
    modifySearchResultAt((result) => {
      result.raw.filetype = filetype;
      return result;
    });
    setUpPage(
      resultListComponent(
        resultTemplateComponent(
          customTemplate,
          `must-match-filetype="${filetype}"`
        )
      )
    );

    firstResultShouldUseCustomTemplate();
  });

  it('the "must-not-match-x" prop should add a condition to the template', () => {
    const filetype = 'veryspecificfiletype';
    modifySearchResultAt((result) => {
      result.raw.filetype = 'anotherfiletype';
      return result;
    });
    setUpPage(
      resultListComponent(
        resultTemplateComponent(
          customTemplate,
          `must-not-match-filetype="${filetype}"`
        )
      )
    );

    firstResultShouldUseCustomTemplate();
  });

  it('the "conditions" prop should add a condition(s) to the template', () => {
    const title = 'averyspecifictitle';
    modifySearchResultAt((result) => {
      result.title = title;
      return result;
    });
    setUpPage(
      resultListComponent(
        resultTemplateComponent(
          `${customTemplate}
          <script>
              document.querySelector('atomic-result-template#mytemplate').conditions = [
                  (result) => /${title}/i.test(result.title),
              ];
          </script>`,
          'id="mytemplate"'
        )
      )
    );

    firstResultShouldUseCustomTemplate();
  });
});

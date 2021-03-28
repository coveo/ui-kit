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

const resultTemplateInResultList = (slot = '') =>
  resultListComponent(resultTemplateComponent(slot));

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
      setUpPage(resultTemplateInResultList('<p>test</p>'));
      cy.get(ResultListSelectors.component)
        .find(ResultTemplateSelectors.component)
        .shadow()
        .find(ComponentErrorSelectors.component)
        .should('be.visible');
    });
  });

  it('should save the template content in order to render', () => {
    const content = '<h3>template content</h3>';
    setUpPage(resultTemplateInResultList(`<template>${content}</template>`));
    cy.get(ResultListSelectors.component)
      .find('atomic-result')
      .first()
      .shadow()
      .then((firstResult) => {
        expect(firstResult[0].innerHTML).contain(content);
      });
  });

  it.skip('the "must-match-x" prop should add a condition to the template');

  it.skip('the "must-not-match-x" prop should add a condition to the template');

  it.skip('the "conditions" prop should add a condition(s) to the template');
});

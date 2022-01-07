import {interceptSearch} from '../../page-objects/search';
import {ResultTemplateExpectations as Expect} from './result-template-expectations';
import {ResultTemplateActions as Actions} from './result-template-actions';
import {configure} from '../../page-objects/configurator';

describe('quantic-result-template', () => {
  const pageUrl = 's/quantic-result-template';
  function visitResultTemplate() {
    interceptSearch();
    cy.visit(pageUrl);
    configure({});
  }

  describe('with default options', () => {
    it('should work as expected', () => {
      visitResultTemplate();
      Expect.displaySlotByName('label', true);
      Expect.displaySlotByName('badges', true);
      Expect.displaySlotByName('actions', true);
      Expect.displaySlotByName('date', true);
      Expect.displaySlotByName('visual', true);
      Expect.displaySlotByName('title', true);
      Expect.displaySlotByName('metadata', true);
      Expect.displaySlotByName('emphasized', true);
      Expect.displaySlotByName('excerpt', true);
      Expect.displaySlotByName('bottom-metadata', true);

      Actions.appendChildren(
        'div',
        {
          slot: 'label',
        },
        'some label'
      );

      Expect.displaySlotByName('title', true);
    });
  });
});

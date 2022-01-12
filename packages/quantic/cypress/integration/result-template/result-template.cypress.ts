import {interceptSearch} from '../../page-objects/search';
import {ResultTemplateExpectations as Expect} from './result-template-expectations';
import {ResultTemplateActions as Actions} from './result-template-actions';
import {configure} from '../../page-objects/configurator';

const slots = {
  LABEL: 'label',
  BADGES: 'badges',
  ACTIONS: 'actions',
  DATE: 'date',
  VISUAL: 'visual',
  TITLE: 'title',
  METADATA: 'metadata',
  EMPHASIZED: 'emphasized',
  EXCERPT: 'excerpt',
  BOTTONMETADATA: 'bottom-metadata',
};
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
      for (const [k, v] of Object.entries(slots)) {
        Expect.displaySlotByName(v, true);
        Expect.numberOfSlotsByName(v, 1);
        Actions.appendChildren(
          'div',
          {
            slot: v,
          },
          k
        );
        Expect.displaySlotByName(v, true);
        Expect.numberOfSlotsByName(v, 1);
      }
    });
  });
});

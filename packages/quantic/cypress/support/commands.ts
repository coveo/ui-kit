import {registerDetailedReporterCommands} from '../reporters/detailed-collector';

registerDetailedReporterCommands();

// The command below are not used anymore

Cypress.Commands.add('lwcDevCheck', {prevSubject: 'element'}, (element) => {
  cy.wrap(element).trigger('change', {value: true, force: true});
});

Cypress.Commands.add('lwcDevUncheck', {prevSubject: 'element'}, (element) => {
  cy.wrap(element).trigger('change', {value: false, force: true});
});

Cypress.Commands.add('lwcDevClick', {prevSubject: 'element'}, (element) => {
  cy.wrap(element).trigger('click', {force: true});
});

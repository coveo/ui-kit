import {registerDetailedReporterCommands} from '../reporters/detailed-collector';

Cypress.Commands.add(
  'requestShouldNotBeMade',
  (alias: string, timeout = 1000) => {
    cy.wait(timeout);
    cy.get(alias).then((interceptions) => {
      expect(interceptions).to.have.length(0);
    });
  }
);

registerDetailedReporterCommands();

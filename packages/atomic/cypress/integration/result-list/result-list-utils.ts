import {buildTestUrl, injectComponent} from '../../utils/setupComponent';
import {resultListComponent} from './result-list-v1-selectors';

export function withAnySectionnableResultList(
  assertions: (setUpResultListPage: (template: string) => void) => void
) {
  const viewports = {mobile: 1023, desktop: 1024};
  Object.entries(viewports).forEach(([viewport, width]) =>
    describe(`with a ${viewport} viewport`, () =>
      ['list', 'grid'].forEach((display) =>
        describe(`in a result ${display}`, () =>
          ['none', 'icon', 'small', 'large'].forEach((image) =>
            describe(`with image="${image}"`, () =>
              ['compact', 'normal', 'comfortable'].forEach((density) =>
                describe(`with density="${density}"`, () => {
                  function setUpResultListPage(template: string) {
                    const aspectRatio = 16 / 9;
                    cy.viewport(width, width / aspectRatio);
                    cy.visit(buildTestUrl());
                    cy.injectAxe();
                    injectComponent(
                      resultListComponent(template, {display, image, density}),
                      true
                    );
                    cy.get('.list-wrapper:not(.placeholder)');
                  }

                  assertions(setUpResultListPage);
                })
              ))
          ))
      ))
  );
}

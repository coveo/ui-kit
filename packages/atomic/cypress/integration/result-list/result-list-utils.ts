import {ResultListSelectors} from './result-list-v1-selectors';

export function withAnySectionnableResultList(assertions: () => void) {
  const viewports = {mobile: 1023, desktop: 1024};
  Object.entries(viewports).forEach(([viewport, width]) =>
    describe(`with a ${viewport} viewport`, () =>
      ['list', 'grid'].forEach((display) =>
        describe(`in a result ${display}`, () =>
          ['none', 'icon', 'small', 'large'].forEach((image) =>
            describe(`with image="${image}"`, () =>
              ['compact', 'normal', 'comfortable'].forEach((density) =>
                describe(`with density="${density}"`, () => {
                  before(() => {
                    const aspectRatio = 16 / 9;
                    cy.viewport(width, width / aspectRatio);
                    cy.get(ResultListSelectors.component).then((comp) => {
                      const resultList = comp.get()[0];
                      resultList.setAttribute('display', display);
                      resultList.setAttribute('image', image);
                      resultList.setAttribute('density', density);
                    });
                  });

                  assertions();
                })
              ))
          ))
      ))
  );
}

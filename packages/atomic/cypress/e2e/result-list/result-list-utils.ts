import {
  ResultDisplayDensity,
  ResultDisplayLayout,
} from '../../../src/components/common/layout/display-options';
import {ResultDisplayImageSize} from './result-template-assertions';

interface WithAnySectionnableResultListOptions {
  componentTag: string;
  viewports?: Record<string, number>;
  layouts?: ResultDisplayLayout[];
  imageSizes?: ResultDisplayImageSize[];
  densities?: ResultDisplayDensity[];
  useBeforeEach?: boolean;
}

export function withAnySectionnableResultList(
  assertions: (
    display: ResultDisplayLayout,
    imageSize: ResultDisplayImageSize,
    density: ResultDisplayDensity
  ) => void,
  options: WithAnySectionnableResultListOptions
) {
  const viewports = options.viewports ?? {mobile: 1023, desktop: 1024};
  const layouts = options.layouts ?? ['list', 'grid'];
  const imageSizes = options.imageSizes ?? ['none', 'icon', 'small', 'large'];
  const densities = options.densities ?? ['compact', 'normal', 'comfortable'];

  Object.entries(viewports).forEach(([viewport, width]) => {
    layouts.forEach((layout) => {
      imageSizes.forEach((image) => {
        densities.forEach((density) => {
          // Create a unique test name for each combination
          const testName = `Test - Viewport: ${viewport}, Layout: ${layout}, Image Size: ${image}, Density: ${density}`;

          // Create a Cypress it statement for each combination
          it(testName, () => {
            const aspectRatio = 16 / 9;
            cy.viewport(width, width / aspectRatio);
            cy.get(options.componentTag).then((comp) => {
              const resultList = comp.get()[0];
              resultList.setAttribute('display', layout);
              resultList.setAttribute('image-size', image!);
              resultList.setAttribute('density', density);
            });

            assertions(layout, image, density);
            // Your test code here
            // Use the values of viewport, layout, imageSize, and density in your test
          });
        });
      });
    });
  });
}

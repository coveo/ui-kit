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

  // Build flat list of all combinations to avoid deep nesting
  const combinations: Array<{
    viewport: string;
    width: number;
    display: ResultDisplayLayout;
    image: ResultDisplayImageSize;
    density: ResultDisplayDensity;
  }> = [];
  Object.entries(viewports).forEach(([viewport, width]) => {
    layouts.forEach((display) => {
      imageSizes.forEach((image) => {
        densities.forEach((density) => {
          combinations.push({viewport, width, display, image, density});
        });
      });
    });
  });

  // Iterate over each combination in a single describe
  combinations.forEach(({viewport, width, display, image, density}) => {
    describe(
      `with a ${viewport} viewport, ${display} layout, image-size="${image}", density="${density}"`,
      () => {
        (options.useBeforeEach ? beforeEach : before)(() => {
          const aspectRatio = 16 / 9;
          cy.viewport(width, width / aspectRatio);
          cy.get(options.componentTag).then((comp) => {
            const resultList = comp.get()[0];
            resultList.setAttribute('display', display);
            resultList.setAttribute('image-size', image);
            resultList.setAttribute('density', density);
          });
        });

        assertions(display, image, density);
      }
    );
  });
}

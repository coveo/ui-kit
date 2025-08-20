import '@coveo/atomic/themes/coveo.css';
import {setCustomElementsManifest} from '@storybook/web-components';
import {render} from 'lit';
import customElements from '../custom-elements.json';
import {defineCustomElements} from '../dist/atomic/loader/index.js';

setCustomElementsManifest(customElements);
defineCustomElements();

export const parameters = {
  html: {
    root: '#code-root',
    removeComments: true,
    prettier: {
      tabWidth: 4,
      useTabs: false,
      htmlWhitespaceSensitivity: 'ignore',
    },
  },
  options: {
    storySort: (a, b) => {
      const topOrder = [
        'Introduction',
        'Commerce',
        'Search',
        'Recommendations',
        'Insight',
        'Common',
      ];

      const getTopLevel = (story) => story.title.split('/')[0];

      const aTop = getTopLevel(a);
      const bTop = getTopLevel(b);

      const aIndex = topOrder.indexOf(aTop);
      const bIndex = topOrder.indexOf(bTop);

      // Top-level order
      if (aIndex !== bIndex) {
        return aIndex - bIndex;
      }

      // Commerce subfolder custom ordering
      if (aTop === 'Commerce' && bTop === 'Commerce') {
        const aParts = a.title.split('/').slice(1); // skip top-level
        const bParts = b.title.split('/').slice(1);

        // Define subfolder priority: Introduction -> Example Pages -> others
        const subPriority = ['Introduction', 'Example Pages'];

        const aPriority = subPriority.indexOf(aParts[0]);
        const bPriority = subPriority.indexOf(bParts[0]);

        if (aPriority !== bPriority) {
          // Introduction/Example Pages first, then others
          return (
            (aPriority === -1 ? subPriority.length : aPriority) -
            (bPriority === -1 ? subPriority.length : bPriority)
          );
        }

        // If same priority or both other folders, sort alphabetically
        return aParts.join('/').localeCompare(bParts.join('/'), 'en-US');
      }

      // Fallback alphabetical for all other stories
      return a.title.localeCompare(b.title, 'en-US');
    },
  },
};

export const decorators = [
  (Story) => {
    const story = Story();

    if (story?._$litType$) {
      const container = document.createElement('div');

      render(story, container);

      const isTestMode =
        typeof window !== 'undefined' &&
        window.location.href.includes('localhost');

      if (!isTestMode) {
        disableAnalytics(container, [
          'atomic-recs-interface',
          'atomic-insight-interface',
          'atomic-search-interface',
          'atomic-commerce-interface',
          'atomic-commerce-recommendation-interface',
        ]);
      }

      return container;
    }
  },
];

function disableAnalytics(container, selectors) {
  selectors.forEach((selector) => {
    container.querySelectorAll(selector).forEach((element) => {
      element.setAttribute('analytics', 'false');
    });
  });
}

import {registerStandaloneSearchBox} from '@coveo/headless/dist/definitions/features/standalone-search-box-set/standalone-search-box-set-actions';

export interface ResultSectionWithHighlights {
  name: string;
  highlightColor: string;
}

export const resultSections: ResultSectionWithHighlights[] = [
  {
    name: 'atomic-result-section-visual',
    highlightColor: 'rgb(117, 221, 221)',
  },
  {
    name: 'atomic-result-section-title',
    highlightColor: 'rgb(132, 199, 208)',
  },
  {
    name: 'atomic-result-section-actions',
    highlightColor: 'rgb(146, 151, 196)',
  },
  {
    name: 'atomic-result-section-badges',
    highlightColor: 'rgb(147, 104, 183)',
  },
  {
    name: 'atomic-result-section-bottom-metadata',
    highlightColor: 'rgb(170, 62, 152)',
  },
  {
    name: 'atomic-result-section-emphasized',
    highlightColor: 'rgb(122, 231, 199)',
  },
  {
    name: 'atomic-result-section-title-metadata',
    highlightColor: 'rgb(249, 38, 114)',
  },
  {
    name: 'atomic-result-section-excerpt',
    highlightColor: 'rgb(30,167,253)',
  },
];

export const resultComponentArgTypes = {
  resultSection: {
    description:
      'In a list or grid layout, result templates may be divided into multiple building blocks called “result sections”. See https://docs.coveo.com/en/atomic/latest/usage/create-a-result-list for more information.',
    control: {
      type: 'radio',
      table: {
        defaultValue: {summary: 'none'},
      },
      options: resultSections.map((s) => s.name).concat(['none']),
    },
  },
  resultListLayout: {
    description:
      'A layout defines how you organize the results of a query. Layouts affect how many results to display per row and how visually distinct they are from each other.  See https://docs.coveo.com/en/atomic/latest/usage/create-a-result-list for more information',
    control: {
      type: 'radio',
      options: ['grid', 'list'],
    },
  },
  resultListDensity: {
    description:
      'The density attribute defines the spacing of various elements in the result list, including the gap between results, the gap between parts of a result, and the font sizes of different parts of a result. See https://docs.coveo.com/en/atomic/latest/usage/create-a-result-list for more information',
    control: {
      type: 'radio',
      options: ['comfortable', 'normal', 'compact'],
    },
  },
  resultListImageSize: {
    description:
      'The image attribute defines the expected size of the image (visual-section). See https://docs.coveo.com/en/atomic/latest/usage/create-a-result-list for more information',
    control: {
      type: 'radio',
      options: ['none', 'icon', 'small', 'large'],
    },
  },
};

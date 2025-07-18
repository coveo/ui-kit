import type {IManifest} from '../fetch-page.js';
import {defaultLayout} from './default-layout.js';
import defaultResultTemplate from './default-result-template.js';
import defaultSearchInterface from './default-search-interface.js';

export const defaultPageManifest: IManifest = {
  config: {
    name: 'Atomic Stencil Project',
  },
  markup: defaultSearchInterface,
  results: {
    attributes: {},
    templates: [{markup: defaultResultTemplate, attributes: {}}],
  },
  style: {
    theme: '',
    layout: defaultLayout,
  },
};

import {TestFixture, addTag, TagProps} from '../../../fixtures/test-fixture';
import {ColorFacetSelectors} from './color-facet-selectors';

export const defaultNumberOfValues = 8;
export const label = 'File Type';
export const field = 'filetype';

export const customSript = `atomic-color-facet::part(value-YouTubeVideo) {
    background-color:red
  }`;

export const addColorFacet =
  (props: TagProps = {}) =>
  (env: TestFixture) =>
    addTag(env, 'atomic-color-facet', props);

export function selectIdleBoxValueAt(index: number) {
  ColorFacetSelectors.idleBoxValue().eq(index).click();
}

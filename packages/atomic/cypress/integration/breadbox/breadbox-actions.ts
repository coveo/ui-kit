import {addTag, TagProps, TestFixture} from '../../fixtures/test-fixture';
import {BreadboxSelectors} from './breadbox-selectors';

export const breadboxLabel = 'Filters';
export const addBreadbox =
  (props: TagProps = {}) =>
  (env: TestFixture) =>
    addTag(env, 'atomic-breadbox', props);

export function deselectBreadcrumbAtIndex(index: number) {
  BreadboxSelectors.breadcrumbClearFacetValueButtonAtIndex(index).click();
  BreadboxSelectors.breadcrumbClearFacetValueButtonAtIndex(index).should(
    'not.exist'
  );
}

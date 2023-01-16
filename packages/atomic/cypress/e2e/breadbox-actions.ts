import {addTag, TagProps, TestFixture} from '../fixtures/test-fixture';
import {BreadboxSelectors} from './breadbox-selectors';

export const breadboxLabel = 'Filters';
export const addBreadbox =
  (props: TagProps = {}) =>
  (env: TestFixture) =>
    addTag(env, 'atomic-breadbox', props);

export function deselectBreadcrumbAtIndex(index: number) {
  BreadboxSelectors.breadcrumbButton()
    .its('length')
    .then((numberOfBreadcrumbs) => {
      BreadboxSelectors.breadcrumbClearFacetValueButtonAtIndex(index).click();
      if (numberOfBreadcrumbs > 1) {
        BreadboxSelectors.breadcrumbButton().should(
          'have.length.lessThan',
          numberOfBreadcrumbs
        );
      } else {
        BreadboxSelectors.breadcrumbButton().should('not.exist');
      }
    });
}

export function deselectAllBreadcrumbs() {
  BreadboxSelectors.clearAllButton().click();
  BreadboxSelectors.clearAllButton().should('not.exist');
}

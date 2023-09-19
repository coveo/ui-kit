import {performSearch} from '../../../page-objects/actions/action-perform-search';
import {configure} from '../../../page-objects/configurator';
import {getQueryAlias, interceptSearch} from '../../../page-objects/search';
import {
  useCaseParamTest,
  useCaseEnum,
  InsightInterfaceExpectations as InsightInterfaceExpect,
} from '../../../page-objects/use-case';
import {BreadcrumbManagerExpectations} from '../../facets-2/breadcrumb-manager/breadcrumb-manager-expectations';
import {CategoryFacetActions as Actions} from './category-facet-actions';
import {CategoryFacetExpectations as Expect} from './category-facet-expectations';

interface CategoryFacetWithCaptionsOptions {
  field: string;
  value: string;
  caption: string;
  useCase: string;
}

describe('quantic-category-facet with captions', () => {
  const pageUrl = 's/quantic-category-facet-with-captions';

  const field = 'geographicalhierarchy';

  function visitCategoryFacetPage(
    options: Partial<CategoryFacetWithCaptionsOptions> = {}
  ) {
    interceptSearch();
    cy.visit(pageUrl);
    configure(options);
    if (options.useCase === useCaseEnum.insight) {
      InsightInterfaceExpect.isInitialized();
      performSearch();
    }
    cy.wait(getQueryAlias(options.useCase));
  }

  useCaseParamTest
    .filter((param) => param.useCase === useCaseEnum.search)
    .forEach((param) => {
      describe(param.label, () => {
        describe('with default category facet', () => {
          it('should work as expected', () => {
            const value = 'Quebec';
            const caption = 'PoutineLand';

            visitCategoryFacetPage({
              field,
              value,
              caption,
              useCase: param.useCase,
            });

            Actions.selectChildValue('North America');
            Expect.parentValueLabel('North America');

            Actions.selectChildValue('Canada');
            Expect.parentValueLabel('Canada');

            Actions.selectChildValue(caption);
            Expect.parentValueLabel(caption);

            BreadcrumbManagerExpectations.categoryFacetBreadcrumb.firstBreadcrumbValueLabelContains(
              `North America / Canada / ${caption}`
            );
          });
        });
      });
    });
});

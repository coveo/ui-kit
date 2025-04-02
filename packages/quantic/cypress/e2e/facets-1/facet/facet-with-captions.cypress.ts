import {performSearch} from '../../../page-objects/actions/action-perform-search';
import {configure} from '../../../page-objects/configurator';
import {getQueryAlias, interceptSearch} from '../../../page-objects/search';
import {
  useCaseEnum,
  InsightInterfaceExpectations,
  useCaseParamTest,
} from '../../../page-objects/use-case';
import {BreadcrumbManagerExpectations} from '../../facets-2/breadcrumb-manager/breadcrumb-manager-expectations';
import {FacetActions as Actions} from './facet-actions';
import {FacetExpectations as Expect} from './facet-expectations';

interface FacetCaptionOptions {
  useCase: string;
  value: string;
  caption: string;
}

describe('quantic-facet with captions', () => {
  const pageUrl = 's/quantic-facet-with-captions';

  const defaultValue = 'Case';
  const defaultCaption = 'My custom case caption';

  function visitFacetPage(options: Partial<FacetCaptionOptions> = {}) {
    interceptSearch();

    cy.visit(pageUrl);
    configure(options);
    if (options.useCase === useCaseEnum.insight) {
      InsightInterfaceExpectations.isInitialized();
      performSearch();
    }

    cy.wait(getQueryAlias(options.useCase));
  }

  useCaseParamTest
    .filter((param) => param.useCase === useCaseEnum.search)
    .forEach((param) => {
      describe(param.label, () => {
        describe('with custom caption', () => {
          it('should work as expected', () => {
            visitFacetPage({
              useCase: param.useCase,
              value: defaultValue,
              caption: defaultCaption,
            });

            Actions.typeQueryInSearchInput('case');
            Actions.selectSearchValue(defaultCaption);

            Expect.selectedValuesContain(defaultCaption);

            BreadcrumbManagerExpectations.facetBreadcrumb.firstBreadcrumbValueLabelContains(
              defaultCaption
            );
          });
        });
      });
    });
});

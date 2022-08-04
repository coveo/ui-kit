import {configure, reset} from '../../../page-objects/configurator';

import {
  field,
  NumericFacetExpectations as Expect,
} from './numeric-facet-expectations';
import {
  getAlias,
  InterceptAliases,
  interceptSearch,
  mockSearchNoResults,
} from '../../../page-objects/search';
import {NumericFacetActions as Actions} from './numeric-facet-actions';
import {scope} from '../../../reporters/detailed-collector';
import {uesCaseParamTest, useCaseEnum} from '../../../page-objects/use-case';
import {performSearch} from '../../../page-objects/actions/action-perform-search';

interface NumericFacetOptions {
  field: string;
  label: string;
  numberOfValues: number;
  sortCriteria: string;
  rangeAlgorithm: string;
  withInput: string;
  isCollapsed: boolean;
  useCase: string;
}

describe('quantic-numeric-facet', () => {
  const pageUrl = 's/quantic-numeric-facet';

  const defaultField = 'ytlikecount';
  const defaultLabel = 'Youtube Likes';
  const defaultNumberOfValues = 8;

  const defaultSettings = {
    field: defaultField,
    label: defaultLabel,
    numberOfValues: defaultNumberOfValues,
  };
  const customWithInputSettings = {
    field: defaultField,
    label: defaultLabel,
    numberOfValues: defaultNumberOfValues,
    withInput: 'integer',
  };

  function visitNumericFacetPage(
    options: Partial<NumericFacetOptions> = {},
    waitForSearch = true
  ) {
    interceptSearch();
    cy.visit(pageUrl);
    configure(options);
    if (options.useCase !== useCaseEnum.search) {
      cy.wait(1000);
      performSearch();
    }
    if (waitForSearch) {
      cy.wait(getAlias(options.useCase));
    }
  }

  function loadFromUrlHash(
    options: Partial<NumericFacetOptions> = {},
    urlHash: string
  ) {
    interceptSearch();
    cy.visit(`${pageUrl}#${urlHash}`);
    configure(options);
    cy.wait(InterceptAliases.Search);
  }

  uesCaseParamTest.forEach((param) => {
    describe(param.label, () => {
      describe('with default numeric facet', () => {
        it('should work as expected', () => {
          visitNumericFacetPage({...defaultSettings, useCase: param.useCase});

          scope('on initial load', () => {
            Expect.logFacetLoad();
            Expect.displayFacet(true);
            Expect.displayLabel(true);
            Expect.displaySearchForm(false);
            Expect.displayClearButton(false);
            Expect.displayValues(true);
            Expect.labelContains(defaultLabel);
            Expect.numberOfValues(defaultNumberOfValues);
            Expect.numberOfSelectedCheckboxValues(0);
            Expect.numberOfIdleCheckboxValues(defaultNumberOfValues);
          });

          scope('when selecting a value', () => {
            const min = 0;
            const max = 8000;

            visitNumericFacetPage({...defaultSettings, useCase: param.useCase});
            Actions.checkValueAt(0);

            Expect.displayClearButton(true);
            Expect.clearFilterContains('Clear filter');
            Expect.numberOfSelectedCheckboxValues(1);
            Expect.numberOfIdleCheckboxValues(defaultNumberOfValues - 1);
            Expect.logNumericFacetSelect(`${min}..${max}`);
            if (param.useCase === useCaseEnum.search) {
              Expect.urlHashContains(`${min}..${max}`);
            }
          });

          scope('when selecting multiple values', () => {
            visitNumericFacetPage({...defaultSettings, useCase: param.useCase});

            for (let index = 0; index < defaultNumberOfValues; index++) {
              scope(`when selecting ${index + 1} values`, () => {
                const filterLabel =
                  index === 0 ? 'Clear filter' : `Clear ${index + 1} filters`;
                Actions.checkFirstIdleCheckbox();
                cy.wait(InterceptAliases.UA.Facet.Select);

                Expect.displayClearButton(true);
                Expect.clearFilterContains(filterLabel);
                Expect.numberOfSelectedCheckboxValues(index + 1);
                Expect.numberOfIdleCheckboxValues(
                  defaultNumberOfValues - (index + 1)
                );
              });
            }
          });

          scope('when clearing the selection', () => {
            visitNumericFacetPage({...defaultSettings, useCase: param.useCase});

            Actions.checkValueAt(0);
            Actions.checkValueAt(1);
            Expect.displayClearButton(true);

            Actions.clickClearFilter();
            Expect.logClearFacetValues(field);
            Expect.displayClearButton(false);
            Expect.numberOfIdleCheckboxValues(defaultNumberOfValues);
            Expect.numberOfSelectedCheckboxValues(0);
          });
        });
      });
      describe('with custom withInput', () => {
        it('should work as expected', () => {
          visitNumericFacetPage({
            ...customWithInputSettings,
            useCase: param.useCase,
          });

          scope('on initial load', () => {
            Expect.displayFacet(true);
            Expect.displaySearchForm(true);
            Expect.inputMaxEmpty();
            Expect.inputMinEmpty();
          });

          scope('when selecting a valid range', () => {
            const min = 120;
            const max = 8000;

            visitNumericFacetPage({
              ...customWithInputSettings,
              useCase: param.useCase,
            });
            cy.wait(getAlias(param.useCase));

            Actions.inputMinValue(min);
            Actions.inputMaxValue(max);
            Actions.submitManualRange();
            cy.wait(getAlias(param.useCase));

            Expect.displayValues(false);
            Expect.search.numberOfResults(10, param.useCase);
            if (param.useCase === useCaseEnum.search) {
              Expect.urlHashContains(`${min}..${max}`, true);
            }
            Expect.displayClearButton(true);
            Expect.clearFilterContains('Clear filter');
            Expect.logNumericFacetSelect(`${min}..${max}`);
          });

          scope('when selecting a empty range', () => {
            Actions.clickClearFilter();
            cy.wait(InterceptAliases.UA.Facet.ClearAll);

            Actions.submitManualRange();
            Expect.displayInputWarning(1);
            Expect.inputWarningContains();

            Actions.inputMinValue(100);
            Actions.submitManualRange();

            Expect.displayInputWarning(1);
            Expect.inputWarningContains();
            Expect.displayValues(true);
          });

          scope('when min input is bigger than max input', () => {
            visitNumericFacetPage({
              ...customWithInputSettings,
              useCase: param.useCase,
            });
            Actions.inputMinValue(100);
            Actions.inputMaxValue(80);
            Actions.submitManualRange();

            Expect.displayInputWarning(1);
            Expect.inputWarningContains(
              'This value must be less than or equal to 80'
            );
            Expect.displayValues(true);
          });

          scope('when selecting from values', () => {
            visitNumericFacetPage({
              ...customWithInputSettings,
              useCase: param.useCase,
            });
            cy.wait(getAlias(param.useCase));

            Actions.checkValueAt(2);
            cy.wait(InterceptAliases.UA.Facet.Select);
            Expect.displayClearButton(true);
            Expect.clearFilterContains('Clear filter');
            Expect.numberOfSelectedCheckboxValues(1);
            Expect.numberOfIdleCheckboxValues(defaultNumberOfValues - 1);
            Expect.inputMaxEmpty();
            Expect.inputMinEmpty();
          });
        });
      });

      describe('when selecting range with no search results', () => {
        it('should work as expected', () => {
          const min = 1;
          const max = 100000;

          mockSearchNoResults(param.useCase);
          visitNumericFacetPage(
            {
              ...customWithInputSettings,
              useCase: param.useCase,
            },
            false
          );

          Actions.inputMinValue(min);
          Actions.inputMaxValue(max);
          Actions.submitManualRange();

          Expect.displayValues(false);
          Expect.search.numberOfResults(0, param.useCase);
          Expect.displayClearButton(true);
          Expect.clearFilterContains('Clear filter');
        });
      });

      describe('with field returns no results', () => {
        before(() => {
          visitNumericFacetPage({
            field: 'somethingthatdoesnotexist',
            useCase: param.useCase,
          });
        });

        it('should render correctly', () => {
          Expect.displayLabel(false);
        });
      });

      describe('with isCollapsed', () => {
        function setupIsCollapsed() {
          visitNumericFacetPage({
            field: defaultField,
            label: defaultLabel,
            numberOfValues: defaultNumberOfValues,
            isCollapsed: true,
            useCase: param.useCase,
          });
        }

        it('should render correctly', () => {
          setupIsCollapsed();

          Expect.displayFacet(true);
          Expect.labelContains(defaultLabel);
          Expect.displaySearchForm(false);
          Expect.displayValues(false);
          Expect.displayExpandButton(true);
        });
      });
      if (param.useCase === useCaseEnum.search) {
        describe('with a selected range in the URL', () => {
          const min = 120;
          const max = 8000;

          it('should render correctly', () => {
            scope('without input', () => {
              loadFromUrlHash(
                {
                  field: defaultField,
                  useCase: param.useCase,
                },
                `nf[${field}]=${min}..${max}`
              );
              Expect.numberOfSelectedCheckboxValues(1);
              Expect.numberOfIdleCheckboxValues(defaultNumberOfValues - 1);
            });

            reset();

            scope('with input', () => {
              loadFromUrlHash(
                {...customWithInputSettings, useCase: param.useCase},
                `nf[${field}_input]=${min}..${max}`
              );

              Expect.displayFacet(true);
              Expect.inputMaxContains(max);
              Expect.inputMinContains(min);
              Expect.displayValues(false);
              Expect.search.numberOfResults(10, param.useCase);
            });
          });
        });
      }

      describe('with custom #rangeAlgorithm', () => {
        it('should render correctly', () => {
          function setupWithRangeAlgorithm(rangeAlgorithm: string) {
            visitNumericFacetPage(
              {
                field: defaultField,
                label: defaultLabel,
                rangeAlgorithm: rangeAlgorithm,
                useCase: param.useCase,
              },
              false
            );
          }

          scope('with #even value option', () => {
            setupWithRangeAlgorithm('even');

            Expect.displayFacet(true);
            Expect.displayEqualRange(param.useCase);
          });

          scope('with #equiprobable value option', () => {
            setupWithRangeAlgorithm('equiprobable');

            Expect.displayFacet(true);
          });
        });
      });

      describe('with custom sorting', () => {
        ['ascending', 'descending'].forEach((sorting) => {
          it(`should use "${sorting}" sorting in the facet request`, () => {
            visitNumericFacetPage(
              {
                sortCriteria: sorting,
                useCase: param.useCase,
              },
              false
            );
            cy.wait(getAlias(param.useCase)).then((interception) => {
              const facetRequest = interception.request.body.facets[0];
              expect(facetRequest.sortCriteria).to.eq(sorting);
            });
          });
        });
      });

      describe('with custom #numberOfValues', () => {
        it('should work as expected', () => {
          scope('when setting number of values greater than 0', () => {
            visitNumericFacetPage({
              numberOfValues: 2,
              field: defaultField,
              label: defaultLabel,
              useCase: param.useCase,
            });

            Expect.displayLabel(true);
            Expect.displayValues(true);
            Expect.numberOfValues(2);
            Expect.numberOfIdleCheckboxValues(2);
          });

          scope('when setting number of values equal to 0', () => {
            visitNumericFacetPage({
              numberOfValues: 0,
              field: defaultField,
              label: defaultLabel,
              useCase: param.useCase,
            });

            Expect.displayLabel(false);
            Expect.displayValues(false);
          });

          scope(
            'when setting number of values equal to 0 with #withInput',
            () => {
              visitNumericFacetPage({
                numberOfValues: 0,
                field: defaultField,
                label: defaultLabel,
                withInput: 'integer',
                useCase: param.useCase,
              });

              Expect.displayLabel(true);
              Expect.displaySearchForm(true);
              Expect.displayValues(false);
            }
          );
        });
      });
    });
  });
});

import {
  InterceptAliases,
  interceptSearch,
} from '../../../../page-objects/search';
import {useCaseEnum} from '../../../../page-objects/use-case';
import {InsightActions as Actions} from '../actions';
import {InsightExpectations as Expect} from '../expectations';

describe('example insight panel', () => {
  const pageUrl = 's/insight-panel-example';

  function visitInsightPanel(waitForFirstSearch = true) {
    interceptSearch();
    cy.visit(pageUrl);
    if (waitForFirstSearch) {
      Expect.completeSearchRequest('interfaceLoad', useCaseEnum.insight);
    }
  }

  describe('when loading the search page', () => {
    it('should render correctly and load results automatically', () => {
      visitInsightPanel();

      Expect.displaySearchbox(true);
      Expect.displayRefineToggle(true);
      Expect.displaySummary(true);
      Expect.displayPager(true);
      Expect.displayResults();
    });
  });

  describe('when typing a search query', () => {
    it('should trigger a query when typing in searchbox', () => {
      visitInsightPanel();

      const exampleQuery = 'Hello world!';
      Actions.typeInSearchbox(exampleQuery);
      Actions.submitQuery();
      Expect.completeSearchRequest(
        'searchboxSubmit',
        useCaseEnum.insight,
        (body) => {
          expect(body).to.have.property('q', exampleQuery);
        }
      );
    });
  });

  describe('when selecting a facet value', () => {
    it('should trigger query when selecting a facet value', () => {
      visitInsightPanel(false);
      let firstFacetValue: string;
      const exampleFacetField = 'objecttype';

      cy.wait(InterceptAliases.Insight).then((interception) => {
        firstFacetValue = interception.response?.body.facets.find(
          (f: {field: string}) => f.field === exampleFacetField
        ).values[0].value;
        Actions.selectFacetValue(firstFacetValue);
      });

      Expect.completeSearchRequest(
        'facetSelect',
        useCaseEnum.insight,
        (body) => {
          const expectedSelectedFacetValue = body.facets
            .find?.(
              (facet: {field: string}) => facet.field === exampleFacetField
            )
            .currentValues.find(
              (facetItem: {value: string}) =>
                facetItem.value === firstFacetValue
            );
          expect(expectedSelectedFacetValue).to.have.property(
            'state',
            'selected'
          );
        }
      );
    });
  });

  describe('when changing result page', () => {
    it('should request new result page when clicking a specific page in the pager', () => {
      visitInsightPanel();
      Expect.summaryContainsText('Results 1-5');

      Actions.selectPagerButton(2);
      Expect.completeSearchRequest(
        'pagerNumber',
        useCaseEnum.insight,
        (body) => {
          expect(body).to.have.property('firstResult', 5);
        }
      );
      Expect.summaryContainsText('Results 6-10');
    });
  });
});

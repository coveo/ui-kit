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
      Expect.sendNewSearchRequest('interfaceLoad', useCaseEnum.insight);
    }
  }

  describe('when loading the search page', () => {
    it('should load results automatically', () => {
      visitInsightPanel();

      Expect.displaySearchbox(true);
      Expect.displayRefineToggle(true);
      Expect.displaySummary(true);
      Expect.displayPager(true);
      Expect.displayResults();
    });
  });

  describe('when typing a search query', () => {
    it('should trigger query when typing in searchbox', () => {
      visitInsightPanel();

      const exampleQuery = 'Hello world!';
      Actions.typeInSearchbox(exampleQuery);
      Actions.submitQuery();
      Expect.sendNewSearchRequest(
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

      cy.wait(InterceptAliases.Insight).then((interception) => {
        const firstFacetValue = interception.response?.body.facets.find(
          (f: {field: string}) => f.field === 'objecttype'
        ).values[0].value;
        Actions.selectFacetValue(firstFacetValue);
      });

      Expect.sendNewSearchRequest('facetSelect', useCaseEnum.insight);
    });
  });

  describe('when changing result page', () => {
    it('should request new result page when clicking a specific page in the pager', () => {
      visitInsightPanel();
      Expect.summaryContainsText('Results 1-5');

      Actions.selectPagerButton(2);
      Expect.sendNewSearchRequest(
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

import exampleResult from '../../../../fixtures/folded-result-list/exampleResult.json';
import exampleResultWithMoreChildResults from '../../../../fixtures/folded-result-list/exampleResultWithMoreChildResults.json';
import {configure} from '../../../../page-objects/configurator';
import {
  interceptSearch,
  interceptSearchIndefinitely,
  mockSearchWithResults,
} from '../../../../page-objects/search';
import {scope} from '../../../../reporters/detailed-collector';
import {FoldedResultListActions as Actions} from './folded-result-list-actions';
import {FoldedResultListExpectations as Expect} from './folded-result-list-expectations';

interface FoldedResultListOptions {
  fieldsToInclude: string;
  collectionField: string;
  parentField: string;
  childField: string;
  numberOfFoldedResults: number;
}

describe('quantic-folded-result-list', () => {
  const pageUrl = 's/quantic-folded-result-list';
  const result = exampleResult.data[0];
  const resultHierarchy = exampleResult.hierarchy[0];
  const resultHierarchyWithMoreChildResults =
    exampleResultWithMoreChildResults.hierarchy[0];

  const defaultFieldsToInclude =
    'date,author,source,language,filetype,parents,sfknowledgearticleid';
  const defaultCollectionField = 'foldingcollection';
  const defaultParentField = 'foldingchild';
  const defaultChildField = 'foldingparent';
  const defaultNumberOfFoldedResults = 2;
  const registerResultTemplatesEvent = 'registerresulttemplates';

  function visitFoldedResultList(
    options: Partial<FoldedResultListOptions> = {},
    withoutChildResults = false
  ) {
    interceptSearch();
    if (!withoutChildResults) {
      mockSearchWithResults(exampleResult.data);
    } else {
      mockSearchWithResults();
    }
    cy.visit(pageUrl);
    configure(options);
  }

  function setupWithPauseBeforeSearch() {
    interceptSearchIndefinitely();
    cy.visit(pageUrl);
    configure();
  }

  it('should render a placeholder before results have returned', () => {
    setupWithPauseBeforeSearch();

    Expect.displayPlaceholder(true);
    Expect.displayResults(false);
  });

  describe('with default folding options', () => {
    it('should send the proper folding options in the search request', () => {
      visitFoldedResultList();

      scope('when loading the page', () => {
        Expect.events.receivedEvent(true, registerResultTemplatesEvent);
        Expect.resultsEqual(resultHierarchy);
        Expect.properFoldingRequestPayload(
          {
            fieldsToInclude: defaultFieldsToInclude.split(','),
            collectionField: defaultCollectionField,
            parentField: defaultParentField,
            childField: defaultChildField,
            numberOfFoldedResults: defaultNumberOfFoldedResults,
          },
          'search'
        );
      });
    });

    it('should properly display the child results', () => {
      visitFoldedResultList();

      scope('when loading the page', () => {
        Expect.events.receivedEvent(true, registerResultTemplatesEvent);
        Expect.resultsEqual(resultHierarchy);
      });

      scope('when showing more results', () => {
        mockSearchWithResults(exampleResultWithMoreChildResults.data);
        Actions.toggleMoreChidResults();
        Expect.resultsEqual(resultHierarchyWithMoreChildResults);
        Expect.logShowMoreFoldedResults({
          documentId: {
            contentIdKey: 'permanentid',
            contentIdValue: result.parentResult.raw.permanentid,
          },
          title: result.parentResult.title,
          uri: result.parentResult.uri,
          position: 1,
        });
        Expect.displayNoMoreChildrenMessage(false);
      });

      scope('when showing less results', () => {
        Actions.toggleMoreChidResults();
        Expect.resultsEqual(resultHierarchy);
        Expect.logShowLessFoldedResults();
      });
    });

    describe('when no child result has been found after loading all the collection', () => {
      it('hould display the no more related documents messages', () => {
        visitFoldedResultList();

        scope('when loading the page', () => {
          Expect.events.receivedEvent(true, registerResultTemplatesEvent);
          Expect.resultsEqual(resultHierarchy);
        });

        scope('when showing more results', () => {
          Actions.toggleMoreChidResults();
          Expect.resultsEqual(resultHierarchy);
          Expect.logShowMoreFoldedResults({
            documentId: {
              contentIdKey: 'permanentid',
              contentIdValue: result.parentResult.raw.permanentid,
            },
            title: result.parentResult.title,
            uri: result.parentResult.uri,
            position: 1,
          });
          Expect.displayNoMoreChildrenMessage(true);
        });
      });
    });

    describe('when the result has no child result', () => {
      it('should display the no more related documents message', () => {
        visitFoldedResultList({}, true);

        scope('when loading the page', () => {
          Expect.displayNoMoreChildrenMessage(true);
        });
      });
    });
  });

  describe('with custom folding options', () => {
    const customFieldsToInclude =
      'source,language,sfcasestatus,sfcreatedbyname';
    const customCollectionField = 'customfoldingcollection';
    const customParentField = 'customfoldingchild';
    const customChildField = 'customfoldingparent';
    const customNumberOfFoldedResults = 3;

    it('should send the proper folding options in the search request', () => {
      visitFoldedResultList({
        fieldsToInclude: customFieldsToInclude,
        collectionField: customCollectionField,
        parentField: customChildField,
        childField: customParentField,
        numberOfFoldedResults: customNumberOfFoldedResults,
      });

      Expect.properFoldingRequestPayload(
        {
          fieldsToInclude: customFieldsToInclude.split(','),
          collectionField: customCollectionField,
          parentField: customParentField,
          childField: customChildField,
          numberOfFoldedResults: customNumberOfFoldedResults,
        },
        'search'
      );
    });
  });
});

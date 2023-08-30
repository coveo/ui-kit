import {getQueryAlias, InterceptAliases} from '../../../../page-objects/search';
import {getAnalyticsBodyFromInterception} from '../../../common-expectations';
import {should} from '../../../common-selectors';
import {EventExpectations} from '../../../event-expectations';
import {resultListExpectations} from '../result-list-expectations';
import {
  FoldedResultListSelector,
  FoldedResultListSelectors,
} from './folded-result-list-selectors';

interface FoldingRequestPayload {
  fieldsToInclude: string[];
  collectionField: string;
  parentField: string;
  childField: string;
  numberOfFoldedResults: number;
}

interface Result {
  documentId: {contentIdKey: string; contentIdValue: string};
  title: string;
  uri: string;
  position: number;
}

function logFoldingActionEvent(
  eventName: string,
  eventType: 'click' | 'custom',
  result?: Result
) {
  const {title, uri, position, documentId} = result || {};
  cy.wait(eventName)
    .then((interception) => {
      const analyticsBody = getAnalyticsBodyFromInterception(interception);
      const customData = analyticsBody.customData;
      if (eventType === 'click') {
        expect(analyticsBody).to.have.property('documentTitle', title);
        expect(analyticsBody).to.have.property('documentUri', uri);
        expect(analyticsBody).to.have.property('documentUrl', uri);
        expect(analyticsBody).to.have.property('documentPosition', position);
        expect(customData).to.have.property(
          'contentIDKey',
          documentId?.contentIdKey
        );
        expect(customData).to.have.property(
          'contentIDValue',
          documentId?.contentIdValue
        );
      }
    })
    .logDetail(`should log the ${eventName} UA event`);
}

interface ResultHierarchy {
  title: string;
  children?: ResultHierarchy[];
}

export function foldedResultListExpectations(
  selector: FoldedResultListSelector
) {
  function expectProperResultDisplay(
    level: number,
    index: number,
    result: ResultHierarchy
  ) {
    selector
      .resultLinksAtSpecificLevel(level)
      .then((elem) => {
        expect(elem[index].innerText).to.eq(result.title);
      })
      .logDetail('should display the correct result title');
    if (result.children) {
      selector
        .resultLinksAtSpecificLevel(level + 1)
        .then((elem) => {
          expect(elem.length).to.eq(
            result.children?.length,
            `incorrect number of children displayed. ${elem.length} was received when ${result.children?.length} was expected.`
          );
        })
        .logDetail('should display the correct number of child results');
    }
  }

  function expectProperResultHierarchyDisplay(
    result: ResultHierarchy,
    level: number,
    index: number
  ) {
    expectProperResultDisplay(level, index, result);
    if (result.children) {
      result.children.forEach((child, i) => {
        expectProperResultHierarchyDisplay(child, level + 1, i);
      });
    }
  }

  return {
    resultsEqual: (resultHierarchy: ResultHierarchy) => {
      expectProperResultHierarchyDisplay(resultHierarchy, 0, 0);
    },

    displayNoMoreChildrenMessage: (display: boolean) => {
      selector
        .noMoreChildrenMessage()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should} display the no more related documents message`);
    },

    properFoldingRequestPayload: (
      payload: FoldingRequestPayload,
      useCase: string
    ) => {
      const {
        fieldsToInclude: expectedFieldsToInclude,
        collectionField: expectedCollectionField,
        parentField: expectedParentField,
        childField: expectedChildField,
        numberOfFoldedResults: expectedNumberOfFoldedResults,
      } = payload;
      cy.wait(getQueryAlias(useCase))
        .then((interception) => {
          const fieldsToInclude = interception.request.body.fieldsToInclude;
          const collectionField = interception.request.body.filterField;
          const parentField = interception.request.body.parentField;
          const childField = interception.request.body.childField;
          const numberOfFoldedResults =
            interception.request.body.filterFieldRange;
          expect(collectionField).to.eq(expectedCollectionField);
          expect(parentField).to.eq(expectedParentField);
          expect(childField).to.eq(expectedChildField);
          expect(numberOfFoldedResults).to.eq(expectedNumberOfFoldedResults);
          expectedFieldsToInclude.forEach((field) =>
            expect(fieldsToInclude).to.include(field)
          );
        })
        .logDetail('folding options should be properly sent in the request');
    },

    logShowLessFoldedResults: () => {
      logFoldingActionEvent(
        InterceptAliases.UA.ShowLessFoldedResults,
        'custom'
      );
    },

    logShowMoreFoldedResults: (result: Result) => {
      logFoldingActionEvent(
        InterceptAliases.UA.ShowMoreFoldedResults,
        'click',
        result
      );
    },
  };
}

export const FoldedResultListExpectations = {
  ...resultListExpectations(FoldedResultListSelectors),
  ...foldedResultListExpectations(FoldedResultListSelectors),
  events: {
    ...EventExpectations,
  },
};

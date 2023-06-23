import {
  RecommendationListSelector,
  RecommendationListSelectors,
} from './recommendation-list-selectors';

function recommendationListActions(selector: RecommendationListSelector) {
  return {
    clickRecommendationLink: (index: number) =>
      selector
        .recommendationLinks()
        .eq(index)
        .then((elem) => {
          elem.attr('href', '#');
        })
        .click()
        .logAction('When clicking on a recommendation link'),
  };
}

export const RecommendationListActions = {
  ...recommendationListActions(RecommendationListSelectors),
};

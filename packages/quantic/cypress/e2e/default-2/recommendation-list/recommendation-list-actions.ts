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
        .click({force: true})
        .logAction('When clicking on a recommendation link'),
  };
}

export const RecommendationListActions = {
  ...recommendationListActions(RecommendationListSelectors),
};

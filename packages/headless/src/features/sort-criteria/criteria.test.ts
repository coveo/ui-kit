import {
  buildCriterionExpression,
  buildDateSortCriterion,
  buildFieldSortCriterion,
  buildNoSortCriterion,
  buildQueryRankingExpressionSortCriterion,
  buildRelevanceSortCriterion,
  SortOrder,
} from './criteria.js';

describe('sort-criterion functions', () => {
  it('#buildRelevanceSortCriterion returns the correct value', () => {
    const expression = buildCriterionExpression(buildRelevanceSortCriterion());
    expect(expression).toBe('relevancy');
  });

  it('#buildQueryRankingExpressionSortCriterion returns the correct value', () => {
    const expression = buildCriterionExpression(
      buildQueryRankingExpressionSortCriterion()
    );
    expect(expression).toBe('qre');
  });

  it('#buildNoSortCriterion returns the correct value', () => {
    const expression = buildCriterionExpression(buildNoSortCriterion());
    expect(expression).toBe('nosort');
  });

  it('#buildDateSortCriterion with order ascending returns the correct value', () => {
    const expression = buildCriterionExpression(
      buildDateSortCriterion(SortOrder.Ascending)
    );
    expect(expression).toBe('date ascending');
  });

  it('#buildDateSortCriterion with order descending returns the correct value', () => {
    const expression = buildCriterionExpression(
      buildDateSortCriterion(SortOrder.Descending)
    );
    expect(expression).toBe('date descending');
  });

  it('#buildFieldSortCriterion with order ascending returns the correct value', () => {
    const field = 'author';
    const expression = buildCriterionExpression(
      buildFieldSortCriterion(field, SortOrder.Ascending)
    );

    expect(expression).toBe(`@${field} ascending`);
  });

  it('#buildFieldSortCriterion with order descending returns the correct value', () => {
    const field = 'author';
    const expression = buildCriterionExpression(
      buildFieldSortCriterion(field, SortOrder.Descending)
    );

    expect(expression).toBe(`@${field} descending`);
  });

  it('#buildCompositeSortCriterion with one sortCriterion returns the correct value', () => {
    const dateDescending = buildDateSortCriterion(SortOrder.Descending);
    const expression = buildCriterionExpression([dateDescending]);

    expect(expression).toBe(buildCriterionExpression(dateDescending));
  });

  it('#buildCompositeSortCriterion with two sortCriteria returns the correct value', () => {
    const dateDescending = buildDateSortCriterion(SortOrder.Descending);
    const authorAlphabetical = buildFieldSortCriterion(
      'author',
      SortOrder.Ascending
    );
    const expression = buildCriterionExpression([
      dateDescending,
      authorAlphabetical,
    ]);

    const expectedExpression = `${buildCriterionExpression(
      dateDescending
    )},${buildCriterionExpression(authorAlphabetical)}`;

    expect(expression).toBe(expectedExpression);
  });
});

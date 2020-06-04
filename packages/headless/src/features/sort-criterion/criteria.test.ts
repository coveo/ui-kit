import {
  buildRelevanceSortCriterion,
  buildQueryRankingExpressionSortCriterion,
  buildNoSortCriterion,
  buildDateSortCriterion,
  buildFieldSortCriterion,
  buildCompositeSortCriterion,
} from './criteria';

describe('sort-criterion functions', () => {
  it('#buildRelevanceSortCriterion returns the correct value', () => {
    const {expression} = buildRelevanceSortCriterion();
    expect(expression).toBe('relevancy');
  });

  it('#buildQueryRankingExpressionSortCriterion returns the correct value', () => {
    const {expression} = buildQueryRankingExpressionSortCriterion();
    expect(expression).toBe('qre');
  });

  it('#buildNoSortCriterion returns the correct value', () => {
    const {expression} = buildNoSortCriterion();
    expect(expression).toBe('nosort');
  });

  it('#buildDateSortCriterion with order ascending returns the correct value', () => {
    const {expression} = buildDateSortCriterion('ascending');
    expect(expression).toBe('date ascending');
  });

  it('#buildDateSortCriterion with order descending returns the correct value', () => {
    const {expression} = buildDateSortCriterion('descending');
    expect(expression).toBe('date descending');
  });

  it('#buildFieldSortCriterion with order ascending returns the correct value', () => {
    const field = 'author';
    const {expression} = buildFieldSortCriterion(field, 'ascending');

    expect(expression).toBe(`@${field} ascending`);
  });

  it('#buildFieldSortCriterion with order descending returns the correct value', () => {
    const field = 'author';
    const {expression} = buildFieldSortCriterion(field, 'descending');

    expect(expression).toBe(`@${field} descending`);
  });

  it('#buildCompositeSortCriterion with one sortCriterion returns the correct value', () => {
    const dateDescending = buildDateSortCriterion('descending');
    const {expression} = buildCompositeSortCriterion([dateDescending]);

    expect(expression).toBe(dateDescending.expression);
  });

  it('#buildCompositeSortCriterion with two sortCriteria returns the correct value', () => {
    const dateDescending = buildDateSortCriterion('descending');
    const authorAlphabetical = buildFieldSortCriterion('author', 'ascending');
    const {expression} = buildCompositeSortCriterion([
      dateDescending,
      authorAlphabetical,
    ]);

    const expectedExpression = `${dateDescending.expression},${authorAlphabetical.expression}`;

    expect(expression).toBe(expectedExpression);
  });
});

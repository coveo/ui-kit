import {
  buildRelevanceSortCriterion,
  buildQueryRankingExpressionSortCriterion,
  buildNoSortCriterion,
  buildDateSortCriterion,
  buildFieldSortCriterion,
  buildCriterionExpression,
  SortOrder,
  parseCriterionExpression,
  SortBy,
} from './criteria';

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

  describe('#parseCriterionExpression', () => {
    it('when criterion expression is empty, throws an error', () => {
      expect(() => parseCriterionExpression('')).toThrowError(
        'Wrong criterion expression format'
      );
    });

    it('when criterion expression contains an invalid order, throws an error', () => {
      expect(() => parseCriterionExpression('size desc')).toThrowError(
        'Wrong criterion sort order'
      );
    });

    it('should parse SortByRelevancy criterion correctly', () => {
      const criteria = parseCriterionExpression(SortBy.Relevancy);
      expect(criteria[0]).toEqual(buildRelevanceSortCriterion());
    });

    it('should parse SortByQRE criterion correctly', () => {
      const criteria = parseCriterionExpression(SortBy.QRE);
      expect(criteria[0]).toEqual(buildQueryRankingExpressionSortCriterion());
    });

    it('should parse SortByDate criterion correctly', () => {
      const order = SortOrder.Descending;
      const criteria = parseCriterionExpression(`${SortBy.Date} ${order}`);
      expect(criteria[0]).toEqual(buildDateSortCriterion(order));
    });

    it('when SortByDate criterion has no order, should throw', () => {
      expect(() => parseCriterionExpression('date')).toThrowError(
        '"order" should be specified when "by" value is "date"'
      );
    });

    it('should parse SortByNoSort criterion correctly', () => {
      const criteria = parseCriterionExpression(SortBy.NoSort);
      expect(criteria[0]).toEqual(buildNoSortCriterion());
    });

    it('should parse SortByField criterion correctly', () => {
      const field = 'size';
      const order = SortOrder.Ascending;
      const criteria = parseCriterionExpression(`${field} ${order}`);
      expect(criteria[0]).toEqual(buildFieldSortCriterion(field, order));
    });

    it('when SortByField criterion has no order, should throw', () => {
      expect(() => parseCriterionExpression('size')).toThrowError(
        '"order" should be specified when "by" value is "field"'
      );
    });

    it('should split expressions by comma', () => {
      expect(
        parseCriterionExpression(
          ` ${SortBy.Relevancy}, ${SortBy.QRE},size ${SortOrder.Ascending}`
        ).length
      ).toBe(3);
    });
  });
});

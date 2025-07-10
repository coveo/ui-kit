import pino, {type Logger} from 'pino';
import {buildMockCategoryFacetSlice} from '../../../../test/mock-category-facet-slice.js';
import {buildMockDateFacetSlice} from '../../../../test/mock-date-facet-slice.js';
import {buildMockFacetSlice} from '../../../../test/mock-facet-slice.js';
import {buildMockNumericFacetSlice} from '../../../../test/mock-numeric-facet-slice.js';
import {type FacetIdConfig, generateFacetId} from './facet-id-generator.js';

describe('#generateFacetId', () => {
  let config: FacetIdConfig;
  let logger: Logger;
  let prefix: string;

  function getPrefixForField(field: string) {
    return `${field}_`;
  }

  function getFacetId() {
    return generateFacetId(config, logger);
  }

  function initLogger() {
    logger = pino({level: 'silent'});
    logger.warn = vi.fn();
  }

  beforeEach(() => {
    config = {
      field: 'author',
      state: {},
    };

    initLogger();

    prefix = getPrefixForField(config.field);
  });

  describe('when no facet set is used the field as an id', () => {
    it('generates an id equal to the field', () => {
      const id = getFacetId();
      expect(id).toBe(config.field);
    });

    it('does not log a warning', () => {
      getFacetId();
      expect(logger.warn).not.toHaveBeenCalled();
    });
  });

  describe('when the field is used as an id in the facetSet', () => {
    beforeEach(() => {
      const facetSet = {[config.field]: buildMockFacetSlice()};
      config.state = {facetSet};
    });

    it('it generates an id with 1 appended to the field', () => {
      const id = getFacetId();
      expect(id).toBe(`${prefix}1`);
    });

    it('the id meets the searchapi regex check', () => {
      const id = getFacetId();
      expect(id).toMatch(/[A-Za-z0-9-_]{1,60}/);
    });

    it('logs a warning', () => {
      getFacetId();
      expect(logger.warn).toHaveBeenCalledTimes(1);
    });
  });

  it(`when a facet set contains multiple ids using the same field,
  it generates an id with a suffix one greater than the largest number`, () => {
    const facetSet = {
      [config.field]: buildMockFacetSlice(),
      [`${prefix}10`]: buildMockFacetSlice(),
    };
    config.state = {facetSet};

    const id = getFacetId();
    expect(id).toBe(`${prefix}11`);
  });

  it(`when the field is used in all facet sets,
  it generates an id with a suffix one greater than the largest number`, () => {
    const facetSet = {[config.field]: buildMockFacetSlice()};
    const numericFacetSet = {[`${prefix}1`]: buildMockNumericFacetSlice()};
    const dateFacetSet = {[`${prefix}2`]: buildMockDateFacetSlice()};
    const categoryFacetSet = {
      [`${prefix}3`]: buildMockCategoryFacetSlice(),
    };

    config.state = {
      facetSet,
      numericFacetSet,
      dateFacetSet,
      categoryFacetSet,
    };

    const id = getFacetId();
    expect(id).toBe(`${prefix}4`);
  });

  it(`when the state contains an id based on a different field,
  it generates an id equal to the field`, () => {
    const facetSet = {
      [getPrefixForField('filetype')]: buildMockFacetSlice(),
    };
    config.state = {facetSet};

    const id = getFacetId();
    expect(id).toBe(config.field);
  });

  it(`when the state contains an id with the same field but ending with a letter,
  it generates an id equal to the field`, () => {
    const facetSet = {[`${prefix}a`]: buildMockFacetSlice()};
    config.state = {facetSet};

    const id = getFacetId();
    expect(id).toBe(config.field);
  });
});

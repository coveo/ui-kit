import pino, {Logger} from 'pino';
import {createMockState} from '../../../test';
import {buildMockCategoryFacetRequest} from '../../../test/mock-category-facet-request';
import {buildMockDateFacetRequest} from '../../../test/mock-date-facet-request';
import {buildMockFacetRequest} from '../../../test/mock-facet-request';
import {buildMockNumericFacetRequest} from '../../../test/mock-numeric-facet-request';
import {
  generateFacetId,
  FacetIdConfig,
  isBeingUsedAsFacetId,
} from './facet-id-generator';

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
    logger.warn = jest.fn();
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
      const facetSet = {[config.field]: buildMockFacetRequest()};
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
      [config.field]: buildMockFacetRequest(),
      [`${prefix}10`]: buildMockFacetRequest(),
    };
    config.state = {facetSet};

    const id = getFacetId();
    expect(id).toBe(`${prefix}11`);
  });

  it(`when the field is used in all facet sets,
  it generates an id with a suffix one greater than the largest number`, () => {
    const facetSet = {[config.field]: buildMockFacetRequest()};
    const numericFacetSet = {[`${prefix}1`]: buildMockNumericFacetRequest()};
    const dateFacetSet = {[`${prefix}2`]: buildMockDateFacetRequest()};
    const categoryFacetSet = {
      [`${prefix}3`]: buildMockCategoryFacetRequest(),
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
      [getPrefixForField('filetype')]: buildMockFacetRequest(),
    };
    config.state = {facetSet};

    const id = getFacetId();
    expect(id).toBe(config.field);
  });

  it(`when the state contains an id with the same field but ending with a letter,
  it generates an id equal to the field`, () => {
    const facetSet = {[`${prefix}a`]: buildMockFacetRequest()};
    config.state = {facetSet};

    const id = getFacetId();
    expect(id).toBe(config.field);
  });
});

describe('#isBeingUsedAsFacetId', () => {
  it('when the facetId is not used, it returns false', () => {
    const state = createMockState();
    expect(isBeingUsedAsFacetId(state, 'a')).toBe(false);
  });

  it('when the facetId is used, it returns true', () => {
    const state = createMockState();
    state.facetSet = {a: buildMockFacetRequest()};

    expect(isBeingUsedAsFacetId(state, 'a')).toBe(true);
  });
});

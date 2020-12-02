import {buildMockFacetRequest} from '../../../test/mock-facet-request';
import {generateFacetId, FacetIdConfig, Logger} from './facet-id-generator';

describe('facet selectors', () => {
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

    beforeEach(() => {
      config = {
        field: 'author',
        state: {},
      };

      logger = {warn: jest.fn()};

      prefix = getPrefixForField(config.field);
    });

    describe('when the state does not contain a facet with the field', () => {
      it('generates an id equal to the field', () => {
        const id = getFacetId();
        expect(id).toBe(config.field);
      });

      it('does not log a warning', () => {
        getFacetId();
        expect(logger.warn).not.toHaveBeenCalled();
      });
    });

    describe('when the state contains a facet id using the same field', () => {
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

    it(`when the state contains multiple facet ids with the same field,
    it generates an id with a suffix one greater than the largest number`, () => {
      const facetSet = {
        [config.field]: buildMockFacetRequest(),
        [`${prefix}10`]: buildMockFacetRequest(),
      };
      config.state = {facetSet};

      const id = getFacetId();
      expect(id).toBe(`${prefix}11`);
    });

    // it(`when the field is used in other facet sets,
    // it generates an id with a suffix one greater than the largest number`, () => {
    //   config.state = {
    //     facetSet: {}
    //   }
    // })

    it(`when the state contains a facet id with a different field,
    it generates an id equal to the field`, () => {
      const facetSet = {
        [getPrefixForField('filetype')]: buildMockFacetRequest(),
      };
      config.state = {facetSet};

      const id = getFacetId();
      expect(id).toBe(config.field);
    });

    it(`when the state contains a facet id with the same field but ending with a letter,
    it generates an id equal to the field`, () => {
      const facetSet = {[`${prefix}a`]: buildMockFacetRequest()};
      config.state = {facetSet};

      const id = getFacetId();
      expect(id).toBe(config.field);
    });
  });
});

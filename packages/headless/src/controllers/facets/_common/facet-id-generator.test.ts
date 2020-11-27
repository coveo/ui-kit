import {buildMockFacetRequest} from '../../../test/mock-facet-request';
import {determineFacetId, FacetIdConfig} from './facet-id-generator';

describe('facet selectors', () => {
  describe('#determineFacetId', () => {
    let config: Required<FacetIdConfig>;
    let prefix: string;

    function getPrefixForField(field: string) {
      return `${config.type}_${field}_`;
    }

    beforeEach(() => {
      config = {
        type: 'specific',
        field: 'author',
        state: {},
        logger: {warn: jest.fn()},
      };

      prefix = getPrefixForField(config.field);
    });

    describe('when the state does not contain a facet with the field', () => {
      it('generates an id ending with 0', () => {
        const id = determineFacetId(config);
        expect(id).toBe(`${prefix}0`);
      });

      it('does not log a warning', () => {
        determineFacetId(config);
        expect(config.logger.warn).not.toHaveBeenCalled();
      });
    });

    describe('when the state contains a facet id with the same field', () => {
      beforeEach(() => {
        config.state = {[`${prefix}0`]: buildMockFacetRequest()};
      });

      it('it appends a number incremented by 1', () => {
        const id = determineFacetId(config);
        expect(id).toBe(`${prefix}1`);
      });

      it('logs a warning', () => {
        determineFacetId(config);
        expect(config.logger.warn).toHaveBeenCalledTimes(1);
      });
    });

    it(`when the state contains multiple facet ids with the same field,
    it appends a number one greater than the largest number`, () => {
      config.state = {
        [`${prefix}0`]: buildMockFacetRequest(),
        [`${prefix}10`]: buildMockFacetRequest(),
      };

      const id = determineFacetId(config);
      expect(id).toBe(`${prefix}11`);
    });

    it(`when the state contains a facet id with a different field,
    it generates an id ending with 0`, () => {
      config.state = {
        [`${getPrefixForField('filetype')}0`]: buildMockFacetRequest(),
      };

      const id = determineFacetId(config);
      expect(id).toBe(`${prefix}0`);
    });

    it(`when the state contains a facet id with the same field but ending with a letter,
    it generates an id ending with 0`, () => {
      config.state = {[`${prefix}a`]: buildMockFacetRequest()};

      const id = determineFacetId(config);
      expect(id).toBe(`${prefix}0`);
    });
  });
});

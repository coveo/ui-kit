import {ResultTemplatesHelpers} from '@coveo/headless';
import {
  makeMatchConditions,
  makeDefinedConditions,
} from './stencil-result-template-common';

describe('result-template-common', () => {
  const testField = 'field';
  const otherTestField = 'otherfield';

  describe('makeMatchConditions', () => {
    const testMatchCondition = {
      [testField]: ['value'],
    };
    const testMultipleConditions = {
      ...testMatchCondition,
      [otherTestField]: ['othervalue'],
    };

    let fieldMustMatchSpy: jest.SpyInstance;
    let fieldMustNotMatchSpy: jest.SpyInstance;

    beforeEach(() => {
      fieldMustMatchSpy = jest.spyOn(ResultTemplatesHelpers, 'fieldMustMatch');
      fieldMustNotMatchSpy = jest.spyOn(
        ResultTemplatesHelpers,
        'fieldMustNotMatch'
      );
    });

    describe('when given only #mustMatch fields', () => {
      it('should return an array of "must match" conditions', () => {
        const conditions = makeMatchConditions(testMatchCondition, {});

        expect(conditions).toHaveLength(1);
        expect(fieldMustMatchSpy).toHaveBeenCalledWith(
          testField,
          testMatchCondition[testField]
        );
      });

      describe('when given multiple fields', () => {
        it('should return an array of "must match" conditions', () => {
          const conditions = makeMatchConditions(testMultipleConditions, {});

          expect(conditions).toHaveLength(2);
          expect(fieldMustMatchSpy).toHaveBeenCalledWith(
            testField,
            testMultipleConditions[testField]
          );
          expect(fieldMustMatchSpy).toHaveBeenCalledWith(
            otherTestField,
            testMultipleConditions[otherTestField]
          );
        });
      });
    });

    describe('when given only #mustNotMatch fields', () => {
      it('should return an array of "must not match" conditions', () => {
        const conditions = makeMatchConditions({}, testMatchCondition);

        expect(conditions).toHaveLength(1);
        expect(fieldMustNotMatchSpy).toHaveBeenCalledWith(
          testField,
          testMatchCondition[testField]
        );
      });

      describe('when given multiple fields', () => {
        it('should return an array of "must not match" conditions', () => {
          const conditions = makeMatchConditions({}, testMultipleConditions);

          expect(conditions).toHaveLength(2);
          expect(fieldMustNotMatchSpy).toHaveBeenCalledWith(
            testField,
            testMultipleConditions[testField]
          );
          expect(fieldMustNotMatchSpy).toHaveBeenCalledWith(
            otherTestField,
            testMultipleConditions[otherTestField]
          );
        });
      });
    });

    it('should return an array of must match conditions', () => {
      const conditions = makeMatchConditions(
        testMatchCondition,
        testMatchCondition
      );

      expect(conditions).toHaveLength(2);
      expect(fieldMustMatchSpy).toHaveBeenCalledWith(
        testField,
        testMatchCondition[testField]
      );
      expect(fieldMustNotMatchSpy).toHaveBeenCalledWith(
        testField,
        testMatchCondition[testField]
      );
    });
  });

  describe('makeDefinedConditions', () => {
    let fieldsMustBeDefinedSpy: jest.SpyInstance;
    let fieldsMustNotBeDefinedSpy: jest.SpyInstance;

    beforeEach(() => {
      fieldsMustBeDefinedSpy = jest.spyOn(
        ResultTemplatesHelpers,
        'fieldsMustBeDefined'
      );
      fieldsMustNotBeDefinedSpy = jest.spyOn(
        ResultTemplatesHelpers,
        'fieldsMustNotBeDefined'
      );
    });

    describe('when given only #ifDefined fields', () => {
      it('should return an array of "if defined" conditions', () => {
        const conditions = makeDefinedConditions(testField);

        expect(conditions).toHaveLength(1);
        expect(fieldsMustBeDefinedSpy).toHaveBeenCalledWith([testField]);
      });

      describe('when given multiple fields', () => {
        it('should return an array of "if defined" conditions', () => {
          const conditions = makeDefinedConditions(
            `${testField},${otherTestField}`
          );

          expect(conditions).toHaveLength(1);
          expect(fieldsMustBeDefinedSpy).toHaveBeenCalledWith([
            testField,
            otherTestField,
          ]);
        });
      });
    });

    describe('when given only #ifNotDefined fields', () => {
      it('should return an array of "if not defined" conditions', () => {
        const conditions = makeDefinedConditions(undefined, testField);

        expect(conditions).toHaveLength(1);
        expect(fieldsMustNotBeDefinedSpy).toHaveBeenCalledWith([testField]);
      });

      describe('when given multiple fields', () => {
        it('should return an array of "if not defined" conditions', () => {
          const conditions = makeDefinedConditions(
            undefined,
            `${testField},${otherTestField}`
          );

          expect(conditions).toHaveLength(1);
          expect(fieldsMustNotBeDefinedSpy).toHaveBeenCalledWith([
            testField,
            otherTestField,
          ]);
        });
      });
    });

    it('should return an array of field conditions', () => {
      const conditions = makeDefinedConditions(testField, otherTestField);

      expect(conditions).toHaveLength(2);
      expect(fieldsMustBeDefinedSpy).toHaveBeenCalledWith([testField]);
      expect(fieldsMustNotBeDefinedSpy).toHaveBeenCalledWith([otherTestField]);
    });
  });
});

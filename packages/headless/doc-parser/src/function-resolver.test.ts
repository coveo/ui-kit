import {buildMockApiFunction} from '../mocks/mock-api-function';
import {buildMockApiInterface} from '../mocks/mock-api-interface';
import {buildMockApiPropertySignature} from '../mocks/mock-api-property-signature';
import {buildMockApiDocComment} from '../mocks/mock-api-doc-comment';
import {buildMockEntity} from '../mocks/mock-entity';
import {buildMockEntryPoint} from '../mocks/mock-entry-point';
import {
  buildContentExcerptToken,
  buildReferenceExcerptToken,
} from '../mocks/mock-excerpt-token';
import {buildMockFuncEntity} from '../mocks/mock-func-entity';
import {buildMockObjEntity} from '../mocks/mock-obj-entity';
import {resolveFunction} from './function-resolver';

describe('#resolveFunction', () => {
  it('resolves function with a an interface return type', () => {
    const entry = buildMockEntryPoint();
    const comment = buildMockApiDocComment(
      '/**\n * Creates a `NumericRangeRequest`.\n *\n * @param config - The options with which to create a `NumericRangeRequest`.\n *\n * @returns A new `NumericRangeRequest`.\n */\n'
    );

    const fn = buildMockApiFunction({
      name: 'buildNumericRange',
      docComment: comment,
      excerptTokens: [
        buildContentExcerptToken('declare function buildNumericRange(config: '),
        buildReferenceExcerptToken(
          'NumericRangeOptions',
          '@coveo/headless!~NumericRangeOptions:interface'
        ),
        buildContentExcerptToken('): '),
        buildReferenceExcerptToken(
          'NumericRangeRequest',
          '@coveo/headless!~NumericRangeRequest:interface'
        ),
        buildContentExcerptToken(';'),
      ],
      returnTypeTokenRange: {startIndex: 3, endIndex: 4},
      parameters: [
        {
          parameterName: 'config',
          parameterTypeTokenRange: {startIndex: 1, endIndex: 2},
        },
      ],
    });

    const optionsInterface = buildMockApiInterface({
      name: 'NumericRangeOptions',
    });
    const requestInterface = buildMockApiInterface({
      name: 'NumericRangeRequest',
    });

    const buildStartProp = () =>
      buildMockApiPropertySignature({
        name: 'start',
        excerptTokens: [
          buildContentExcerptToken('start: '),
          buildContentExcerptToken('number'),
          buildContentExcerptToken(';'),
        ],
        propertyTypeTokenRange: {
          startIndex: 1,
          endIndex: 2,
        },
      });

    optionsInterface.addMember(buildStartProp());
    requestInterface.addMember(buildStartProp());

    entry.addMember(optionsInterface);
    entry.addMember(requestInterface);
    entry.addMember(fn);

    const result = resolveFunction(entry, fn, []);

    const startProperty = buildMockEntity({name: 'start', type: 'number'});
    const optionsParam = buildMockObjEntity({
      name: 'config',
      type: 'NumericRangeOptions',
      typeName: 'NumericRangeOptions',
      desc: 'The options with which to create a `NumericRangeRequest`.',
      members: [startProperty],
    });

    const returnType = buildMockObjEntity({
      name: 'NumericRangeRequest',
      type: 'NumericRangeRequest',
      typeName: 'NumericRangeRequest',
      members: [startProperty],
    });

    const funcEntity = buildMockFuncEntity({
      name: 'buildNumericRange',
      desc: 'Creates a `NumericRangeRequest`.',
      params: [optionsParam],
      returnType,
    });

    expect(result).toEqual(funcEntity);
  });
});

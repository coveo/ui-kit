import {buildMockApiDocComment} from '../mocks/mock-api-doc-comment.js';
import {buildMockApiFunction} from '../mocks/mock-api-function.js';
import {buildMockApiInterface} from '../mocks/mock-api-interface.js';
import {buildMockApiPropertySignature} from '../mocks/mock-api-property-signature.js';
import {buildMockEntity} from '../mocks/mock-entity.js';
import {buildMockEntryPoint} from '../mocks/mock-entry-point.js';
import {
  buildContentExcerptToken,
  buildReferenceExcerptToken,
} from '../mocks/mock-excerpt-token.js';
import {buildMockFuncEntity} from '../mocks/mock-func-entity.js';
import {buildMockObjEntity} from '../mocks/mock-obj-entity.js';
import {resolveFunction} from './function-resolver.js';

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
          isOptional: true,
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

import {ApiMethodSignature, ReleaseTag} from '@microsoft/api-extractor-model';
import {buildMockApiDocComment} from '../mocks/mock-api-doc-comment';
import {buildMockApiInterface} from '../mocks/mock-api-interface';
import {buildMockApiPropertySignature} from '../mocks/mock-api-property-signature';
import {buildMockApiTypeAlias} from '../mocks/mock-api-type-alias';
import {buildMockEntity} from '../mocks/mock-entity';
import {buildMockEntryPoint} from '../mocks/mock-entry-point';
import {
  buildContentExcerptToken,
  buildReferenceExcerptToken,
} from '../mocks/mock-excerpt-token';
import {buildMockFuncEntity} from '../mocks/mock-func-entity';
import {buildMockObjEntity} from '../mocks/mock-obj-entity';
import {resolveInterfaceMembers} from './interface-resolver';

describe('#resolveInterfaceMembers', () => {
  it('resolves a property with a primitive type', () => {
    const entryPoint = buildMockEntryPoint();
    const apiInterface = buildMockApiInterface({name: 'Pager'});
    const prop = buildMockApiPropertySignature({
      name: 'isCurrentPage',
      excerptTokens: [
        buildContentExcerptToken('isCurrentPage: '),
        buildContentExcerptToken('(page: number) => boolean'),
        buildContentExcerptToken(';'),
      ],
      propertyTypeTokenRange: {startIndex: 1, endIndex: 2},
      isOptional: true,
    });

    apiInterface.addMember(prop);
    entryPoint.addMember(apiInterface);

    const result = resolveInterfaceMembers(entryPoint, apiInterface);
    const entity = buildMockEntity({
      name: 'isCurrentPage',
      type: '(page: number) => boolean',
      isOptional: true,
    });

    expect(result).toEqual([entity]);
  });

  it('resolves a property with an interface type', () => {
    const entryPoint = buildMockEntryPoint();
    const pagerInterface = buildMockApiInterface({name: 'Pager'});

    const stateProp = buildMockApiPropertySignature({
      name: 'state',
      excerptTokens: [
        buildContentExcerptToken('state: '),
        buildReferenceExcerptToken(
          'PagerState',
          '@coveo/headless!~PagerState:interface'
        ),
        buildContentExcerptToken(';'),
      ],
      propertyTypeTokenRange: {startIndex: 1, endIndex: 2},
    });

    const pagerStateInterface = buildMockApiInterface({name: 'PagerState'});

    const currentPageProp = buildMockApiPropertySignature({
      name: 'currentPage',
      excerptTokens: [
        buildContentExcerptToken('currentPage: '),
        buildContentExcerptToken('number'),
        buildContentExcerptToken(';'),
      ],
      propertyTypeTokenRange: {startIndex: 1, endIndex: 2},
    });

    pagerInterface.addMember(stateProp);
    pagerStateInterface.addMember(currentPageProp);

    entryPoint.addMember(pagerInterface);
    entryPoint.addMember(pagerStateInterface);

    const result = resolveInterfaceMembers(entryPoint, pagerInterface);

    const entity = buildMockEntity({name: 'currentPage', type: 'number'});
    const objEntity = buildMockObjEntity({
      name: 'state',
      type: 'PagerState',
      members: [entity],
    });

    expect(result).toEqual([objEntity]);
  });

  it('resolves a method with primitive return type', () => {
    const entryPoint = buildMockEntryPoint();
    const pagerInterface = buildMockApiInterface({name: 'Pager'});

    const docComment = buildMockApiDocComment(
      '/**\n * Returns `true` when the current page is equal to the passed page, and `false` otherwise.\n *\n * @param page - The page number to check.\n *\n * @returns Whether the passed page is selected.\n */\n'
    );

    const method = new ApiMethodSignature({
      docComment,
      excerptTokens: [
        buildContentExcerptToken('isCurrentPage(page: '),
        buildContentExcerptToken('number'),
        buildContentExcerptToken('): '),
        buildContentExcerptToken('boolean'),
        buildContentExcerptToken(';'),
      ],
      isOptional: false,
      name: 'isCurrentPage',
      overloadIndex: 1,
      parameters: [
        {
          parameterName: 'page',
          parameterTypeTokenRange: {startIndex: 1, endIndex: 2},
        },
      ],
      releaseTag: ReleaseTag.None,
      returnTypeTokenRange: {startIndex: 3, endIndex: 4},
      typeParameters: [],
    });

    pagerInterface.addMember(method);
    entryPoint.addMember(pagerInterface);

    const result = resolveInterfaceMembers(entryPoint, pagerInterface);

    const paramEntity = buildMockEntity({
      name: 'page',
      type: 'number',
      desc: 'The page number to check.',
    });

    const funcEntity = buildMockFuncEntity({
      name: 'isCurrentPage',
      desc:
        'Returns `true` when the current page is equal to the passed page, and `false` otherwise.',
      params: [paramEntity],
      returnType: 'boolean',
    });
    expect(result).toEqual([funcEntity]);
  });

  it('treats a record as a primitive entity and does not resolve it further', () => {
    const entry = buildMockEntryPoint();
    const apiInterface = buildMockApiInterface({name: 'FacetSearchOptions'});
    const recordProp = buildMockApiPropertySignature({
      name: 'captions',
      excerptTokens: [
        buildContentExcerptToken('captions?: '),
        buildReferenceExcerptToken('Record', '!Record:type'),
        buildContentExcerptToken('<string, string>'),
        buildContentExcerptToken(';'),
      ],
      propertyTypeTokenRange: {startIndex: 1, endIndex: 3},
      isOptional: true,
    });

    apiInterface.addMember(recordProp);
    entry.addMember(apiInterface);

    const result = resolveInterfaceMembers(entry, apiInterface);
    const entity = buildMockEntity({
      name: 'captions',
      type: 'Record<string, string>',
      isOptional: true,
    });

    expect(result).toEqual([entity]);
  });

  it('when the type is a type alias, it resolves the alias', () => {
    const entry = buildMockEntryPoint();
    const apiInterface = buildMockApiInterface({name: 'FacetValue'});
    const prop = buildMockApiPropertySignature({
      name: 'state',
      excerptTokens: [
        buildContentExcerptToken('state: '),
        buildReferenceExcerptToken(
          'FacetValueState',
          '@coveo/headless!~FacetValueState:type'
        ),
        buildContentExcerptToken(';'),
      ],
      propertyTypeTokenRange: {startIndex: 1, endIndex: 2},
    });

    const typeAlias = buildMockApiTypeAlias({
      name: 'FacetValueState',
      excerptTokens: [
        buildContentExcerptToken('declare type FacetValueState = '),
        buildContentExcerptToken("'idle' | 'selected'"),
        buildContentExcerptToken(';'),
      ],
      typeTokenRange: {startIndex: 1, endIndex: 2},
    });

    apiInterface.addMember(prop);
    entry.addMember(apiInterface);
    entry.addMember(typeAlias);

    const result = resolveInterfaceMembers(entry, apiInterface);
    const entity = buildMockEntity({
      name: 'state',
      type: "'idle' | 'selected'",
    });

    expect(result).toEqual([entity]);
  });

  it(`when an interface member type is an interface with a $1 suffix,
  it resolves the type correctly`, () => {
    const entry = buildMockEntryPoint();
    const interface1 = buildMockApiInterface({name: 'FacetSearchState'});
    const prop1 = buildMockApiPropertySignature({
      name: 'values',
      excerptTokens: [
        buildContentExcerptToken('values: '),
        buildReferenceExcerptToken(
          'SpecificFacetSearchResult$1',
          '@coveo/headless!~SpecificFacetSearchResult$1:interface'
        ),
        buildContentExcerptToken('[]'),
        buildContentExcerptToken(';'),
      ],
      propertyTypeTokenRange: {startIndex: 1, endIndex: 3},
    });

    const interface2 = buildMockApiInterface({
      name: 'SpecificFacetSearchResult',
    });

    interface1.addMember(prop1);
    entry.addMember(interface1);
    entry.addMember(interface2);

    const result = resolveInterfaceMembers(entry, interface1);
    const entity = buildMockObjEntity({
      name: 'values',
      type: 'SpecificFacetSearchResult[]',
    });

    expect(result).toEqual([entity]);
  });
});

import {ExcerptTokenKind, IExcerptToken} from '@microsoft/api-extractor-model';
import {buildMockApiInterface} from '../mocks/mock-api-interface';
import {buildMockApiPropertySignature} from '../mocks/mock-api-property-signature';
import {buildMockEntity} from '../mocks/mock-entity';
import {buildMockEntryPoint} from '../mocks/mock-entry-point';
import {buildMockObjEntity} from '../mocks/mock-obj-entity';
import {resolveInterfaceMembers} from './interface-resolver';

describe('#resolveInterfaceMembers', () => {
  function buildContentExcerptToken(text: string): IExcerptToken {
    return {kind: ExcerptTokenKind.Content, text};
  }

  function buildReferenceExcerptToken(
    text: string,
    canonicalReference: string
  ): IExcerptToken {
    return {kind: ExcerptTokenKind.Reference, text, canonicalReference};
  }

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
});

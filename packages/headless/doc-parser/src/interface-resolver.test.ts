import {ExcerptTokenKind} from '@microsoft/api-extractor-model';
import {buildMockApiInterface} from '../mocks/mock-api-interface';
import {buildMockApiPropertySignature} from '../mocks/mock-api-property-signature';
import {buildMockEntity} from '../mocks/mock-entity';
import {buildMockEntryPoint} from '../mocks/mock-entry-point';
import {resolveInterfaceMembers} from './interface-resolver';

describe('#resolveInterfaceMembers', () => {
  it('resolves an interface with one property member', () => {
    const entryPoint = buildMockEntryPoint();
    const apiInterface = buildMockApiInterface({name: 'Pager'});
    const prop = buildMockApiPropertySignature({
      name: 'isCurrentPage',
      excerptTokens: [
        {
          kind: ExcerptTokenKind.Content,
          text: 'isCurrentPage: ',
        },
        {
          kind: ExcerptTokenKind.Content,
          text: '(page: number) => boolean',
        },
        {
          kind: ExcerptTokenKind.Content,
          text: ';',
        },
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
});

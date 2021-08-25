import {buildMockApiCallSignature} from '../mocks/mock-api-call-signature';
import {buildMockApiDocComment} from '../mocks/mock-api-doc-comment';
import {buildMockApiIndexSignature} from '../mocks/mock-api-index-signature';
import {buildMockApiInterface} from '../mocks/mock-api-interface';
import {buildMockApiMethodSignature} from '../mocks/mock-api-method-signature';
import {buildMockApiPropertySignature} from '../mocks/mock-api-property-signature';
import {buildMockApiTypeAlias} from '../mocks/mock-api-type-alias';
import {buildMockEntity} from '../mocks/mock-entity';
import {buildMockEntityWithTypeAlias} from '../mocks/mock-entity-with-type-alias';
import {buildMockEntryPoint} from '../mocks/mock-entry-point';
import {
  buildContentExcerptToken,
  buildReferenceExcerptToken,
} from '../mocks/mock-excerpt-token';
import {buildMockFuncEntity} from '../mocks/mock-func-entity';
import {buildMockObjEntity} from '../mocks/mock-obj-entity';
import {AnyEntity} from './entity';
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

    const result = resolveInterfaceMembers(entryPoint, apiInterface, []);
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

    const result = resolveInterfaceMembers(entryPoint, pagerInterface, []);

    const entity = buildMockEntity({name: 'currentPage', type: 'number'});
    const objEntity = buildMockObjEntity({
      name: 'state',
      type: 'PagerState',
      typeName: 'PagerState',
      members: [entity],
    });

    expect(result).toEqual([objEntity]);
  });

  it('resolves a property with an interface array type', () => {
    const entry = buildMockEntryPoint();
    const queryCorrection = buildMockApiInterface({name: 'QueryCorrection'});

    const wordCorrections = buildMockApiPropertySignature({
      name: 'wordCorrections',
      excerptTokens: [
        buildContentExcerptToken('wordCorrections: '),
        buildReferenceExcerptToken('WordCorrection', ''),
        buildContentExcerptToken('[]'),
        buildContentExcerptToken(';'),
      ],
      propertyTypeTokenRange: {startIndex: 1, endIndex: 3},
    });

    const wordCorrection = buildMockApiInterface({name: 'WordCorrection'});

    queryCorrection.addMember(wordCorrections);
    entry.addMember(queryCorrection);
    entry.addMember(wordCorrection);

    const result = resolveInterfaceMembers(entry, queryCorrection, []);

    const expected = buildMockObjEntity({
      name: 'wordCorrections',
      type: 'WordCorrection[]',
      typeName: 'WordCorrection',
    });

    expect(result).toEqual([expected]);
  });

  it('resolves an index signature', () => {
    const entry = buildMockEntryPoint();
    const resultInterface = buildMockApiInterface({name: 'Result'});
    const indexer = buildMockApiIndexSignature({
      excerptTokens: [
        buildContentExcerptToken('[key: '),
        buildContentExcerptToken('string'),
        buildContentExcerptToken(']: '),
        buildContentExcerptToken('unknown'),
        buildContentExcerptToken(';'),
      ],
      returnTypeTokenRange: {startIndex: 3, endIndex: 4},
      parameters: [
        {
          parameterName: 'key',
          parameterTypeTokenRange: {startIndex: 1, endIndex: 2},
        },
      ],
    });

    resultInterface.addMember(indexer);
    entry.addMember(resultInterface);

    const result = resolveInterfaceMembers(entry, resultInterface, []);
    const entity = buildMockEntity({
      name: '[key: string]',
      type: 'unknown',
    });

    expect(result).toEqual([entity]);
  });

  it('resolves a method with primitive return type', () => {
    const entryPoint = buildMockEntryPoint();
    const pagerInterface = buildMockApiInterface({name: 'Pager'});

    const docComment = buildMockApiDocComment(
      '/**\n * Returns `true` when the current page is equal to the passed page, and `false` otherwise.\n *\n * @param page - The page number to check.\n *\n * @returns Whether the passed page is selected.\n */\n'
    );

    const method = buildMockApiMethodSignature({
      docComment,
      excerptTokens: [
        buildContentExcerptToken('isCurrentPage(page: '),
        buildContentExcerptToken('number'),
        buildContentExcerptToken('): '),
        buildContentExcerptToken('boolean'),
        buildContentExcerptToken(';'),
      ],
      name: 'isCurrentPage',
      parameters: [
        {
          parameterName: 'page',
          parameterTypeTokenRange: {startIndex: 1, endIndex: 2},
        },
      ],
      returnTypeTokenRange: {startIndex: 3, endIndex: 4},
    });

    pagerInterface.addMember(method);
    entryPoint.addMember(pagerInterface);

    const result = resolveInterfaceMembers(entryPoint, pagerInterface, []);

    const paramEntity = buildMockEntity({
      name: 'page',
      type: 'number',
      desc: 'The page number to check.',
    });

    const returnType = buildMockEntity({
      name: 'returnType',
      type: 'boolean',
      isOptional: false,
      desc: 'Whether the passed page is selected.',
    });

    const funcEntity = buildMockFuncEntity({
      name: 'isCurrentPage',
      desc: 'Returns `true` when the current page is equal to the passed page, and `false` otherwise.',
      params: [paramEntity],
      returnType: returnType,
    });
    expect(result).toEqual([funcEntity]);
  });

  it('resolves a method with interface return type', () => {
    const entryPoint = buildMockEntryPoint();
    const controllerInterface = buildMockApiInterface({name: 'Controller'});

    const docComment = buildMockApiDocComment(
      '/**\n * Adds a callback that will be called on state change.\n *\n * @param listener - A callback to be invoked on state change.\n *\n * @returns An unsubscribe function to remove the listener.\n */\n'
    );

    const method = buildMockApiMethodSignature({
      docComment,
      excerptTokens: [
        buildContentExcerptToken('subscribe(listener: '),
        buildContentExcerptToken('() => void'),
        buildContentExcerptToken('): '),
        buildReferenceExcerptToken(
          'Unsubscribe',
          '@coveo/headless!Unsubscribe:interface'
        ),
        buildContentExcerptToken(';'),
      ],
      name: 'subscribe',
      parameters: [
        {
          parameterName: 'listener',
          parameterTypeTokenRange: {startIndex: 1, endIndex: 2},
        },
      ],
      returnTypeTokenRange: {startIndex: 3, endIndex: 4},
    });

    const unsubscribeInterface = buildMockApiInterface({
      name: 'Unsubscribe',
    });

    const unsubscribeCallSignature = buildMockApiCallSignature({
      excerptTokens: [
        buildContentExcerptToken('(): '),
        buildContentExcerptToken('void'),
      ],
    });

    controllerInterface.addMember(method);
    unsubscribeInterface.addMember(unsubscribeCallSignature);

    entryPoint.addMember(controllerInterface);
    entryPoint.addMember(unsubscribeInterface);

    const result = resolveInterfaceMembers(entryPoint, controllerInterface, []);

    const paramEntity = buildMockEntity({
      name: 'listener',
      type: '() => void',
      desc: 'A callback to be invoked on state change.',
    });

    const memberEntity = buildMockEntity({
      name: '(call)',
      type: '(): void',
    });

    const returnType = buildMockObjEntity({
      name: 'returnType',
      type: 'Unsubscribe',
      typeName: 'Unsubscribe',
      isOptional: false,
      desc: 'An unsubscribe function to remove the listener.',
      members: [memberEntity],
    });

    const funcEntity = buildMockFuncEntity({
      name: 'subscribe',
      desc: 'Adds a callback that will be called on state change.',
      params: [paramEntity],
      returnType: returnType,
    });
    expect(result).toEqual([funcEntity]);
  });

  it('resolves a method with a promise return type', () => {
    const entry = buildMockEntryPoint();
    const historyManager = buildMockApiInterface({name: 'HistoryManager'});

    const docComment = buildMockApiDocComment(
      '/**\n * Move forward in the interface history.\n *\n * @returns A promise that resolves when the previous state has been restored.\n */\n'
    );
    const forward = buildMockApiMethodSignature({
      name: 'forward',
      docComment,
      excerptTokens: [
        buildContentExcerptToken('forward(): '),
        buildReferenceExcerptToken('Promise', ''),
        buildContentExcerptToken('<void>'),
        buildContentExcerptToken(';'),
      ],
      returnTypeTokenRange: {startIndex: 1, endIndex: 3},
    });

    historyManager.addMember(forward);
    entry.addMember(historyManager);

    const result = resolveInterfaceMembers(entry, historyManager, []);

    const returnType = buildMockEntity({
      name: 'returnType',
      type: 'Promise<void>',
      desc: 'A promise that resolves when the previous state has been restored.',
    });

    const func = buildMockFuncEntity({
      desc: 'Move forward in the interface history.',
      name: 'forward',
      returnType,
    });

    expect(result).toEqual([func]);
  });

  it('resolves a method with a type alias return type', () => {
    const entry = buildMockEntryPoint();
    const searchActions = buildMockApiInterface({name: 'ISearchActions'});

    const docComment = buildMockApiDocComment(
      '/**\n * Fetches more results.\n *\n * @returns A dispatchable object.\n */\n'
    );

    const fetchMoreResults = buildMockApiMethodSignature({
      name: 'fetchMoreResults',
      docComment,
      excerptTokens: [
        buildContentExcerptToken('fetchMoreResults(): '),
        buildReferenceExcerptToken(
          'AsyncThunkAction',
          '@coveo/headless!AsyncThunkAction:type'
        ),
        buildContentExcerptToken(';'),
      ],
      returnTypeTokenRange: {startIndex: 1, endIndex: 2},
    });

    searchActions.addMember(fetchMoreResults);
    entry.addMember(searchActions);

    const result = resolveInterfaceMembers(entry, searchActions, []);

    const returnType = buildMockEntity({
      name: 'returnType',
      type: 'AsyncThunkAction',
      desc: 'A dispatchable object.',
    });

    const func = buildMockFuncEntity({
      desc: 'Fetches more results.',
      name: 'fetchMoreResults',
      returnType,
    });

    expect(result).toEqual([func]);
  });

  it('resolves a call signature with primitive types', () => {
    const entryPoint = buildMockEntryPoint();
    const unsubscribeInterface = buildMockApiInterface({name: 'Unsubscribe'});

    const method = buildMockApiCallSignature({
      excerptTokens: [
        buildContentExcerptToken('(): '),
        buildContentExcerptToken('void'),
      ],
    });

    unsubscribeInterface.addMember(method);
    entryPoint.addMember(unsubscribeInterface);

    const result = resolveInterfaceMembers(
      entryPoint,
      unsubscribeInterface,
      []
    );

    const entity = buildMockEntity({
      name: '(call)',
      type: '(): void',
    });
    expect(result).toEqual([entity]);
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

    const result = resolveInterfaceMembers(entry, apiInterface, []);
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

    const result = resolveInterfaceMembers(entry, apiInterface, []);
    const entity = buildMockEntityWithTypeAlias({
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

    const result = resolveInterfaceMembers(entry, interface1, []);
    const entity = buildMockObjEntity({
      name: 'values',
      type: 'SpecificFacetSearchResult[]',
      typeName: 'SpecificFacetSearchResult',
    });

    expect(result).toEqual([entity]);
  });

  it(`interface with method with one parameter with a complex type,
  it resolves the parameter as an object`, () => {
    const entry = buildMockEntryPoint();
    const facet = buildMockApiInterface({name: 'Facet'});

    const docComment = buildMockApiDocComment(
      '/**\n * Toggles the specified facet value.\n *\n * @param selection - The facet value to toggle.\n */\n'
    );
    const toggleSelect = buildMockApiMethodSignature({
      name: 'toggleSelect',
      docComment,
      excerptTokens: [
        buildContentExcerptToken('toggleSelect(selection: '),
        buildReferenceExcerptToken(
          'FacetValue$1',
          '@coveo/headless!~FacetValue$1:interface'
        ),
        buildContentExcerptToken('): '),
        buildContentExcerptToken('void'),
        buildContentExcerptToken(';'),
      ],
      returnTypeTokenRange: {startIndex: 3, endIndex: 4},
      parameters: [
        {
          parameterName: 'selection',
          parameterTypeTokenRange: {startIndex: 1, endIndex: 2},
        },
      ],
    });

    const facetValue = buildMockApiInterface({name: 'FacetValue'});

    facet.addMember(toggleSelect);
    entry.addMember(facet);
    entry.addMember(facetValue);

    const result = resolveInterfaceMembers(entry, facet, []);

    const param = buildMockObjEntity({
      name: 'selection',
      type: 'FacetValue',
      typeName: 'FacetValue',
      desc: 'The facet value to toggle.',
    });

    const returnType = buildMockEntity({
      name: 'returnType',
      type: 'void',
      isOptional: false,
      desc: '',
    });

    const funcEntity = buildMockFuncEntity({
      name: 'toggleSelect',
      desc: 'Toggles the specified facet value.',
      params: [param],
      returnType: returnType,
    });

    expect(result).toEqual([funcEntity]);
  });

  it(`interface with method with parameter with type alias,
  it resolves the type alias`, () => {
    const entry = buildMockEntryPoint();
    const context = buildMockApiInterface({name: 'Context'});

    const docComment = buildMockApiDocComment(
      '/**\n * Add, or replace if already present, a new context key and value pair.\n *\n * @param contextValue - The context value to add.\n */\n'
    );
    const add = buildMockApiMethodSignature({
      name: 'add',
      docComment,
      excerptTokens: [
        buildContentExcerptToken('add(contextValue: '),
        buildReferenceExcerptToken(
          'ContextValue',
          '@coveo/headless!~ContextValue:type'
        ),
        buildContentExcerptToken('): '),
        buildContentExcerptToken('void'),
        buildContentExcerptToken(';'),
      ],
      parameters: [
        {
          parameterName: 'contextValue',
          parameterTypeTokenRange: {startIndex: 1, endIndex: 2},
        },
      ],
      returnTypeTokenRange: {startIndex: 3, endIndex: 4},
    });

    const contextValue = buildMockApiTypeAlias({
      name: 'ContextValue',
      excerptTokens: [
        buildContentExcerptToken('declare type ContextValue = '),
        buildContentExcerptToken('string | string[]'),
        buildContentExcerptToken(';'),
      ],
      typeTokenRange: {startIndex: 1, endIndex: 2},
    });

    context.addMember(add);
    entry.addMember(context);
    entry.addMember(contextValue);

    const result = resolveInterfaceMembers(entry, context, []);

    const param = buildMockEntityWithTypeAlias({
      name: 'contextValue',
      type: 'string | string[]',
      desc: 'The context value to add.',
    });

    const returnType = buildMockEntity({
      name: 'returnType',
      type: 'void',
      isOptional: false,
      desc: '',
    });

    const funcEntity = buildMockFuncEntity({
      name: 'add',
      desc: 'Add, or replace if already present, a new context key and value pair.',
      params: [param],
      returnType: returnType,
    });
    expect(result).toEqual([funcEntity]);
  });

  it(`an interface extends another interface,
  it resolves the members of both interfaces`, () => {
    const entry = buildMockEntryPoint();

    const querySummaryState = buildMockApiInterface({
      name: 'QuerySummaryState',
      excerptTokens: [
        buildContentExcerptToken('interface QuerySummaryState extends '),
        buildReferenceExcerptToken(
          'SearchStatusState',
          '@coveo/headless!~SearchStatusState:interface'
        ),
        buildContentExcerptToken(' '),
      ],
      extendsTokenRanges: [{startIndex: 1, endIndex: 3}],
    });
    const query = buildMockApiPropertySignature({
      name: 'query',
      excerptTokens: [
        buildContentExcerptToken('query: '),
        buildContentExcerptToken('string'),
        buildContentExcerptToken(';'),
      ],
      propertyTypeTokenRange: {startIndex: 1, endIndex: 2},
    });

    const searchStatusState = buildMockApiInterface({
      name: 'SearchStatusState',
    });
    const isLoading = buildMockApiPropertySignature({
      name: 'isLoading',
      excerptTokens: [
        buildContentExcerptToken('isLoading: '),
        buildContentExcerptToken('boolean'),
        buildContentExcerptToken(';'),
      ],
      propertyTypeTokenRange: {startIndex: 1, endIndex: 2},
    });

    querySummaryState.addMember(query);
    searchStatusState.addMember(isLoading);

    entry.addMember(querySummaryState);
    entry.addMember(searchStatusState);

    const result = resolveInterfaceMembers(entry, querySummaryState, []);

    const queryEntity = buildMockEntity({name: 'query', type: 'string'});
    const isLoadingEntity = buildMockEntity({
      name: 'isLoading',
      type: 'boolean',
    });

    expect(result).toEqual([queryEntity, isLoadingEntity]);
  });

  it(`an interface extends another interface,
  both have a property with the same name,
  it discards the inherited property`, () => {
    const entry = buildMockEntryPoint();
    const pager = buildMockApiInterface({
      name: 'Pager',
      excerptTokens: [
        buildContentExcerptToken('interface Pager extends '),
        buildReferenceExcerptToken('Controller', ''),
        buildContentExcerptToken(' '),
      ],
      extendsTokenRanges: [{startIndex: 1, endIndex: 3}],
    });

    const pagerState = buildMockApiPropertySignature({
      name: 'state',
      excerptTokens: [
        buildContentExcerptToken('state: '),
        buildContentExcerptToken('string'),
        buildContentExcerptToken(';'),
      ],
      propertyTypeTokenRange: {startIndex: 1, endIndex: 2},
    });

    const controller = buildMockApiInterface({name: 'Controller'});

    const controllerState = buildMockApiPropertySignature({
      name: 'state',
      excerptTokens: [
        buildContentExcerptToken('state: '),
        buildContentExcerptToken('boolean'),
        buildContentExcerptToken(';'),
      ],
      propertyTypeTokenRange: {startIndex: 1, endIndex: 2},
    });

    pager.addMember(pagerState);
    controller.addMember(controllerState);

    entry.addMember(pager);
    entry.addMember(controller);

    const result = resolveInterfaceMembers(entry, pager, []);
    const expected = buildMockEntity({
      name: 'state',
      type: 'string',
    });

    expect(result).toEqual([expected]);
  });

  it(`an interface extends two interfaces,
  both inherited interfaces have a property with the same name,
  it only keeps one inherited instance`, () => {
    const entry = buildMockEntryPoint();
    const standaloneSearchBox = buildMockApiInterface({
      name: 'StandaloneSearchBox',
      excerptTokens: [
        buildContentExcerptToken('interface StandaloneSearchBox extends '),
        buildReferenceExcerptToken('SearchBox', ''),
        buildContentExcerptToken(', '),
        buildReferenceExcerptToken('Controller', ''),
        buildContentExcerptToken(' '),
      ],
      extendsTokenRanges: [
        {startIndex: 1, endIndex: 3},
        {startIndex: 3, endIndex: 5},
      ],
    });

    const createValueMemeber = () =>
      buildMockApiPropertySignature({
        name: 'value',
        excerptTokens: [
          buildContentExcerptToken('value: '),
          buildContentExcerptToken('string'),
          buildContentExcerptToken(';'),
        ],
        propertyTypeTokenRange: {startIndex: 1, endIndex: 2},
      });

    const searchBox = buildMockApiInterface({
      name: 'SearchBox',
      members: [createValueMemeber()],
    });

    const controller = buildMockApiInterface({
      name: 'Controller',
      members: [createValueMemeber()],
    });

    entry.addMember(standaloneSearchBox);
    entry.addMember(searchBox);
    entry.addMember(controller);

    const result = resolveInterfaceMembers(entry, standaloneSearchBox, []);
    const valueEntity = buildMockEntity({name: 'value', type: 'string'});

    expect(result).toEqual([valueEntity]);
  });

  // Allowing members to be parsed twice gives a chance for the extractor to set `isTypeExtracted` to true.
  // Source: https://github.com/coveo/ui-kit/pull/567#discussion_r586461134
  it(`an interface has a property of its own type,
  the interface's members are parsed up to two times`, () => {
    const entryPoint = buildMockEntryPoint();
    const apiInterface = buildMockApiInterface({name: 'CategoryFacetValue'});
    const prop = buildMockApiPropertySignature({
      name: 'child',
      excerptTokens: [
        buildContentExcerptToken('child?: '),
        buildReferenceExcerptToken(
          'CategoryFacetValue',
          '@coveo/headless!~CategoryFacetValue:interface'
        ),
        buildContentExcerptToken(';'),
      ],
      propertyTypeTokenRange: {startIndex: 1, endIndex: 2},
      isOptional: true,
    });

    apiInterface.addMember(prop);
    entryPoint.addMember(apiInterface);

    const result = resolveInterfaceMembers(entryPoint, apiInterface, []);

    const thirdExpectedMembers: AnyEntity[] = [];

    const secondExpectedMembers = [
      buildMockObjEntity({
        name: 'child',
        type: 'CategoryFacetValue',
        typeName: 'CategoryFacetValue',
        members: thirdExpectedMembers,
        isOptional: true,
      }),
    ];

    const firstExpectedMembers = [
      buildMockObjEntity({
        name: 'child',
        type: 'CategoryFacetValue',
        typeName: 'CategoryFacetValue',
        members: secondExpectedMembers,
        isOptional: true,
      }),
    ];

    expect(result).toEqual(firstExpectedMembers);
  });
});

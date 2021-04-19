import {
  ApiEntryPoint,
  ApiInterface,
  ApiItem,
  ApiItemKind,
  ApiNamespace,
  ApiVariable,
} from '@microsoft/api-extractor-model';
import {DocNode, DocParamBlock} from '@microsoft/tsdoc';
import {findApi} from './api-finder';
import {AnyEntity, Entity, ObjEntity} from './entity';
import {buildObjEntity} from './entity-builder';
import {resolveInterfaceMembers} from './interface-resolver';
import {emitAsTsDoc} from './tsdoc-emitter';

interface ActionsNamespace {
  name: string;
  members: Action[];
}

enum ActionKind {
  Normal = 'normalAction',
  Analytics = 'analyticsAction',
}

interface BaseAction {
  name: string;
  desc: string;
  parameter: AnyEntity | null;
  actionKind: ActionKind;
}

enum AnalyticsKind {
  Search = 'search',
  Click = 'click',
  Custom = 'custom',
}

interface AnalyticsAction extends BaseAction {
  actionKind: ActionKind.Analytics;
  analyticsKind: AnalyticsKind;
}

interface NormalAction extends BaseAction {
  actionKind: ActionKind.Normal;
}

type Action = NormalAction | AnalyticsAction;

export function resolveActionNamespace(
  entry: ApiEntryPoint,
  name: string
): ActionsNamespace {
  const namespace = findApi(entry, name) as ApiNamespace;
  return {
    name: namespace.displayName,
    members: namespace.members
      .filter((member) => member.kind === ApiItemKind.Variable)
      .map((action) => resolveAction(entry, action as ApiVariable))
      .filter((action) => action) as Action[],
  };
}

function resolveAction(
  entry: ApiEntryPoint,
  variable: ApiVariable
): Action | null {
  const tokens = variable.excerpt.tokens.flatMap(({text}) =>
    tokenizePrimitives(text)
  );
  if (tokens[1] === 'AsyncThunk') {
    const parameterTypeName = getAsyncThunkParameterType(tokens);

    return {
      actionKind: ActionKind.Normal,
      name: variable.displayName,
      desc: variable.tsdocComment
        ? emitAsTsDoc(
            (variable.tsdocComment.summarySection
              .nodes as unknown) as readonly DocNode[]
          )
        : '',
      parameter:
        parameterTypeName !== 'void'
          ? resolveActionParameter(
              entry,
              parameterTypeName,
              (variable.tsdocComment?.params?.blocks[0] ??
                null) as DocParamBlock | null
            )
          : null,
    };
  }

  if (
    tokens[4] === 'AsyncThunkAction' &&
    tokens[6].startsWith('AnalyticsType.')
  ) {
    const parameterTypeName = getAnalyticsActionParameterType(tokens);

    return {
      actionKind: ActionKind.Analytics,
      name: variable.displayName,
      desc: variable.tsdocComment
        ? emitAsTsDoc(
            (variable.tsdocComment.summarySection
              .nodes as unknown) as readonly DocNode[]
          )
        : '',
      parameter:
        parameterTypeName !== 'void'
          ? resolveActionParameter(
              entry,
              parameterTypeName,
              (variable.tsdocComment?.params?.blocks[0] ??
                null) as DocParamBlock | null
            )
          : null,
      analyticsKind: getAnalyticsActionKind(tokens),
    };
  }

  console.warn(
    `Could not resolve action "${variable.displayName}" of type "${tokens
      .slice(1)
      .join('')}"`
  );

  return null;
}

function getAsyncThunkParameterType(tokens: string[]) {
  const indexOfFirstComma = tokens.findIndex((token) =>
    token.trim().endsWith(',')
  );
  const parameterTypeName = tokens[indexOfFirstComma + 1];

  return parameterTypeName;
}

function getAnalyticsActionParameterType(tokens: string[]) {
  return tokens[2];
}

function getAnalyticsActionKind(tokens: string[]) {
  switch (tokens[6].split('.')[1]) {
    case 'Search':
      return AnalyticsKind.Search;
    case 'Click':
      return AnalyticsKind.Click;
    case 'Custom':
      return AnalyticsKind.Custom;
    default:
      throw `Invalid analytics kind "${tokens[6]}".`;
  }
}

function resolveActionParameter(
  entry: ApiEntryPoint,
  parameterTypeName: string,
  parameterDoc: DocParamBlock | null
): Entity | ObjEntity {
  const entity: Entity = {
    name: parameterDoc?.parameterName ?? parameterTypeName,
    type: parameterTypeName,
    desc: parameterDoc ? emitAsTsDoc(parameterDoc.content.nodes) : '',
    isOptional: false,
    kind: 'primitive',
  };

  if (isPrimitive(parameterTypeName)) {
    return entity;
  }

  const parameterApi = findApi(entry, parameterTypeName);

  if (!isInterface(parameterApi)) {
    return entity;
  }

  return buildObjEntity({
    entity,
    typeName: parameterTypeName,
    members: resolveInterfaceMembers(entry, parameterApi, []),
  });
}

const primitiveTypes = [
  'void',
  'never',
  'undefined',
  'null',
  'string',
  'number',
  '{}',
];

function isPrimitive(typeName: string) {
  return primitiveTypes.indexOf(typeName) !== -1;
}

function isInterface(item: ApiItem): item is ApiInterface {
  return item.kind === ApiItemKind.Interface;
}

function tokenizePrimitives(text: string) {
  const expression = new RegExp(
    `(?<!\\w)(${primitiveTypes.join('|')})(?!\\w)`,
    'g'
  );
  let expressionResult: RegExpExecArray | null;
  let nextIndex = 0;
  const tokens: string[] = [];
  while ((expressionResult = expression.exec(text)) !== null) {
    if (expressionResult.index > 0) {
      tokens.push(text.substr(nextIndex, expressionResult.index - nextIndex));
    }
    tokens.push(expressionResult[1]);
    nextIndex = expressionResult.index + expressionResult[1].length;
  }
  tokens.push(
    tokens.length === 0 ? text : text.substr(nextIndex, text.length - nextIndex)
  );
  return tokens;
}

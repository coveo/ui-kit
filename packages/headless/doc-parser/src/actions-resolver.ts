import {
  ApiEntryPoint,
  ApiItemKind,
  ApiVariable,
} from '@microsoft/api-extractor-model';
import {DocNode, DocParamBlock} from '@microsoft/tsdoc';
import {findApi} from './api-finder';
import {AnyEntity, Entity} from './entity';
import {emitAsTsDoc} from './tsdoc-emitter';

interface ActionsNamespace {
  name: string;
  members: Action[];
}

enum ActionKind {
  Action = 'action',
  AsyncAction = 'asyncThunk',
  AnalyticsAction = 'analyticsAction',
}

interface Action {
  name: string;
  desc: string;
  parameter: AnyEntity | null;
  actionKind: ActionKind;
}

export function resolveActionNamespaces(
  entry: ApiEntryPoint,
  names: string[]
): ActionsNamespace[] {
  return names
    .map((name) => findApi(entry, name))
    .map((namespace) => ({
      name: namespace.displayName,
      members: namespace.members
        .filter((member) => member.kind === ApiItemKind.Variable)
        .map((action) => resolveAction(action as ApiVariable))
        .filter((action) => action) as Action[],
    }));
}

function resolveAction(variable: ApiVariable): Action | null {
  const tokens = variable.excerpt.tokens.flatMap(({text}) =>
    tokenizePrimitives(text)
  );
  if (tokens[1] === 'AsyncThunk') {
    const indexOfFirstComma = tokens.findIndex((token) =>
      token.trim().endsWith(',')
    );
    const parameterTypeName = tokens[indexOfFirstComma + 1];

    return {
      actionKind: ActionKind.AsyncAction,
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
              parameterTypeName,
              (variable.tsdocComment?.params?.blocks[0] ??
                null) as DocParamBlock | null
            )
          : null,
    };
  }

  return null;
}

function resolveActionParameter(
  parameterTypeName: string,
  parameterDoc: DocParamBlock | null
): Entity {
  return {
    name: parameterDoc?.parameterName ?? parameterTypeName,
    type: parameterTypeName,
    desc: parameterDoc ? emitAsTsDoc(parameterDoc.content.nodes) : '',
    isOptional: false,
    kind: 'primitive',
  };
}

function tokenizePrimitives(text: string) {
  const expression = /(?:(?<!\w)(void|never|undefined|null|string|number|{})(?!\w))/g;
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

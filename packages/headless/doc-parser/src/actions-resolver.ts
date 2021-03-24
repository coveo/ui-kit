import {
  ApiEntryPoint,
  ApiItemKind,
  ApiVariable,
} from '@microsoft/api-extractor-model';
import {DocNode, DocParamBlock} from '@microsoft/tsdoc';
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
  desc: string;
  fullName: string;
  parameter: AnyEntity | null;
  actionKind: ActionKind;
}

export function resolveActionNamespaces(
  entry: ApiEntryPoint
): ActionsNamespace[] {
  return entry.members
    .filter(
      (member) =>
        member.kind === ApiItemKind.Namespace &&
        member.displayName.endsWith('Actions')
    )
    .map((namespace) => ({
      name: namespace.displayName,
      members: namespace.members
        .filter((member) => member.kind === ApiItemKind.Variable)
        .map((action) => resolveAction(action as ApiVariable))
        .filter((action) => action) as Action[],
    }));
}

function resolveAction(variable: ApiVariable): Action | null {
  const tokens = variable.excerpt.tokens.map(({text}) => text);

  if (tokens[1] === 'AsyncThunkDefinition') {
    const actionNameToken = tokens[2];
    const [, actionName] = /"([^"]*)"/.exec(actionNameToken)!;
    const parameterTypeName = tokens[4].trim() === ',' ? tokens[5] : null;

    return {
      actionKind: ActionKind.AsyncAction,
      fullName: actionName,
      desc: variable.tsdocComment
        ? emitAsTsDoc(
            (variable.tsdocComment.summarySection
              .nodes as unknown) as readonly DocNode[]
          )
        : '',
      parameter: parameterTypeName
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

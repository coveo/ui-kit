import {
  ApiEntryPoint,
  ApiFunction,
  ApiInterface,
  Parameter,
} from '@microsoft/api-extractor-model';
import {DocComment} from '@microsoft/tsdoc';
import {findApi} from './api-finder';
import {buildEntity, buildFuncEntity, FuncEntity, ObjEntity} from './entity';
import {
  buildEntityFromParam,
  buildParamEntityBasedOnKind,
} from './function-param-resolver';
import {resolveInterfaceMembers} from './interface-resolver';

interface Controller {
  initializer: FuncEntity;
}

export function resolveController(
  entryPoint: ApiEntryPoint,
  controllerName: string
): Controller {
  const controller = findApi(entryPoint, controllerName) as ApiFunction;
  const initializer = resolveControllerFunction(entryPoint, controller);

  return {initializer};
}

function resolveControllerFunction(entry: ApiEntryPoint, fn: ApiFunction) {
  const params = fn.parameters.map((p, index) =>
    resolveControllerParam(entry, p, index)
  );
  const returnTypeText = fn.returnTypeExcerpt.text;
  const returnTypeInterface = findApi(entry, returnTypeText) as ApiInterface;

  const returnType = buildObjEntityFromInterface(entry, returnTypeInterface);

  return buildFuncEntity({
    name: fn.name,
    desc: fn.tsdocComment?.emitAsTsdoc() || '',
    params,
    returnType,
  });
}

function resolveControllerParam(
  entryPoint: ApiEntryPoint,
  p: Parameter,
  index: number
) {
  const isEngine = index === 0;
  return isEngine
    ? buildEntityFromParam(p)
    : buildParamEntityBasedOnKind(entryPoint, p);
}

function buildObjEntityFromInterface(
  entryPoint: ApiEntryPoint,
  apiInterface: ApiInterface
): ObjEntity {
  const name = apiInterface.name;
  const members = resolveInterfaceMembers(entryPoint, apiInterface);
  const entity = buildEntity({
    name,
    type: name,
    isOptional: false,
    comment: (apiInterface.tsdocComment as unknown) as DocComment,
  });

  return {...entity, members};
}

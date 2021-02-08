import {
  ApiEntryPoint,
  ApiFunction,
  ApiInterface,
  Parameter,
} from '@microsoft/api-extractor-model';
import {findApi} from './api-finder';
import {Entity, FuncEntity, ObjEntity} from './entity';
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

function resolveControllerFunction(
  entry: ApiEntryPoint,
  fn: ApiFunction
): FuncEntity {
  const params: Entity[] = fn.parameters.map((p, index) =>
    resolveControllerParam(entry, p, index)
  );
  const returnTypeText = fn.returnTypeExcerpt.text;
  const returnTypeInterface = findApi(entry, returnTypeText) as ApiInterface;

  const returnType = buildObjEntityFromInterface(entry, returnTypeInterface);

  return {
    name: fn.name,
    desc: '',
    params,
    returnType,
  };
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

  return {
    name,
    type: name,
    desc: apiInterface.tsdocComment?.emitAsTsdoc() || '',
    isOptional: false,
    members,
  };
}

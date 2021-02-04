import {
  ApiEntryPoint,
  ApiFunction,
  ApiInterface,
} from '@microsoft/api-extractor-model';
import {findApi} from './api-finder';
import {Entity, ObjEntity} from './entity';
import {
  buildEntityFromParam,
  buildParamEntityBasedOnKind,
} from './function-param-resolver';
import {resolveInterfaceMembers} from './interface-resolver';

interface FuncEntity {
  name: string;
  params: (Entity | ObjEntity)[];
  returnType: string;
  desc: string;
}

interface Controller {
  initializer: FuncEntity;
  instance: ObjEntity;
}

export function resolveController(
  entryPoint: ApiEntryPoint,
  controllerName: string
): Controller {
  const controller = findApi(entryPoint, controllerName) as ApiFunction;
  const initializer = getInitializerDoc(entryPoint, controller);

  const apiInterface = findApi(
    entryPoint,
    initializer.returnType
  ) as ApiInterface;
  const instance = buildObjEntityFromInterface(entryPoint, apiInterface);

  return {
    initializer,
    instance,
  };
}

function getInitializerDoc(
  entryPoint: ApiEntryPoint,
  fn: ApiFunction
): FuncEntity {
  const params: Entity[] = fn.parameters.map((p, index) => {
    const isEngine = index === 0;
    return isEngine
      ? buildEntityFromParam(p)
      : buildParamEntityBasedOnKind(entryPoint, p);
  });

  return {
    name: fn.name,
    desc: '',
    params,
    returnType: fn.returnTypeExcerpt.text,
  };
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

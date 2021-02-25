import {
  ApiEntryPoint,
  ApiFunction,
  ApiInterface,
} from '@microsoft/api-extractor-model';
import {DocComment} from '@microsoft/tsdoc';
import {findApi} from './api-finder';
import {
  buildEntity,
  buildFuncEntity,
  buildObjEntity,
  buildParamEntity,
} from './entity-builder';
import {resolveParameter, resolveInterfaceMembers} from './interface-resolver';

export function resolveFunction(
  entry: ApiEntryPoint,
  fn: ApiFunction,
  shallowParamIndices: number[]
) {
  const params = resolveParams(entry, fn, shallowParamIndices);
  const returnTypeText = fn.returnTypeExcerpt.text;
  const returnTypeInterface = findApi(entry, returnTypeText) as ApiInterface;

  const returnType = buildObjEntityFromInterface(entry, returnTypeInterface);

  return buildFuncEntity({
    name: fn.name,
    comment: (fn.tsdocComment as unknown) as DocComment,
    params,
    returnType,
  });
}

function resolveParams(
  entry: ApiEntryPoint,
  fn: ApiFunction,
  shallowParamIndices: number[]
) {
  return fn.parameters.map((p, index) => {
    const shouldResolveShallow = shallowParamIndices.includes(index);
    return shouldResolveShallow
      ? buildParamEntity(p)
      : resolveParameter(entry, p);
  });
}

function buildObjEntityFromInterface(
  entryPoint: ApiEntryPoint,
  apiInterface: ApiInterface
) {
  const name = apiInterface.name;
  const members = resolveInterfaceMembers(entryPoint, apiInterface);
  const entity = buildEntity({
    name,
    type: name,
    isOptional: false,
    comment: (apiInterface.tsdocComment as unknown) as DocComment,
  });

  return buildObjEntity({entity, members, typeName: name});
}

import {
  ApiEntryPoint,
  ApiFunction,
  ApiInterface,
} from '@microsoft/api-extractor-model';
import {DocComment} from '@microsoft/tsdoc';
import {findApi} from './api-finder';
import {buildFuncEntity, buildParamEntity} from './entity-builder';
import {
  resolveParameter,
  resolveInterface,
  InterfaceReferencesCount,
} from './interface-resolver';

export function resolveFunction(
  entry: ApiEntryPoint,
  fn: ApiFunction,
  shallowParamIndices: number[],
  referencesCount: InterfaceReferencesCount
) {
  const params = resolveParams(entry, fn, shallowParamIndices, referencesCount);
  const returnTypeText = fn.returnTypeExcerpt.text;
  const returnTypeInterface = findApi(entry, returnTypeText) as ApiInterface;

  const returnType = buildObjEntityFromInterface(
    entry,
    returnTypeInterface,
    referencesCount
  );

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
  shallowParamIndices: number[],
  referencesCount: InterfaceReferencesCount
) {
  return fn.parameters.map((p, index) => {
    const shouldResolveShallow = shallowParamIndices.includes(index);
    return shouldResolveShallow
      ? buildParamEntity(p)
      : resolveParameter(entry, p, referencesCount);
  });
}

function buildObjEntityFromInterface(
  entryPoint: ApiEntryPoint,
  apiInterface: ApiInterface,
  referencesCount: InterfaceReferencesCount
) {
  return resolveInterface(entryPoint, apiInterface, referencesCount);
}

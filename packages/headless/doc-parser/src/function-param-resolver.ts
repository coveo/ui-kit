import {
  ApiEntryPoint,
  ApiFunction,
  ApiInterface,
  ExcerptTokenKind,
  Parameter,
} from '@microsoft/api-extractor-model';
import {findApi} from './api-finder';
import {ObjEntity} from './entity';
import {buildParamEntity} from './entity-builder';
import {resolveInterfaceMembers} from './interface-resolver';

export function resolveParams(
  entry: ApiEntryPoint,
  fn: ApiFunction,
  shallowParamIndices: number[]
) {
  return fn.parameters.map((p, index) => {
    const shouldResolveShallow = shallowParamIndices.includes(index);
    return shouldResolveShallow
      ? buildParamEntity(p)
      : buildParamEntityBasedOnKind(entry, p);
  });
}

function buildParamEntityBasedOnKind(entryPoint: ApiEntryPoint, p: Parameter) {
  const {kind} = p.parameterTypeExcerpt.spannedTokens[0];
  const isReference = kind === ExcerptTokenKind.Reference;

  return isReference
    ? buildObjEntityFromParam(entryPoint, p)
    : buildParamEntity(p);
}

function buildObjEntityFromParam(
  entryPoint: ApiEntryPoint,
  p: Parameter
): ObjEntity {
  const type = p.parameterTypeExcerpt.text;
  const apiInterface = findApi(entryPoint, type) as ApiInterface;
  const members = resolveInterfaceMembers(entryPoint, apiInterface);
  const entity = buildParamEntity(p);

  return {...entity, members};
}

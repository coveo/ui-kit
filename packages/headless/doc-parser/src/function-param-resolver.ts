import {
  ApiEntryPoint,
  ApiInterface,
  ExcerptTokenKind,
  Parameter,
} from '@microsoft/api-extractor-model';
import {findApi} from './api-finder';
import {buildEntity, ObjEntity} from './entity';
import {resolveInterfaceMembers} from './interface-resolver';

export function buildParamEntityBasedOnKind(
  entryPoint: ApiEntryPoint,
  p: Parameter
) {
  const {kind} = p.parameterTypeExcerpt.spannedTokens[0];
  const isReference = kind === ExcerptTokenKind.Reference;

  return isReference
    ? buildObjEntityFromParam(entryPoint, p)
    : buildEntityFromParam(p);
}

export function buildEntityFromParam(p: Parameter) {
  return buildEntity({
    name: p.name,
    comment: undefined,
    isOptional: false,
    type: p.parameterTypeExcerpt.text,
  });
}

function buildObjEntityFromParam(
  entryPoint: ApiEntryPoint,
  p: Parameter
): ObjEntity {
  const type = p.parameterTypeExcerpt.text;
  const apiInterface = findApi(entryPoint, type) as ApiInterface;
  const members = resolveInterfaceMembers(entryPoint, apiInterface);
  const entity = buildEntityFromParam(p);

  return {...entity, members};
}

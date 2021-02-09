import {
  ApiEntryPoint,
  ApiInterface,
  ExcerptTokenKind,
  Parameter,
} from '@microsoft/api-extractor-model';
import {findApi} from './api-finder';
import {buildEntity, buildObjEntity} from './entity';
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
    desc: '',
    isOptional: false,
    type: p.parameterTypeExcerpt.text,
  });
}

function buildObjEntityFromParam(entryPoint: ApiEntryPoint, p: Parameter) {
  const entity = buildEntityFromParam(p);
  const apiInterface = findApi(entryPoint, entity.type) as ApiInterface;
  const members = resolveInterfaceMembers(entryPoint, apiInterface);

  return buildObjEntity({...entity, members});
}

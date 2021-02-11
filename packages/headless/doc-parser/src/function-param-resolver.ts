import {
  ApiEntryPoint,
  ApiInterface,
  ExcerptTokenKind,
  Parameter,
} from '@microsoft/api-extractor-model';
import {findApi} from './api-finder';
import {ObjEntity} from './entity';
import {buildParamEntity} from './entity-builder';
import {resolveInterfaceMembers} from './interface-resolver';

export function buildParamEntityBasedOnKind(
  entryPoint: ApiEntryPoint,
  p: Parameter
) {
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

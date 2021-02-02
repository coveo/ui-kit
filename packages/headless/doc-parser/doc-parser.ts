import {
  ApiItem,
  ApiItemKind,
  ApiModel,
  ApiPropertySignature,
  ApiEntryPoint,
  ApiPackage,
  ApiFunction,
  Parameter,
  ExcerptTokenKind,
  ApiInterface,
} from '@microsoft/api-extractor-model';
import {writeFileSync} from 'fs';

const prefix = '@coveo/headless!';
const apiModel = new ApiModel();
const apiPackage = apiModel.loadPackage('temp/headless.api.json');
const entryPoint = findEntryPoint(apiPackage) as ApiEntryPoint;

const config = {
  initializer: 'buildPager',
};

const result = getControllerDoc(config.initializer);

writeFileSync('dist/parsed_doc.json', JSON.stringify(result, null, 2));

interface Entity {
  name: string;
  type: string;
  isOptional: boolean;
  desc: string;
  // notes?: []
}

interface ObjEntity extends Entity {
  members: Entity[];
}

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

function findApi(entry: ApiEntryPoint, apiName: string) {
  return entry.members.find((m) =>
    m.canonicalReference.toString().startsWith(`${prefix}${apiName}`)
  );
}

function findEntryPoint(apiPackage: ApiPackage) {
  return apiPackage.members.find((m) => m.kind === ApiItemKind.EntryPoint);
}

function isPropertySignature(item: ApiItem): item is ApiPropertySignature {
  return item.kind === ApiItemKind.PropertySignature;
}

function getControllerDoc(controllerName: string): Controller {
  const controller = findApi(entryPoint, controllerName) as ApiFunction;
  const initializer = getInitializerDoc(controller);

  const apiInterface = findApi(
    entryPoint,
    initializer.returnType
  ) as ApiInterface;
  const instance = buildObjEntityFromInterface(apiInterface);

  return {
    initializer,
    instance,
  };
}

function getInitializerDoc(fn: ApiFunction): FuncEntity {
  const params: Entity[] = fn.parameters.map((p, index) => {
    const isEngine = index === 0;
    return isEngine ? buildEntityFromParam(p) : buildParamEntityBasedOnKind(p);
  });

  return {
    name: fn.name,
    desc: '',
    params,
    returnType: fn.returnTypeExcerpt.text,
  };
}

function buildParamEntityBasedOnKind(p: Parameter) {
  const {kind} = p.parameterTypeExcerpt.spannedTokens[0];
  const isReference = kind === ExcerptTokenKind.Reference;

  return isReference ? buildObjEntityFromParam(p) : buildEntityFromParam(p);
}

function buildEntityFromParam(p: Parameter): Entity {
  return {
    name: p.name,
    desc: '',
    isOptional: false,
    type: p.parameterTypeExcerpt.text,
  };
}

function buildObjEntityFromParam(p: Parameter): ObjEntity {
  const entity = buildEntityFromParam(p);
  const apiInterface = findApi(entryPoint, entity.type) as ApiInterface;
  const members = resolveInterfaceMembers(apiInterface);

  return {...entity, members};
}

function resolveInterfaceMembers(
  apiInterface: ApiInterface
): (Entity | ObjEntity)[] {
  return apiInterface.members.filter(isPropertySignature).map((m) => {
    const {kind} = m.propertyTypeExcerpt.spannedTokens[0];
    const isReference = kind === ExcerptTokenKind.Reference;

    return isReference
      ? buildObjEntityFromProperty(m)
      : buildEntityFromProperty(m);
  });
}

function buildEntityFromProperty(p: ApiPropertySignature): Entity {
  return {
    name: p.name,
    desc: p.tsdocComment?.emitAsTsdoc() || '',
    isOptional: p.isOptional,
    type: p.propertyTypeExcerpt.text,
  };
}

function buildObjEntityFromProperty(p: ApiPropertySignature): ObjEntity {
  const entity = buildEntityFromProperty(p);
  const apiInterface = findApi(entryPoint, entity.type) as ApiInterface;
  const members = resolveInterfaceMembers(apiInterface);

  return {...entity, members};
}

function buildObjEntityFromInterface(apiInterface: ApiInterface): ObjEntity {
  const name = apiInterface.name;
  const members = resolveInterfaceMembers(apiInterface);

  return {
    name,
    type: name,
    desc: apiInterface.tsdocComment?.emitAsTsdoc() || '',
    isOptional: false,
    members,
  };
}

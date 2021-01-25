import {
  DocGen,
  Module,
  DocComment,
  Source,
  TypeParameter,
  Enum,
  Func,
  Interface,
  Type,
} from './DocJsonTypes';
import {getType} from './TypeResolver';

export function getModule(docgen: DocGen, modulePath: string) {
  const mod = docgen.children.find((child) => {
    return child.originalName.includes(modulePath);
  });
  if (!mod) throw `${modulePath} cannot be found.`;
  return mod;
}

export function getFromModuleByName(mod: Module, name: string) {
  const entity = mod.children.find((entity) => {
    return entity.name === name;
  });
  if (!entity) throw `${name} cannot be found.`;
  return entity;
}

export function getDesc(comment: DocComment | undefined) {
  if (!comment) return '';
  if (!comment.shortText && !comment.text) return '';

  if (comment.shortText && comment.text)
    return `${comment.shortText}\n\n${comment.text}`;

  return comment.shortText ? comment.shortText : comment.text;
}

export function getReturns(comment: DocComment | undefined) {
  if (!comment) return '';
  return comment.returns ? comment.returns : '';
}

export function alphabetize(objectArray: {name: string}[]) {
  return objectArray.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
}

export function parseEntity(docgen: DocGen, source: Source) {
  const entity = getFromModuleByName(
    getModule(docgen, source.source),
    source.name
  );
  switch (entity.kindString) {
    case 'Type alias':
      return parseType(entity as Type);
    case 'Interface':
      return parseInterface(entity as Interface);
    case 'Function':
      return parseFunction(entity as Func);
    case 'Enumeration':
      return parseEnum(entity as Enum);
    default:
      throw `${entity.name} is type '${entity.kindString}' and cannot be parsed.`;
  }
}

function parseType(entity: Type) {
  const typeObject = {
    name: entity.name,
    type: getType(entity.type, 'type'),
    text: getDesc(entity.comment),
    type_parameters: expandTypeParameters(entity.typeParameter),
  };
  return typeObject;
}

function parseInterface(entity: Interface) {
  const interfaceObject = {
    name: entity.name,
    text: getDesc(entity.comment),
    properties: entity.children.map((property) => {
      const propertyObject = {
        name: property.name,
        type: getType(property.type, 'interface'),
        text: getDesc(property.comment),
        optional: false,
      };
      if (property.flags && property.flags.isOptional)
        propertyObject.optional = true;
      return propertyObject;
    }),
    type_parameters: expandTypeParameters(entity.typeParameter),
  };
  return interfaceObject;
}

function parseFunction(entity: Func) {
  const functionSignature = entity.signatures.find((sig) => {
    return sig.kindString === 'Call signature';
  });
  if (!functionSignature)
    throw `${entity.name} is missing a function signature.`;
  return {
    name: entity.name,
    text: getDesc(functionSignature.comment),
    parameters: functionSignature.parameters
      ? functionSignature.parameters.map((param) => {
          return {
            name: param.name,
            type: getType(param.type, 'parameter'),
            text: getDesc(param.comment),
          };
        })
      : [],
    returns: getType(functionSignature.type, 'function'),
    returns_text: getReturns(functionSignature.comment),
    type_parameters: expandTypeParameters(functionSignature.typeParameter),
  };
}

function parseEnum(entity: Enum) {
  return {
    name: entity.name,
    text: getDesc(entity.comment),
    members: alphabetize(
      entity.children.map((member) => {
        return {
          name: member.name,
          text: getDesc(member.comment),
        };
      })
    ),
  };
}

function expandTypeParameters(typeParameters: TypeParameter[]) {
  if (!typeParameters) return [];
  return typeParameters.map((param) => {
    return {
      name: param.name,
      extends: getType(param.type, 'generic'),
    };
  });
}

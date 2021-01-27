import {
  ArrayType,
  EntityType,
  IntersectionType,
  IntrinsicType,
  isArrayType,
  isFunc,
  isInterface,
  isIntersectionType,
  isIntrinsicType,
  isReferenceType,
  isReflectionType,
  isStringLiteralType,
  isTypeParameterType,
  isUnionType,
  ReferenceType,
  ReflectionType,
  StringLiteralType,
  TypeParameterType,
  UnionType,
} from './doc-json-types';

export function getType(
  typeObject: EntityType | undefined,
  section: string
): object {
  if (!typeObject) return {};
  if (isStringLiteralType(typeObject) && isType(typeObject, 'stringLiteral'))
    return processStringLiteral(typeObject);
  if (isIntrinsicType(typeObject) && isType(typeObject, 'intrinsic'))
    return processIntrinsicType(typeObject);
  if (isArrayType(typeObject) && isType(typeObject, 'array'))
    return processArrayType(typeObject);
  if (isUnionType(typeObject) && isType(typeObject, 'union'))
    return processUnionType(typeObject, section);
  if (isIntersectionType(typeObject) && isType(typeObject, 'intersection'))
    return processIntersectionType(typeObject);
  if (isReferenceType(typeObject) && isType(typeObject, 'reference'))
    return processReferenceType(typeObject, section);
  if (isTypeParameterType(typeObject) && isType(typeObject, 'typeParameter'))
    return processTypeParameterType(typeObject);
  if (isReflectionType(typeObject) && isType(typeObject, 'reflection'))
    return processReflectionType(typeObject);

  return {};
}

function isType(typeObject: EntityType, targetType: string) {
  return typeObject.type === targetType;
}

function processStringLiteral(typeObject: StringLiteralType) {
  return {
    type: typeObject.type,
    value: typeObject.value,
  };
}

function processIntrinsicType(typeObject: IntrinsicType) {
  return {
    type: typeObject.type,
    name: typeObject.name,
  };
}

function processArrayType(typeObject: ArrayType) {
  return {
    type: 'array',
    arrayOf: getType(typeObject.elementType, 'array'),
  };
}

function processUnionType(typeObject: UnionType, section: string) {
  const unionMembers = getUnionMembers(typeObject, section);
  return {
    type: 'union',
    unionOf: unionMembers.members,
    optional: unionMembers.optional,
  };
}

type UnionMembers = {
  members: object[];
  optional: boolean;
};

function getUnionMembers(typeObject: UnionType, section: string): UnionMembers {
  const members = typeObject.types
    .filter((type) => {
      return section === 'interface'
        ? !(
            isIntrinsicType(type) &&
            isType(type, 'intrinsic') &&
            (type as IntrinsicType).name === 'undefined'
          )
        : true;
    })
    .map((type) => {
      return getType(type, 'union');
    });
  if (
    typeObject.types.find((type) => {
      return (
        isIntrinsicType(type) &&
        isType(type, 'intrinsic') &&
        (type as IntrinsicType).name === 'undefined'
      );
    })
  )
    return {
      members: members,
      optional: true,
    };
  return {
    members: members,
    optional: false,
  };
}

function processIntersectionType(typeObject: IntersectionType) {
  return {
    type: 'intersection',
    intersectionOf: typeObject.types.map((type) => {
      return getType(type, 'intersection');
    }),
  };
}

function processReferenceType(typeObject: ReferenceType, section: string) {
  return {
    type: 'reference',
    name: typeObject.name,
    type_parameters: typeObject.typeArguments
      ? typeObject.typeArguments.map((typeArg) => {
          return getType(typeArg, section);
        })
      : [],
  };
}

function processTypeParameterType(typeObject: TypeParameterType) {
  return {
    type: 'type_parameter',
    name: typeObject.name,
    extends: typeObject.constraint
      ? getType(typeObject.constraint, 'generic')
      : {},
    default: typeObject.default ? getType(typeObject.default, 'generic') : {},
  };
}

function processReflectionType(typeObject: ReflectionType) {
  if (isInterface(typeObject.declaration)) {
    return {
      type: 'object',
      properties: typeObject.declaration.children.map((property) => {
        return {
          name: property.name,
          type: getType(property.type, 'object'),
        };
      }),
    };
  } else if (isFunc(typeObject.declaration)) {
    const functionSignature = typeObject.declaration.signatures[0];
    return {
      type: 'function',
      parameters: functionSignature.parameters
        ? functionSignature.parameters.map((param) => {
            return {
              name: param.name,
              type: getType(param.type, 'parameter'),
            };
          })
        : [],
      returns: getType(functionSignature.type, 'function'),
    };
  } else {
    return {};
  }
}

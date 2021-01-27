export type Config = {
  engine: {
    sources: string[];
  };
  actions: {
    sections: {
      name: string;
      sources: string[];
    }[];
  };
  controllers: Controller[];
};

export type Controller = {
  name: string;
  initialize: {
    initializer: Source;
    others: Source[];
  };
  state: string;
  related: Source[];
  subcontrollers?: Controller[];
};

export type Source = {
  name: string;
  source: string;
};

export interface EntityType {
  type: string;
}

export interface StringLiteralType extends EntityType {
  value: string;
}

export function isStringLiteralType(
  typeObject: EntityType
): typeObject is StringLiteralType {
  return (typeObject as StringLiteralType).value !== undefined;
}

export interface IntrinsicType extends EntityType {
  name: string;
}

export function isIntrinsicType(
  typeObject: EntityType
): typeObject is IntrinsicType {
  return (typeObject as IntrinsicType).name !== undefined;
}

export interface ArrayType extends EntityType {
  elementType: EntityType;
}

export function isArrayType(typeObject: EntityType): typeObject is ArrayType {
  return (typeObject as ArrayType).elementType !== undefined;
}

export interface UnionType extends EntityType {
  types: EntityType[];
}

export function isUnionType(typeObject: EntityType): typeObject is UnionType {
  return (typeObject as UnionType).types !== undefined;
}

export interface IntersectionType extends EntityType {
  types: EntityType[];
}

export function isIntersectionType(
  typeObject: EntityType
): typeObject is IntersectionType {
  return (typeObject as IntersectionType).types !== undefined;
}

export interface ReferenceType extends EntityType {
  name: string;
  typeArguments?: EntityType[];
}

export function isReferenceType(
  typeObject: EntityType
): typeObject is ReferenceType {
  return (typeObject as ReferenceType).name !== undefined;
}

export interface TypeParameterType extends EntityType {
  name: string;
  constraint?: EntityType;
  default?: EntityType;
}

export function isTypeParameterType(
  typeObject: EntityType
): typeObject is TypeParameterType {
  return (typeObject as TypeParameterType).name !== undefined;
}

export interface ReflectionType extends EntityType {
  name: string;
  declaration: Func | Interface;
}

export function isReflectionType(
  typeObject: EntityType
): typeObject is ReflectionType {
  return (typeObject as ReflectionType).declaration !== undefined;
}

export type DocComment = {
  shortText?: string;
  text?: string;
  returns?: string;
  tags?: {
    tag: string;
    text?: string;
    param?: string;
  }[];
};

export interface Entity {
  name: string;
  kindString: string;
  flags?: {
    isExported?: boolean;
    isOptional?: boolean;
  };
  comment?: DocComment;
}

export interface Type extends Entity {
  type: EntityType;
  typeParameter: TypeParameter[];
}

export interface Interface extends Entity {
  children: Property[];
  typeParameter: TypeParameter[];
}

export function isInterface(object: Entity): object is Interface {
  return (object as Interface).children !== undefined;
}

export interface Func extends Entity {
  signatures: FunctionSignature[];
}

export function isFunc(object: Entity): object is Func {
  return (object as Func).signatures !== undefined;
}

export interface Enum extends Entity {
  children: Entity[];
}

export interface TypeParameter extends Entity {
  type: EntityType;
}

export interface FunctionSignature extends Entity {
  parameters: Parameter[];
  type: EntityType;
  typeParameter: TypeParameter[];
}

export interface Parameter extends Entity {
  type: EntityType;
}

export interface Property extends Entity {
  type: EntityType;
}

export type Module = {
  originalName: string;
  children: Entity[];
};

export type DocGen = {
  children: Module[];
};

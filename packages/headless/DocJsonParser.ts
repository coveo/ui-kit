import {readFileSync, writeFileSync} from 'fs';

const DOC_GEN_PATH = './packages/headless/dist/doc.json';
const CONFIG_PATH = './packages/headless/docs.config.json';
const OUTPUT_PATH = './packages/headless/dist/parsed_doc.json';

type Config = {
  engine: {
    sources: string[];
  };
  actions: {
    sections: {
      name: string;
      sources: string[];
    }[];
  };
  controllers: {
    name: string;
    sources: string[];
  }[];
};

type EntityType = {
  type: string;
  name?: string;
  value?: string;
  elementType?: EntityType;
  types?: EntityType[];
  typeArguments?: EntityType[];
  constraint?: EntityType;
  default?: EntityType;
  declaration?: Entity;
};

type DocComment = {
  shortText?: string;
  text?: string;
  returns?: string;
  tags?: {
    tag: string;
    text?: string;
    param?: string;
  }[];
};

type Entity = {
  name: string;
  kindString: string;
  flags?: {
    isExported?: boolean;
    isOptional?: boolean;
  };
  comment?: DocComment;
  type?: EntityType;
  parameters?: Entity[];
  typeParameter?: Entity[];
  children?: Entity[];
  signatures?: Entity[];
  getSignature?: Entity[];
};

type Module = {
  originalName: string;
  children: Entity[];
};

type DocGen = {
  children: Module[];
};

class DocJsonParser {
  private docgen: DocGen;
  private config: Config;

  constructor(docgenPath: string, configPath: string) {
    this.docgen = JSON.parse(readFileSync(docgenPath, 'utf8'));
    this.config = JSON.parse(readFileSync(configPath, 'utf8'));
  }

  parse() {
    return {
      engine: this.parseEngine(),
      controllers: this.parseControllers(),
      actions: this.parseActions(),
    };
  }

  private parseEngine() {
    let engineModules: Module[] = [];
    for (const source of this.config.engine.sources) {
      engineModules = engineModules.concat(this.getModules(source));
    }
    return {
      headless_engine: this.getHeadlessEngine(engineModules),
      types: this.expandTypes(
        this.getFromModulesByKindString(engineModules, 'Type alias')
      ),
      interfaces: this.expandInterfaces(
        this.getFromModulesByKindString(engineModules, 'Interface')
      ),
      functions: this.expandFunctions(
        this.getFromModulesByKindString(engineModules, 'Function')
      ),
    };
  }

  private parseControllers() {
    return this.config.controllers.map((controllerConfig) => {
      let controllerModules: Module[] = [];
      for (const source of controllerConfig.sources) {
        controllerModules = controllerModules.concat(this.getModules(source));
      }

      return {
        name: controllerConfig.name,
        initializer: this.expandInitializer(
          this.getFromModulesByName(
            controllerModules,
            `build${controllerConfig.name}`
          )
        ),
        types: this.expandTypes(
          this.getFromModulesByKindString(controllerModules, 'Type alias')
        ),
        interfaces: this.expandInterfaces(
          this.getFromModulesByKindString(controllerModules, 'Interface')
        ),
        functions: this.expandFunctions(
          this.getFromModulesByKindString(controllerModules, 'Function').filter(
            (value) => {
              return value.name !== `build${controllerConfig.name}`;
            }
          )
        ),
        enums: this.expandEnums(
          this.getFromModulesByKindString(controllerModules, 'Enumeration')
        ),
      };
    });
  }

  private parseActions() {
    return this.config.actions.sections.map((section) => {
      let sectionModules: Module[] = [];
      for (const source of section.sources) {
        sectionModules = sectionModules.concat(this.getModules(source));
      }
      let actions: Entity[] = this.getFromModulesByKindString(
        sectionModules,
        'Variable'
      );
      actions = actions.concat(
        this.getFromModulesByKindString(sectionModules, 'Function')
      );
      actions = actions.filter((action) => {
        return (
          typeof action.flags.isExported !== undefined &&
          action.flags.isExported === true
        );
      });
      return {
        section: section.name,
        actions: this.expandActions(actions),
      };
    });
  }

  private getHeadlessEngine(engineModules: Module[]) {
    const headlessEngine = this.getFromModulesByName(
      engineModules,
      'HeadlessEngine'
    );
    return {
      text: this.getDesc(headlessEngine.comment),
      constructor: this.expandConstructor(
        this.getFromModuleByName(headlessEngine, 'constructor')
      ),
      properties: this.expandTypes(
        this.getFromModuleByKindString(headlessEngine, 'Property')
      ),
      methods: this.expandFunctions(
        this.getFromModuleByKindString(headlessEngine, 'Method')
      ),
      accessors: this.expandAccessors(
        this.getFromModuleByKindString(headlessEngine, 'Accessor')
      ),
    };
  }

  // ----------------Retrieving stuff from the docgen------------------------

  private getModules(modulePath: string) {
    return this.docgen.children.filter((child) => {
      return child.originalName.includes(modulePath);
    });
  }

  private getFromModulesByName(modules: Module[] | Entity[], name: string) {
    for (const mod of modules) {
      const entity = this.getFromModuleByName(mod, name);
      if (entity) return entity;
    }
    return null;
  }

  private getFromModuleByName(mod: Module | Entity, name: string) {
    return mod.children.find((entity) => {
      return entity.name === name;
    });
  }

  private getFromModulesByKindString(
    modules: Module[] | Entity[],
    kindString: string
  ) {
    const entities: Entity[] = [];
    for (const mod of modules) {
      entities.concat(this.getFromModuleByKindString(mod, kindString));
    }
    return entities;
  }

  private getFromModuleByKindString(mod: Module | Entity, kindString: string) {
    return mod.children.filter((entity) => {
      return entity.kindString === kindString;
    });
  }

  private getDesc(comment: DocComment) {
    if (!comment) return '';
    if (!comment.shortText && !comment.text) return '';

    if (comment.shortText && comment.text)
      return `${comment.shortText}\n\n${comment.text}`;

    return comment.shortText ? comment.shortText : comment.text;
  }

  private getReturns(comment: DocComment) {
    if (!comment) return '';
    return comment.returns ? comment.returns : '';
  }

  //-------------------------Expanding the various entities---------------------

  private alphabetize(objectArray: {name: string}[]) {
    return objectArray.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
  }

  private expandFunctions(functions: Entity[]) {
    return this.expandAnyFunctions(functions, 'Call signature', 'signatures');
  }

  private expandAccessors(functions: Entity[]) {
    return this.expandAnyFunctions(functions, 'Get signature', 'getSignature');
  }

  private expandConstructor(func: Entity) {
    return this.expandAnyFunctions(
      [func],
      'Constructor signature',
      'signatures'
    )[0];
  }

  private expandTypes(types: Entity[]) {
    const typesExpanded = types.map((type) => {
      const typeObject = {
        name: type.name,
        type: this.getType(type.type, 'type'),
        text: this.getDesc(type.comment),
        type_parameters: [],
      };
      if (type.typeParameter)
        typeObject.type_parameters = this.expandTypeParameters(
          type.typeParameter
        );
      return typeObject;
    });
    return this.alphabetize(typesExpanded);
  }

  private expandInterfaces(interfaces: Entity[]) {
    const interfacesExpanded = interfaces.map((iface) => {
      const interfaceObject = {
        name: iface.name,
        text: this.getDesc(iface.comment),
        properties: iface.children.map((property) => {
          const propertyObject = {
            name: property.name,
            type: this.getType(property.type, 'interface'),
            text: this.getDesc(property.comment),
            optional: false,
          };
          if (property.flags.isOptional) propertyObject.optional = true;
          return propertyObject;
        }),
        type_parameters: [],
      };
      if (iface.typeParameter)
        interfaceObject.type_parameters = this.expandTypeParameters(
          iface.typeParameter
        );
      return interfaceObject;
    });
    return this.alphabetize(interfacesExpanded);
  }

  private expandEnums(enums: Entity[]) {
    const enumsExpanded = enums.map((enumeration) => {
      return {
        name: enumeration.name,
        text: this.getDesc(enumeration.comment),
        members: this.alphabetize(
          enumeration.children.map((member) => {
            return {
              name: member.name,
              text: this.getDesc(member.comment),
            };
          })
        ),
      };
    });
    return this.alphabetize(enumsExpanded);
  }

  private expandAnyFunctions(
    functions: Entity[],
    kindString: string,
    signatureProperty: string
  ) {
    const functionsExpanded = functions.map((func) => {
      const functionSignature = func[signatureProperty].find((sig) => {
        return sig.kindString === kindString;
      });
      return {
        name: func.name,
        text: this.getDesc(functionSignature.comment),
        parameters: functionSignature.parameters
          ? functionSignature.parameters.map((param) => {
              return {
                name: param.name,
                type: this.getType(param.type, 'parameter'),
                text: this.getDesc(param.comment),
              };
            })
          : [],
        returns: this.getType(functionSignature.type, 'function'),
        returns_text: this.getReturns(functionSignature.comment),
        type_parameters: functionSignature.typeParameter
          ? this.expandTypeParameters(functionSignature.typeParameter)
          : [],
      };
    });
    return this.alphabetize(functionsExpanded);
  }

  private expandInitializer(func: Entity) {
    const functionSignature = func.signatures.find((sig) => {
      return sig.kindString === 'Call signature';
    });
    return {
      name: func.name,
      text: this.getDesc(functionSignature.comment),
      parameters: functionSignature.parameters.map((param) => {
        return {
          name: param.name,
          type: this.getType(param.type, 'parameter'),
          text: this.getDesc(param.comment),
        };
      }),
      returns: this.getControllerMethods(functionSignature.type),
      returns_text: this.getReturns(functionSignature.comment),
      type_parameters: functionSignature.typeParameter
        ? this.expandTypeParameters(functionSignature.typeParameter)
        : [],
    };
  }

  private getControllerMethods(typeObject: EntityType) {
    const functions: Entity[] = [];
    const accessors: Entity[] = [];
    for (const method of typeObject.declaration.children) {
      if (method.kindString === 'Function') functions.push(method);
      if (method.kindString === 'Accessor') accessors.push(method);
    }
    return {
      methods: this.expandFunctions(functions),
      accessors: this.expandAccessors(accessors),
    };
  }

  private expandActions(actions: Entity[]) {
    return actions.map((action) => {
      return {
        name: action.name,
        text: this.getDesc(action.comment),
        parameters: this.getActionParameters(action),
      };
    });
  }

  private getActionParameters(action: Entity) {
    if (!action.comment || !action.comment.tags) return [];

    return action.comment.tags.map(function (param) {
      return {
        name: param.param,
        text: this.getDesc(param),
      };
    });
  }

  private expandTypeParameters(typeParameters: Entity[]) {
    return typeParameters.map((param) => {
      return {
        name: param.name,
        extends: this.getType(param.type, 'generic'),
      };
    });
  }

  // -----------------Type Resolver-------------------------------------

  private getType(typeObject: EntityType, section: string): object {
    if (!typeObject) return {};
    if (this.isType(typeObject, 'stringLiteral'))
      return this.processStringLiteral(typeObject);
    if (this.isType(typeObject, 'intrinsic'))
      return this.processIntrinsicType(typeObject);
    if (this.isType(typeObject, 'array'))
      return this.processArrayType(typeObject);
    if (this.isType(typeObject, 'union'))
      return this.processUnionType(typeObject, section);
    if (this.isType(typeObject, 'intersection'))
      return this.processIntersectionType(typeObject);
    if (this.isType(typeObject, 'reference'))
      return this.processReferenceType(typeObject, section);
    if (this.isType(typeObject, 'typeParameter'))
      return this.processTypeParameterType(typeObject);
    if (this.isType(typeObject, 'reflection'))
      return this.processReflectionType(typeObject);

    return {};
  }

  private isType(typeObject: EntityType, targetType: string) {
    return typeObject.type === targetType;
  }

  private processStringLiteral(typeObject: EntityType) {
    return {
      type: typeObject.type,
      value: typeObject.value,
    };
  }

  private processIntrinsicType(typeObject: EntityType) {
    return {
      type: typeObject.type,
      name: typeObject.name,
    };
  }

  private processArrayType(typeObject: EntityType) {
    return {
      type: 'array',
      arrayOf: this.getType(typeObject.elementType, 'array'),
    };
  }

  private processUnionType(typeObject: EntityType, section: string) {
    const processedType = {
      type: 'union',
      unionOf: typeObject.types.map((type) => {
        return this.getType(type, 'union');
      }),
      optional: false,
    };
    if (
      section === 'interface' &&
      processedType.unionOf.includes({type: 'intrinsic', name: 'undefined'})
    ) {
      processedType.optional = true;
      processedType.unionOf = processedType.unionOf.filter((type) => {
        return type !== {type: 'intrinsic', name: 'undefined'};
      });
    }
    return processedType;
  }

  private processIntersectionType(typeObject: EntityType) {
    return {
      type: 'intersection',
      intersectionOf: typeObject.types.map((type) => {
        return this.getType(type, 'intersection');
      }),
    };
  }

  private processReferenceType(typeObject: EntityType, section: string) {
    const processedType = {
      type: 'reference',
      name: typeObject.name,
      type_parameters: [],
    };
    if (typeObject.typeArguments) {
      processedType.type_parameters = typeObject.typeArguments.map(
        (typeArg) => {
          return this.getType(typeArg, section);
        }
      );
    }
    return processedType;
  }

  private processTypeParameterType(typeObject: EntityType) {
    const processedType = {
      type: 'type_parameter',
      name: typeObject.name,
      extends: {},
      default: {},
    };
    if (typeObject.constraint)
      processedType.extends = this.getType(typeObject.constraint, 'generic');
    if (typeObject.default)
      processedType.default = this.getType(typeObject.default, 'generic');
    return processedType;
  }

  private processReflectionType(typeObject: EntityType) {
    if (typeObject.declaration.children) {
      return {
        type: 'object',
        properties: typeObject.declaration.children.map((property) => {
          return {
            name: property.name,
            type: this.getType(property.type, 'object'),
          };
        }),
      };
    } else if (typeObject.declaration.signatures) {
      const processedType = {
        type: 'function',
        parameters: [],
        returns: this.getType(
          typeObject.declaration.signatures[0].type,
          'function'
        ),
      };
      if (typeObject.declaration.signatures[0].parameters) {
        for (const param of typeObject.declaration.signatures[0].parameters) {
          processedType.parameters.push({
            name: param.name,
            type: this.getType(param.type, 'parameter'),
          });
        }
      }
      return processedType;
    } else {
      return {};
    }
  }
}

const parser = new DocJsonParser(DOC_GEN_PATH, CONFIG_PATH);
writeFileSync(OUTPUT_PATH, JSON.stringify(parser.parse(), null, 2));

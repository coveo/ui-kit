import {
  TypeScriptZodRenderer,
  TypeScriptZodTargetLanguage,
  type EnumType,
  type Name,
  type ObjectType,
  type PrimitiveStringTypeKind,
  type RenderContext,
  type Sourcelike,
  type StringTypeMapping,
  type TransformedStringTypeKind,
  type Type,
  type TypeKind,
} from 'quicktype-core';
import {
  minMaxLengthForType,
  minMaxValueForType,
  patternForType,
} from 'quicktype-core/dist/esm/attributes/Constraints.js';
const customTypeKinds = new Set<TypeKind>(['any', 'integer', 'double', 'string', 'uri', 'enum']);
export class ThermidorZodTargetLanguage extends TypeScriptZodTargetLanguage {
  get supportsFullObjectType() {
    return true;
  }
  get stringTypeMapping(): StringTypeMapping {
    return new Map<TransformedStringTypeKind, PrimitiveStringTypeKind>([['uri', 'uri']]);
  }
  makeRenderer(renderContext: RenderContext): ThermidorZodRenderer {
    return new ThermidorZodRenderer(this, renderContext, {justSchema: false});
  }
}
class ThermidorZodRenderer extends TypeScriptZodRenderer {
  importStatement(lhs: Sourcelike): Sourcelike {
    return ['import ', lhs, ' from "zod/v4";'];
  }
  typeMapTypeFor(type: Type, required = true): Sourcelike {
    if (!customTypeKinds.has(type.kind)) {
      return super.typeMapTypeFor(type, required);
    }
    let schema: Sourcelike;
    switch (type.kind) {
      case 'any':
        schema = 'z.unknown()';
        break;
      case 'integer':
        schema = this.renderNumber(type, 'z.number().int()');
        break;
      case 'double':
        schema = this.renderNumber(type, 'z.number()');
        break;
      case 'enum':
        schema = this.renderEnum(type as EnumType);
        break;
      case 'uri':
        schema = this.renderString(type, 'z.url()');
        break;
      case 'string':
        schema = this.renderString(type, 'z.string()');
        break;
      default:
        throw new Error(`Unsupported type kind: ${type.kind}`);
    }
    return required ? [schema] : schema;
  }
  renderEnum(type: EnumType, required = true): Sourcelike {
    const cases = [...type.cases];
    if (cases.length === 1) {
      return `z.literal(${JSON.stringify(cases[0])})`;
    }
    return `z.enum([${cases.map((c) => JSON.stringify(c)).join(', ')}])`;
  }
  renderNumber(type: Type, base: string): string {
    const constraints = [base];
    const [minimum, maximum] = minMaxValueForType(type) ?? [];
    if (minimum !== undefined) {
      constraints.push(`.min(${minimum})`);
    }
    if (maximum !== undefined) {
      constraints.push(`.max(${maximum})`);
    }
    return constraints.join('');
  }
  renderString(type: Type, base: string): string {
    const constraints = [base];
    const [minimumLength, maximumLength] = minMaxLengthForType(type) ?? [];
    const pattern = patternForType(type);
    if (minimumLength !== undefined) {
      constraints.push(`.min(${minimumLength})`);
    }
    if (maximumLength !== undefined) {
      constraints.push(`.max(${maximumLength})`);
    }
    if (pattern !== undefined) {
      constraints.push(`.regex(new RegExp(${JSON.stringify(pattern)}))`);
    }
    return constraints.join('');
  }
  emitObject(name: Name, type: ObjectType): void {
    this.ensureBlankLine();
    this.emitLine('\nexport const ', name, 'Schema = ');
    this.emitObjectSchema(type);
    this.emitLine('export type ', name, ' = z.infer<typeof ', name, 'Schema>;');
  }
  emitEnum(enumType: EnumType, enumName: Name): void {
    if (enumType.cases.size === 1) {
      return;
    }
    super.emitEnum(enumType, enumName);
  }
  emitObjectSchema(type: ObjectType): void {
    const properties = type.getProperties();
    const additionalProperties = type.getAdditionalProperties();
    this.emitLine(this.objectConstructor(additionalProperties), '({');
    this.indent(() => {
      this.forEachClassProperty(type, 'none', (_, jsonName, property) => {
        if (this.isRecursive(type) && this.requiresDeferredSchema(property.type)) {
          this.emitLine('get ', JSON.stringify(jsonName), '() {');
          this.indent(() => this.emitLine('return ', this.typeMapTypeForProperty(property), ';'));
          this.emitLine('},');
          return;
        }
        this.emitLine(JSON.stringify(jsonName), ': ', this.typeMapTypeForProperty(property), ',');
      });
    });
    this.emitLine('})', this.objectUnknownKeySuffix(additionalProperties));
  }
  requiresDeferredSchema(type: Type): boolean {
    if (['class', 'object'].includes(type.kind) && this.isRecursive(type as ObjectType)) {
      return true;
    }
    return [...type.getChildren()].some((child) => this.requiresDeferredSchema(child));
  }
  objectUnknownKeySuffix(additionalProperties: Type | undefined): Sourcelike {
    return additionalProperties === undefined || additionalProperties.kind === 'any'
      ? ''
      : ['.catchall(', this.typeMapTypeFor(additionalProperties, false), ')'];
  }
  objectConstructor(additionalProperties: Type | undefined): string {
    if (additionalProperties === undefined) {
      return 'z.strictObject';
    }
    return additionalProperties.kind === 'any' ? 'z.looseObject' : 'z.object';
  }
}

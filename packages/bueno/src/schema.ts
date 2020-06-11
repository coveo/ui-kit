export interface SchemaValue<T> {
  validate(value: T): void;
  default: T | undefined;
}

type SchemaDefinition<T extends object> = {
  [key in keyof T]: SchemaValue<T[key]>;
};

export class Schema<Values extends object> {
  constructor(private definitions: SchemaDefinition<Values>) {}

  public validate(values: Partial<Values> = {}) {
    const mergedValues = {
      ...this.default,
      ...values,
    };

    for (const definition in this.definitions) {
      try {
        this.definitions[definition].validate(mergedValues[definition]!);
      } catch (error) {
        throw Error(`${error} (${definition})`);
      }
    }

    return mergedValues;
  }

  private get default() {
    const defaultValues: Partial<Values> = {};
    for (const definition in this.definitions) {
      const defaultValue = this.definitions[definition].default;
      if (defaultValue !== undefined) {
        defaultValues[definition] = defaultValue;
      }
    }

    return defaultValues;
  }
}

type InferValuesFromSchema<T> = T extends Schema<infer P> ? P : never;

export type SchemaValues<
  Schema,
  RequiredValues extends keyof InferValuesFromSchema<Schema> = never
> = Partial<InferValuesFromSchema<Schema>> &
  Pick<InferValuesFromSchema<Schema>, RequiredValues>;

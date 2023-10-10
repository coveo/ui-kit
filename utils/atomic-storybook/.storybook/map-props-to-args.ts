import AtomicDocumentation from '@coveo/atomic/docs/atomic-docs.json';
import {isNullOrUndefined} from '@coveo/bueno';
import {ArgTypes} from '@storybook/html';
import {JsonDocsValue} from '@stencil/core/internal';

const availableControlType = [
  'object',
  'boolean',
  'check',
  'inline-check',
  'radio',
  'inline-radio',
  'select',
  'multi-select',
  'number',
  'range',
  'file',
  'color',
  'date',
  'text',
] as const;
type ControlType = (typeof availableControlType)[number];

const excludedPropType = ['ResultTemplateCondition'] as const;

export const getDocumentationFromTag = (componentTag: string) => {
  return AtomicDocumentation.components.find(
    (componentDoc) => componentDoc.tag === componentTag
  );
};

export const mapPropsToArgTypes = (componentTag: string): ArgTypes => {
  const componentDocumentation = getDocumentationFromTag(componentTag);
  if (!componentDocumentation) {
    return {};
  }

  const ret: ArgTypes = {};

  componentDocumentation.props
    .filter(
      (prop) =>
        !excludedPropType.some((excludedProp) =>
          prop.type.toLowerCase().includes(excludedProp.toLowerCase())
        )
    )
    .forEach((prop) => {
      const {control, options} = determineControlTypeFromJsonValues(
        prop.values
      );
      ret[prop.name] = {
        description: `<pre>${prop.docs}</pre>`,
        control,
        options,
        table: {
          defaultValue: {
            summary: (prop as {default?: string}).default,
          },
        },
      };
    });

  return ret;
};

const determineControlTypeFromJsonValues = (
  jsonValues: JsonDocsValue[]
): {control: ControlType; options?: (string | undefined)[]} => {
  const noNullOrUndefinedJsonValue = jsonValues.filter(
    (val) => val.type !== 'null' && val.type !== 'undefined'
  );

  if (noNullOrUndefinedJsonValue.length === 0) {
    return {control: 'text'};
  }

  if (
    noNullOrUndefinedJsonValue.every((val) => !isNullOrUndefined(val.value))
  ) {
    return {
      control: 'radio',
      options: noNullOrUndefinedJsonValue.map((v) => v.value),
    };
  }

  // TODO: Might want to handle some corner case eventually.
  // eg: Date picker might be more suited in specific cases VS text.
  const controlType = availableControlType.find(
    (controlType) => controlType === noNullOrUndefinedJsonValue[0].type
  );
  return controlType ? {control: controlType} : {control: 'text'};
};

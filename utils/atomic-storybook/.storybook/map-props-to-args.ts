import AtomicDocumentation from '@coveo/atomic/docs/atomic-docs.json';
import {isNullOrUndefined} from '@coveo/bueno';
import {JsonDocs, JsonDocsValue} from '@stencil/core/internal';
import {ArgTypes} from '@storybook/api';
import {Options} from '@storybook/components';

const availableControlType = [
  'radio',
  'inline-radio',
  'check',
  'inline-check',
  'select',
  'multi-select',
  'array',
  'boolean',
  'color',
  'date',
  'number',
  'range',
  'object',
  'text',
] as const;

const excludedPropType = ['ResultTemplateCondition'] as const;

type ControlType = typeof availableControlType[number];

export const getDocumentationFromTag = (componentTag: string) => {
  return (AtomicDocumentation as JsonDocs).components.find(
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
      const {type, options} = determineControlTypeFromJsonValues(prop.values);
      ret[prop.name] = {
        description: `<pre>${prop.docs}</pre>`,
        table: {
          defaultValue: {summary: prop.default},
        },
        options,
        control: {type},
      };
    });

  return ret;
};

const determineControlTypeFromJsonValues = (
  jsonValues: JsonDocsValue[]
): {type: ControlType; options?: Options} => {
  const noNullOrUndefinedJsonValue = jsonValues.filter(
    (val) => val.type !== 'null' && val.type !== 'undefined'
  );

  if (noNullOrUndefinedJsonValue.length === 0) {
    return {type: 'text'};
  }

  if (
    noNullOrUndefinedJsonValue.every((val) => !isNullOrUndefined(val.value))
  ) {
    return {
      type: 'radio',
      options: noNullOrUndefinedJsonValue.map((v) => v.value),
    };
  }

  // TODO: Might want to handle some corner case eventually.
  // eg: Date picker might be more suited in specific cases VS text.
  return availableControlType.find(
    (controlType) => controlType === noNullOrUndefinedJsonValue[0].type
  )
    ? {type: noNullOrUndefinedJsonValue[0].type as ControlType}
    : {type: 'text'};
};

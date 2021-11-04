import AtomicDocumentation from '../docs/atomic-docs.json';
import {ArgTypes} from '@storybook/api';
import {Options} from '@storybook/components';
import {JsonDocs, JsonDocsValue} from '@stencil/core/internal';
import {isNullOrUndefined} from '@coveo/bueno';

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

  componentDocumentation.props.forEach((prop) => {
    ret[prop.name] = {
      description: prop.docs,
      table: {
        defaultValue: {summary: prop.default},
      },
      control: determineControlTypeFromJsonValues(prop.values),
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

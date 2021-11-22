import {JsonDocsProp} from '@stencil/core/internal';
import {getDocumentationFromTag} from './map-props-to-args';
import {renderArgsToHTMLString} from './default-story-shared';

function generateSampleValue(property: JsonDocsProp) {
  if (property.default) {
    return property.default.replace(/'/g, '');
  }
  if (property.values[0].value) {
    return property.values[0].value;
  }
  switch (property.type) {
    case 'boolean':
      return true;
    case 'string':
    default:
      return 'foo';
  }
}

export const SearchInterfaceDocumentation = getDocumentationFromTag(
  'atomic-search-interface'
);

export function propertyToCodeSample(property: JsonDocsProp) {
  const isReadOnlyProperty = ['engine', 'i18n'];
  if (isReadOnlyProperty.indexOf(property.name) !== -1) {
    return 'This property should not be modified directly.';
  }

  return renderArgsToHTMLString(
    'atomic-search-interface',
    {[property.name]: generateSampleValue(property)},
    {}
  );
}

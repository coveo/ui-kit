import {Fragment, FunctionalComponent, h} from '@stencil/core';
import {LocalizedStringProps} from '../directives/localized-string';

/**
 * @deprecated Should only be used for Stencil components; for Lit components, use the localizedString directive instead
 */
export const LocalizedString: FunctionalComponent<LocalizedStringProps> = ({
  i18n,
  key,
  params,
  count,
}) => {
  const delimitingCharacter = '\u001d'; // Unicode group separator
  const placeholderPrefixCharacter = '\u001a'; // Unicode substitute character
  const getPlaceholderForParamKey = (paramKey: string) =>
    `${delimitingCharacter}${placeholderPrefixCharacter}${paramKey}${delimitingCharacter}`;
  const getParamFromPlaceholder = (placeholder: string) =>
    params[placeholder.slice(1)];

  const placeholdersMap = Object.fromEntries(
    Object.keys(params).map((paramKey) => [
      paramKey,
      getPlaceholderForParamKey(paramKey),
    ])
  );
  const localizedStringWithPlaceholders = i18n.t(key, {
    interpolation: {escapeValue: false},
    count,
    ...placeholdersMap,
  });

  return (
    <Fragment>
      {localizedStringWithPlaceholders
        .split(delimitingCharacter)
        .map((text) =>
          text.startsWith(placeholderPrefixCharacter)
            ? getParamFromPlaceholder(text)
            : text
        )}
    </Fragment>
  );
};

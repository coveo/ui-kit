import {Fragment, FunctionalComponent, h, VNode} from '@stencil/core';
import {i18n} from 'i18next';

export interface LocalizedStringProps {
  i18n: i18n;
  key: string;
  params: Record<string, VNode | string>;
  count?: number;
}

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

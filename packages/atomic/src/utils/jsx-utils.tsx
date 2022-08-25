import {Fragment, FunctionalComponent, h, VNode} from '@stencil/core';
import {AnyBindings} from '../components/common/interface/bindings';

export interface LocalizedStringProps {
  bindings: AnyBindings;
  key: string;
  params: Record<string, VNode | string>;
  i18nCount?: number;
}

export const LocalizedString: FunctionalComponent<LocalizedStringProps> = ({
  bindings,
  key,
  params,
  i18nCount,
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
  const localizedStringWithPlaceholders = bindings.i18n.t(key, {
    interpolation: {escapeValue: false},
    count: i18nCount,
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

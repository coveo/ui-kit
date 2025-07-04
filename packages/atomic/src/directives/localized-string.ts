import type {i18n} from 'i18next';
import {html, type TemplateResult} from 'lit';
import {Directive, directive, type PartInfo, PartType} from 'lit/directive.js';

export interface LocalizedStringProps {
  i18n: i18n;
  key: string;
  params: Record<string, TemplateResult | string>;
  count?: number;
}

class LocalizedStringDirective extends Directive {
  private readonly delimitingCharacter = '\u001d'; // Unicode group separator
  private readonly placeholderPrefixCharacter = '\u001a'; // Unicode substitute character

  constructor(partInfo: PartInfo) {
    super(partInfo);
    if (partInfo.type !== PartType.CHILD) {
      throw new Error('localizedString can only be used in child bindings');
    }
  }

  render(props: LocalizedStringProps) {
    const {i18n, key, params, count} = props;

    const getPlaceholderForParamKey = (paramKey: string) =>
      `${this.delimitingCharacter}${this.placeholderPrefixCharacter}${paramKey}${this.delimitingCharacter}`;
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
      count: count,
      ...placeholdersMap,
    });

    return html`${localizedStringWithPlaceholders
      .split(this.delimitingCharacter)
      .map((text) =>
        text.startsWith(this.placeholderPrefixCharacter)
          ? getParamFromPlaceholder(text)
          : text
      )}`;
  }
}

export const localizedString = directive(LocalizedStringDirective);

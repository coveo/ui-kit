import type {i18n} from 'i18next';
import {html} from 'lit';
import {repeat} from 'lit/directives/repeat.js';
import {styleMap} from 'lit/directives/style-map.js';
import {renderFieldsetGroup} from '@/src/components/common/fieldset-group';
import {renderIconButton} from '@/src/components/common/icon-button';
import type {HighlightKeywords} from '@/src/components/search/result-template-components/atomic-quickview-modal/atomic-quickview-modal';
import type {QuickviewWordHighlight} from '@/src/components/search/result-template-components/quickview-word-highlight/quickview-word-highlight';
import {multiClassMap, tw} from '@/src/directives/multi-class-map';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import Add from '../../../../images/add.svg';
import ArrowDown from '../../../../images/arrow-bottom-rounded.svg';
import ArrowUp from '../../../../images/arrow-top-rounded.svg';
import Remove from '../../../../images/remove.svg';

export interface KeywordsProps {
  i18n: i18n;
  onHighlightKeywords: (highlight: HighlightKeywords) => void;
  highlightKeywords: HighlightKeywords;
  words: Record<string, QuickviewWordHighlight>;
}

export const identifierKeywordsSection = 'coveo-quickview-sidebar-keywords';

export const renderKeywords: FunctionalComponent<KeywordsProps> = ({props}) => {
  return html`
    <div id=${identifierKeywordsSection}>
      ${repeat(
        Object.values(props.words),
        (keyword) => keyword.text,
        (keyword) => {
          const wordIsEnabled =
            !props.highlightKeywords.highlightNone &&
            (props.highlightKeywords.keywords[keyword.text] === undefined ||
              props.highlightKeywords.keywords[keyword.text].enabled === true);

          const keywordContainerClasses = tw({
            'bg-background border-neutral flex grow items-center overflow-x-auto rounded-lg border': true,
            'pointer-events-none opacity-50': !wordIsEnabled,
          });

          const navigationLabel = props.i18n.t('quickview-navigate-keywords', {
            occurrences: keyword.occurrences,
            keyword: keyword.text,
          });

          const formattedOccurrences = new Intl.NumberFormat(
            props.i18n.language,
            {
              notation: 'compact',
            }
          ).format(keyword.occurrences);

          const toggleLabel = props.i18n.t('quickview-remove-word');
          const ariaPressed = (!wordIsEnabled ? 'true' : 'false') as
            | 'true'
            | 'false';
          const tabIndex = props.highlightKeywords.highlightNone ? -1 : 0;

          return html`
            <div class="my-4 flex w-100 items-center justify-between gap-x-2">
              <div class=${multiClassMap(keywordContainerClasses)}>
                <div
                  class="flex grow items-center border-r p-4"
                  aria-hidden="true"
                >
                  <div
                    class="mr-2 h-5 w-5 flex-none"
                    style=${styleMap({backgroundColor: keyword.color})}
                  ></div>
                  <div class="mr-2 grow whitespace-nowrap">
                    ${keyword.text}
                  </div>
                  <div class="flex-none">
                    (${formattedOccurrences})
                  </div>
                </div>
                ${renderFieldsetGroup({props: {label: navigationLabel}})(html`
                  <div class="flex px-2">
                    ${renderIconButton({
                      props: {
                        partPrefix: 'sidebar-next',
                        icon: ArrowDown,
                        disabled: !wordIsEnabled,
                        style: 'text-transparent',
                        class: 'border-0',
                        ariaLabel: props.i18n.t('next'),
                        title: props.i18n.t('next'),
                        onClick: () => keyword.navigateForward(),
                      },
                    })}
                    ${renderIconButton({
                      props: {
                        partPrefix: 'sidebar-previous',
                        icon: ArrowUp,
                        disabled: !wordIsEnabled,
                        style: 'text-transparent',
                        class: 'border-0',
                        ariaLabel: props.i18n.t('previous'),
                        title: props.i18n.t('previous'),
                        onClick: () => keyword.navigateBackward(),
                      },
                    })}
                  </div>
                `)}
              </div>
              ${renderIconButton({
                props: {
                  partPrefix: 'sidebar-remove-word',
                  class: props.highlightKeywords.highlightNone
                    ? 'pointer-events-none opacity-50'
                    : '',
                  tabIndex,
                  ariaPressed,
                  style: 'text-transparent',
                  icon: wordIsEnabled ? Remove : Add,
                  ariaLabel: toggleLabel,
                  onClick: () => {
                    props.onHighlightKeywords({
                      ...props.highlightKeywords,
                      keywords: {
                        ...props.highlightKeywords.keywords,
                        [keyword.text]: {
                          enabled: !wordIsEnabled,
                          indexIdentifier: keyword.indexIdentifier,
                        },
                      },
                    });
                  },
                },
              })}
            </div>
          `;
        }
      )}
    </div>
  `;
};

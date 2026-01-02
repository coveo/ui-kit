import {html, nothing} from 'lit';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import '@/src/components/common/atomic-icon/atomic-icon';

interface Props {
  icon: string;
  hasSuggestion: boolean;
}

export const renderQuerySuggestionIcon: FunctionalComponent<Props> = ({
  props: {icon, hasSuggestion},
}) => {
  if (!hasSuggestion) {
    return nothing;
  }

  return html`<atomic-icon
    part="query-suggestion-icon"
    .icon=${icon}
    class="mr-2 h-4 w-4 shrink-0"
  ></atomic-icon>`;
};

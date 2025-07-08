import {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {i18n} from 'i18next';
import {nothing, TemplateResult} from 'lit';
import {renderButton} from '../button';

interface QueryErrorShowMoreProps {
  onShowMore: () => void;
  i18n: i18n;
  link?: TemplateResult;
}

export const renderQueryErrorShowMore: FunctionalComponent<
  QueryErrorShowMoreProps
> = ({props}) => {
  if (props.link) {
    return props.link;
  }

  return renderButton({
    props: {
      part: 'more-info-btn',
      style: 'primary',
      class: 'mt-8 p-3',
      onClick: () => {
        props.onShowMore();
      },
      text: props.i18n.t('more-info'),
    },
  })(nothing);
};

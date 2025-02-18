import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {Button} from '../stencil-button';

interface CancelProps {
  i18n: i18n;
  onClick: () => void;
}
export const Cancel: FunctionalComponent<CancelProps> = ({i18n, onClick}) => {
  return (
    <Button
      style="primary"
      part="cancel-button"
      text={i18n.t('cancel-last-action')}
      onClick={() => onClick()}
      class="my-3 px-2.5 py-3 font-bold"
    ></Button>
  );
};

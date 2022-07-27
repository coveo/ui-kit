import {FunctionalComponent, h} from '@stencil/core';
import {Button, ButtonProps} from '../../common/button';
interface Props extends Partial<ButtonProps> {
  icon: string;
  ariaLabel: string;
  tooltip?: string;
  onClick?: () => void;
}

export const InsightIconButton: FunctionalComponent<Props> = ({
  icon,
  ariaLabel,
  tooltip,
  onClick = () => {},
}) => (
  <Button
    style="outline-neutral"
    ariaLabel={ariaLabel}
    class="p-3"
    part="button"
    onClick={onClick}
  >
    <atomic-icon icon={icon} class="w-4 h-4 shrink-0"></atomic-icon>
    {Boolean(tooltip) && <div class="tooltip">{tooltip}</div>}
  </Button>
);

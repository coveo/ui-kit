import {css} from 'lit';

const styles = css`
  @reference '../../../utils/tailwind.global.tw.css';
  @reference '../../../utils/tailwind-utilities/set-font-size.css';
  atomic-smart-snippet-answer {
    @apply set-font-size-lg;

    display: block;
    overflow: hidden;
    height: var(--collapsed-size);

    --gradient-start: var(
      --atomic-smart-snippet-gradient-start,
      calc(
        max(
          var(--collapsed-size) - (var(--line-height) * 1.5),
          var(--collapsed-size) * 0.5
        )
      )
    );
    color: var(--atomic-on-background);
    mask-image: linear-gradient(
      black,
      black var(--gradient-start),
      transparent 100%
    );
  }

  atomic-smart-snippet-answer.loaded {
    transition: height ease-in-out 0.25s;
  }

  button atomic-icon {
    @apply relative top-0.5;
  }

  .expanded atomic-smart-snippet-answer {
    height: var(--full-height);
    mask-image: none;
  }

  .expanded button atomic-icon {
    @apply top-0 -scale-y-100;
  }
`;

export default styles;

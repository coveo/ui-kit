import {css} from 'lit';

const styles = css`
  @reference '../../../utils/tailwind.global.tw.css';

  :host {
    white-space: nowrap;
    width: 100%;
    overflow-x: visible;
    display: flex;
    position: relative;
  }
`;

export default styles;

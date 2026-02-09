import {css} from 'lit';

export default css`
  @reference '../../../utils/tailwind.global.tw.css';

  :host {
    @apply block;
  }

  .item-header {
    @apply flex items-center;
  }

  .dot-container {
    @apply flex items-center justify-center;
    width: 10px;
  }

  .dot {
    height: 8px;
    width: 8px;
    border-radius: 9999px;
    background: #adb5bd;
  }

  .item-title,
  [part='title'] {
    @apply text-lg font-semibold text-on-background;
    margin-left: 12px;
  }

  .item-title {
    @apply bg-transparent;
    cursor: pointer;
    transition: background-color 0.3s;
    padding: 2px 4px;
  }

  .hoverable:hover {
    background-color: #f3f3f3;
    border-radius: 8px;
  }

  .item-body {
    @apply flex;
  }

  .line-container {
    @apply flex justify-center;
    width: 10px;
    flex-shrink: 0;
  }

  .line {
    width: 1px;
    background: #e5e5e5;
  }

  .item-content {
    margin-left: 12px;
    padding-top: 8px;
    padding-bottom: 12px;
  }
`;

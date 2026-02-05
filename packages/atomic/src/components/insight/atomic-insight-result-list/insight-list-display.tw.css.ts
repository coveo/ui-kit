import {css} from 'lit';

const styles = css`
@reference '../../../utils/tailwind.global.tw.css';
@reference '../../../components/common/item-list/styles/mixins.pcss';

[part~='divider'] {
  &:not(:last-child) {
    @apply border-b-neutral;
    padding-bottom: 1rem;
  }
  margin-bottom: 1rem;
}

.list-root.display-list {
  display: flex;
  flex-direction: column;

  .result-component,
  atomic-result-placeholder {
    width: auto;
  }

  @apply atomic-list-with-dividers;

  .result-component[part~='outline']::before {
    @apply mx-6 my-0;
  }
}

.list-root.placeholder {
  padding: 0.5rem 1.5rem;
}
`;

export default styles;

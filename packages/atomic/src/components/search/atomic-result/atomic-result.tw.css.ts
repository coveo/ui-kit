import {css} from 'lit';

const styles = css`
@import "../../common/template-system/template-system.css";

:host {
  @apply atomic-template-system;
}

   atomic-result-section-badges {
      text-align: left;
    }

    atomic-result-section-actions {
      text-align: left;
    }

    atomic-result-section-title-metadata {
      @apply set-font-size-sm;
    }

    atomic-result-section-emphasized {
      font-weight: 500;
      @apply set-font-size-2xl;
      margin-top: 0.5rem;
    }
`;

export default styles;

import {newSpecPage} from '@stencil/core/testing';
import {AtomicFieldCondition} from './atomic-field-condition';
import {AtomicResultList} from '../../atomic-result-list/atomic-result-list';
import {AtomicResultTemplate} from '../../atomic-result-template/atomic-result-template';

describe('atomic-field-condition', () => {
  it('renders correctly when it is a children of an template element', async () => {
    const page = await newSpecPage({
      components: [
        AtomicResultList,
        AtomicResultTemplate,
        AtomicFieldCondition,
      ],
      html:
        '<template><atomic-field-condition></atomic-field-condition></template>',
    });

    expect(page.root).toBeTruthy();
  });

  it('throws an error it is not a children of an template element', () => {
    expect(
      newSpecPage({
        components: [AtomicFieldCondition],
        html: '<atomic-field-condition></atomic-field-condition>',
      })
    ).rejects.toBeTruthy();
  });
});

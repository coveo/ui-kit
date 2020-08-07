import {newSpecPage} from '@stencil/core/testing';
import {AtomicFieldCondition} from './atomic-field-condition';
import {AtomicResultList} from '../../atomic-result-list/atomic-result-list';
import {AtomicResultTemplate} from '../../atomic-result-template/atomic-result-template';

describe('atomic-field-condition', () => {
  it('renders correctly when it is a children of an AtomicResultTemplate component', async () => {
    const page = await newSpecPage({
      components: [
        AtomicResultList,
        AtomicResultTemplate,
        AtomicFieldCondition,
      ],
      html: `<atomic-result-list>
        <atomic-result-template>
          <atomic-field-condition></atomic-field-condition>
        </atomic-result-template>
      </atomic-result-list>`,
    });

    expect(page.root).toBeTruthy();
  });

  it('throws an error it is not a children of an AtomicResultTemplate component', () => {
    expect(
      newSpecPage({
        components: [AtomicFieldCondition],
        html: '<atomic-field-condition></atomic-field-condition>',
      })
    ).rejects.toEqual(
      new Error(
        'The "atomic-field-condition" component has to be the child of an "atomic-result-template" component.'
      )
    );
  });

  it('should return all used fields', async () => {
    const page = await newSpecPage({
      components: [
        AtomicResultList,
        AtomicResultTemplate,
        AtomicFieldCondition,
      ],
      html: `<atomic-result-list>
        <atomic-result-template>
          <atomic-field-condition if-defined="test1,test2" must-match-test3="bidon" must-not-match-test4="bidon"></atomic-field-condition>
        </atomic-result-template>
      </atomic-result-list>`,
    });

    const component = page.doc.querySelector('atomic-field-condition')!;
    const fields = await component.getFields();
    expect(fields).toEqual(['test1', 'test2', 'test3', 'test4']);
  });
});

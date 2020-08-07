import {newSpecPage} from '@stencil/core/testing';
import {AtomicResultTemplate} from './atomic-result-template';
import {AtomicResultList} from '../atomic-result-list/atomic-result-list';

describe('atomic-result-template', () => {
  it('renders correctly when it is a children of an AtomicResultList component', async () => {
    const page = await newSpecPage({
      components: [AtomicResultList, AtomicResultTemplate],
      html:
        '<atomic-result-list><atomic-result-template></atomic-result-template></atomic-result-list>',
    });

    expect(page.root).toBeTruthy();
  });

  it('throws an error when it is not a children of an AtomicResultList component', () => {
    expect(
      newSpecPage({
        components: [AtomicResultTemplate],
        html: '<atomic-result-template></atomic-result-template>',
      })
    ).rejects.toEqual(
      new Error(
        'The "atomic-result-template" component has to be the child of an "atomic-result-list" component.'
      )
    );
  });

  it('should return all used fields', async () => {
    const page = await newSpecPage({
      components: [AtomicResultList, AtomicResultTemplate],
      html: `<atomic-result-list>
        <atomic-result-template fields-to-include="test1,test2" must-match-test3="bidon" must-not-match-test4="bidon"></atomic-result-template>
      </atomic-result-list>`,
    });

    const component = page.doc.querySelector('atomic-result-template')!;
    const fields = await component.getFields();
    expect(fields).toEqual(['test1', 'test2', 'test3', 'test4']);
  });

  it('should return all conditions', async () => {
    const page = await newSpecPage({
      components: [AtomicResultList, AtomicResultTemplate],
      html: `<atomic-result-list>
        <atomic-result-template must-match-test3="bidon" must-not-match-test4="bidon"></atomic-result-template>
      </atomic-result-list>`,
    });

    const component = page.doc.querySelector('atomic-result-template')!;
    component.conditions = [() => true];
    const conditions = await component.getConditions()!;
    expect(conditions.length).toBe(3);
  });
});

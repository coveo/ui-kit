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
    ).rejects.toBeTruthy();
  });

  describe('methods', () => {
    let component: HTMLAtomicResultTemplateElement;
    beforeEach(async () => {
      const page = await newSpecPage({
        components: [AtomicResultList, AtomicResultTemplate],
        html: `<atomic-result-list>
          <atomic-result-template must-match-test1="bidon" must-not-match-test2="bidon">
            <template></template>
          </atomic-result-template>
        </atomic-result-list>`,
      });

      component = page.doc.querySelector('atomic-result-template')!;
    });

    it('should return template with all used fields', async () => {
      const template = await component.getTemplate();
      expect(template!.fields).toEqual(['test1', 'test2']);
    });

    it('should return template with all conditions', async () => {
      component.conditions = [() => true];
      const template = await component.getTemplate()!;
      expect(template!.conditions.length).toBe(3);
    });
  });
});

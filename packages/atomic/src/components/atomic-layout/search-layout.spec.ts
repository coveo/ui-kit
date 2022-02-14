import {buildSearchLayout} from './search-layout';
import {newSpecPage} from '@stencil/core/testing';
import {AtomicLayoutSection} from '../atomic-layout-section/atomic-layout-section';
import {AtomicLayout} from './atomic-layout';

describe('Search Layout', () => {
  describe('#buildSearchLayout', () => {
    async function getSearchLayout(html: string) {
      const page = await newSpecPage({
        components: [AtomicLayoutSection, AtomicLayout],
        html,
      });
      return buildSearchLayout(
        page.body.querySelector('atomic-layout')!,
        '1024px'
      );
    }

    it(`when the atomic-layout component is empty
    should match snapshot`, async () => {
      const result = await getSearchLayout(
        '<atomic-layout id="abc" layout="search"></atomic-layout>'
      );
      expect(result).toMatchSnapshot();
    });

    it(`when the atomic-layout component contains a main & facets sections
    should match snapshot`, async () => {
      const result =
        await getSearchLayout(`<atomic-layout id="abc" layout="search">
            <atomic-layout-section section="facets" min-width="200px" max-width="300px"></atomic-layout-section>
            <atomic-layout-section section="main" min-width="1000px" max-width="1200px"></atomic-layout-section>
        </atomic-layout>`);
      expect(result).toMatchSnapshot();
    });

    it(`when the atomic-layout component contains a status section which contains a atomic-refine-toggle component
    should match snapshot`, async () => {
      const result =
        await getSearchLayout(`<atomic-layout id="abc" layout="search">
            <atomic-layout-section section="status">
                <atomic-refine-toggle></atomic-refine-toggle>
            </atomic-layout-section>
        </atomic-layout>`);
      expect(result).toMatchSnapshot();
    });
  });
});

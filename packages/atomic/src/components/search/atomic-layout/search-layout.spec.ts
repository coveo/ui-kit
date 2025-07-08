import {newSpecPage} from '@stencil/core/testing';
// import {AtomicLayoutSection} from '../../common/atomic-layout-section/atomic-layout-section';
import {AtomicSearchLayout} from './atomic-search-layout';
import {buildSearchLayout} from './search-layout';

describe.skip('Search Layout', () => {
  describe('#buildSearchLayout', () => {
    async function getSearchLayout(html: string) {
      const page = await newSpecPage({
        components: [AtomicSearchLayout],
        html,
      });
      return buildSearchLayout(
        page.body.querySelector('atomic-search-layout')!,
        '1024px'
      );
    }

    it(`when the atomic-search-layout component is empty
    should match snapshot`, async () => {
      const result = await getSearchLayout(
        '<atomic-search-layout id="abc"></atomic-search-layout>'
      );
      expect(result).toMatchSnapshot();
    });

    it(`when the atomic-search-layout component contains a main & facets sections
    should match snapshot`, async () => {
      const result = await getSearchLayout(`<atomic-search-layout id="abc">
            <atomic-layout-section section="facets"></atomic-layout-section>
            <atomic-layout-section section="main"></atomic-layout-section>
        </atomic-search-layout>`);
      expect(result).toMatchSnapshot();
    });

    it(`when the atomic-search-layout has custom breakpoint & min-width, max-width values
    should match snapshot`, async () => {
      const result =
        await getSearchLayout(`<atomic-search-layout id="abc" breakpoint="600px">
            <atomic-layout-section section="facets" min-width="250px" max-width="300px"></atomic-layout-section>
            <atomic-layout-section section="main" min-width="300px" max-width="1200px"></atomic-layout-section>
        </atomic-search-layout>`);
      expect(result).toMatchSnapshot();
    });

    it(`when the atomic-search-layout component contains a status section which contains a atomic-refine-toggle component
    should match snapshot`, async () => {
      const result = await getSearchLayout(`<atomic-search-layout id="abc">
            <atomic-layout-section section="status">
                <atomic-refine-toggle></atomic-refine-toggle>
            </atomic-layout-section>
        </atomic-search-layout>`);
      expect(result).toMatchSnapshot();
    });
  });
});

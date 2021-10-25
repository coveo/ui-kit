import {debounce} from 'lodash';

interface SearchInterface extends HTMLElement {
  initialize: (cfg: {
    accessToken: string;
    organizationId: string;
  }) => Promise<void>;
  executeFirstSearch: () => Promise<void>;
}

export const initializeInterfaceDebounced = (
  renderComponentFunction: () => string
) => {
  return debounce(
    async () => {
      const searchInterface = document.querySelector(
        'atomic-search-interface'
      ) as HTMLElement;
      const clone = searchInterface.cloneNode() as SearchInterface;
      const childComponent = renderComponentFunction();
      clone.innerHTML = childComponent;
      searchInterface.replaceWith(clone);
      await clone.initialize({
        accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
        organizationId: 'searchuisamples',
      });
      clone.executeFirstSearch();
    },
    1000,
    {trailing: true}
  );
};

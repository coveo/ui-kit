import {useParameterManager} from '@/lib/commerce-engine';
import {buildParameterSerializer} from '@coveo/headless-react/ssr-commerce';
import {useLocation} from '@remix-run/react';
import {useEffect, useMemo, useRef} from 'react';

export default function ParameterManager({url}: {url: string | null}) {
  const {state, methods} = useParameterManager();

  const {serialize, deserialize} = buildParameterSerializer();

  const location = useLocation();

  const initialUrl = useMemo(() => new URL(url ?? location.pathname), [url]);
  const previousUrl = useRef(initialUrl.href);

  /**
   * This flag serves to ensure that history navigation between pages does not clear commerce parameters and result in
   * history state loss.
   *
   * When navigating to a new page, the ParameterManager controller is rebuilt with its initial state. Consequently, if
   * we serialize the state parameters and push them to the browser history when navigating back to a page, any commerce
   * parameters in the URL that were not part of the controller's initial state will be lost.
   *
   * By having a "guard" that prevents effect execution when the flag is set to true and sets the flag back to false,
   * we are able to prevent this.
   *
   * For instance, suppose that a user initially navigates to /search?q=test. They then select the next page of results
   * so that the URL becomes /search?q=test&page=1. Then, they navigate to a product page (e.g., /product/123). At this
   * point, if they use their browser history to go back to the search page, the URL will be /search?q=test&page=1, but
   * the ParameterManager controller's state will have been reset to only include the q=test parameter. Thanks to the
   * flag, however, the navigation event will not cause the URL to be updated, but the useSearchParams hook will cause
   * the controller to synchronize its state with the URL, thus preserving the page=1 parameter.
   */
  const flag = useRef(true);

  /**
   * When the URL fragment changes, this effect deserializes it and synchronizes it into the
   * ParameterManager controller's state.
   */
  useEffect(() => {
    if (methods === undefined) {
      return;
    }

    if (flag.current) {
      flag.current = false;
      return;
    }

    const fragment = location.hash.substring(1); // Remove the leading '#'
    const newCommerceParams = deserialize(new URLSearchParams(fragment));

    const newUrl = serialize(newCommerceParams, new URL(previousUrl.current));

    if (newUrl === previousUrl.current) {
      return;
    }

    flag.current = true;
    previousUrl.current = newUrl;
    methods.synchronize(newCommerceParams);
  }, [deserialize, location.hash, methods, serialize]);

  /**
   * When the ParameterManager controller's state changes, this effect serializes it into the URL fragment and pushes the new URL
   * to the browser history.
   * */
  useEffect(() => {
    // Ensures that the effect only executes if the controller is hydrated, so that it plays well with the other effect.
    if (methods === undefined) {
      return;
    }

    if (flag.current) {
      flag.current = false;
      return;
    }

    const newUrl = serialize(state.parameters, new URL(previousUrl.current));
    const newFragment = `#${new URL(newUrl).searchParams.toString()}`;

    if (previousUrl.current === newUrl) {
      return;
    }

    flag.current = true;
    previousUrl.current = newUrl;
    history.pushState(null, document.title, newFragment);
  }, [methods, serialize, state.parameters]);

  return null;
}

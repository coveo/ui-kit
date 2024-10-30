'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import {
  standaloneEngineDefinition,
  StandaloneHydratedState,
  StandaloneStaticState,
} from '../_lib/commerce-engine';

export default function NavBar({
  staticState,
}: {
  staticState: StandaloneStaticState;
}) {
  const [hydratedState, setHydratedState] = useState<
    StandaloneHydratedState | undefined
  >(undefined);

  useEffect(() => {
    standaloneEngineDefinition
      .hydrateStaticState({
        searchAction: staticState.searchAction,
      })
      .then(({engine, controllers}) => {
        setHydratedState({engine, controllers});
      });
  }, [staticState]);

  const [cartState, setCartState] = useState(
    staticState.controllers.cart.state
  );

  useEffect(
    () =>
      hydratedState?.controllers.cart?.subscribe(() =>
        setCartState({...hydratedState?.controllers.cart.state})
      ),
    [hydratedState?.controllers.cart]
  );

  return (
    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
      TODO - The cartState Here should look at local storage instead
      <Link href={'/search'}>Search Page</Link>
      <Link href={'/listing'}>Listing Page</Link>
      <Link href={'/recommendation'}>Recommendations</Link>
      <Link href={'/cart'}>Cart ({cartState.items.length})</Link>
    </div>
  );
}

//Cart nav bar should use cookie or local storage

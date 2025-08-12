// biome-ignore lint/correctness/noUnusedImports: <>
import {type FunctionalComponent, h} from '@stencil/core';
import {href} from 'stencil-router-v2';

export const homePath = '/';
export const searchPath = '/search';

export const Header: FunctionalComponent = (_, children) => {
  return (
    <header>
      <nav>
        <a id="home" {...href(homePath)}>
          Home
        </a>
        <a id="search" {...href(searchPath)}>
          Search
        </a>
        {children}
      </nav>
    </header>
  );
};

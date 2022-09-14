import {FunctionalComponent, h} from '@stencil/core';
import {href} from 'stencil-router-v2';

export const Header: FunctionalComponent = (_, children) => {
  return (
    <header>
      <nav>
        <a {...href('/')}>Home</a>
        <a {...href('/search')}>Search</a>
        {children}
      </nav>
    </header>
  );
};

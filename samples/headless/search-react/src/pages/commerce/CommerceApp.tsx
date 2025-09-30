import {NavLink, Outlet} from 'react-router';
import {Section} from '../../layout/section';

export function CommerceApp() {
  const activeNavLink: React.CSSProperties = {color: 'red'};

  return (
    <Section title="commerce">
      <nav>
        <button>
          <NavLink
            end
            to="/commerce/search"
            style={({isActive}) => (isActive ? activeNavLink : {})}
          >
            Search
          </NavLink>
        </button>
        <button>
          <NavLink
            end
            to="/commerce/product-listing"
            style={({isActive}) => (isActive ? activeNavLink : {})}
          >
            Product Listing
          </NavLink>
        </button>
        <button>
          <NavLink
            end
            to="/commerce/recommendations"
            style={({isActive}) => (isActive ? activeNavLink : {})}
          >
            Recommendations
          </NavLink>
        </button>
      </nav>
      <Outlet />
    </Section>
  );
}

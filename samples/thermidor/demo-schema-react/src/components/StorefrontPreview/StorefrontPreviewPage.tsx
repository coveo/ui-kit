import {useEffect, useMemo, useRef, useState, type FormEvent} from 'react';
import {buildUnifiedConverseController} from '@coveo/thermidor';
import {A2UIProvider} from '@copilotkit/a2ui-renderer';
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router';
import {createThermidorCatalog} from '../../a2ui/components.js';
import {StateSourceProvider} from '../../a2ui/state-source-context.js';
import {useGenerativeInterface} from '../../context/generative-interface.js';
import {
  PageSessionProvider,
  usePageSession,
  type PageSessionMode,
} from '../../context/page-session.js';
import {
  PreviewSessionProvider,
  usePreviewSession,
  type PreviewProduct,
} from '../../context/preview-session.js';
import {useBuildController} from '../../hooks/use-build-controller.js';
import {findCommerceSurfaceId} from '../../hooks/use-navigation.js';
import {useSuggestions} from '../../hooks/use-suggestions.js';
import {AppShell} from '../AppShell.js';
import {CommerceSearchLayout} from '../CommerceSearchLayout/CommerceSearchLayout.js';
import type {SuggestionItem} from '../SuggestionsDropdown/index.js';
import styles from './StorefrontPreviewPage.module.css';

const catalog = createThermidorCatalog();

const FEATURED_PRODUCTS: PreviewProduct[] = [
  {id: 'surf-wax', name: 'StickyGrip Surf Wax', price: 9.99, badge: 'Best seller'},
  {id: 'surf-leash', name: 'CompLeash Surf Leash', price: 24.99, badge: 'Recommended'},
  {id: 'board-bag', name: 'TravelArmor Board Bag', price: 89.99},
  {id: 'dry-bag', name: 'SealTight Dry Bag', price: 34.99, badge: 'New'},
];

export function StorefrontPreviewPage() {
  return (
    <PreviewSessionProvider>
      <StorefrontPreviewShell />
    </PreviewSessionProvider>
  );
}

function StorefrontPreviewShell() {
  return (
    <div className={styles.preview}>
      <AdminBar />
      <StorefrontTopBar />
      <main className={styles.routeContent}>
        <Routes>
          <Route index element={<Navigate to="home" replace />} />
          <Route
            path="home"
            element={
              <PageRoute surfaceType="homepage">
                <HomePage />
              </PageRoute>
            }
          />
          <Route
            path="search"
            element={
              <PageRoute surfaceType="listing-preview">
                <ListingPreviewPage />
              </PageRoute>
            }
          />
          <Route
            path="listings/:listingId"
            element={
              <PageRoute surfaceType="listing-preview">
                <ListingPreviewPage />
              </PageRoute>
            }
          />
          <Route
            path="products/:productId"
            element={
              <PageRoute surfaceType="product">
                <ProductPage />
              </PageRoute>
            }
          />
          <Route
            path="cart"
            element={
              <PageRoute surfaceType="cart">
                <CartPage />
              </PageRoute>
            }
          />
          <Route
            path="conversation"
            element={
              <PageRoute surfaceType="conversation" mode="agentic">
                <ConversationRoute />
              </PageRoute>
            }
          />
          <Route path="*" element={<Navigate to="home" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function PageRoute({
  children,
  surfaceType,
  mode = 'deterministic',
}: {
  children: React.ReactNode;
  surfaceType: string;
  mode?: PageSessionMode;
}) {
  const location = useLocation();
  return (
    <PageSessionProvider key={location.key} surfaceType={surfaceType} mode={mode}>
      {children}
      <SessionInspector />
    </PageSessionProvider>
  );
}

function AdminBar() {
  return (
    <header className={styles.adminBar}>
      <div className={styles.brandLockup}>
        <span className={styles.adminLogo}>C</span>
        <strong>Barca Sports</strong>
        <span className={styles.muted}>Sports · EN-US · USD</span>
      </div>
      <div className={styles.adminActions}>
        <span className={styles.previewStatus}>
          <span /> Storefront preview
        </span>
        <span className={styles.exitLink}>POC mode</span>
      </div>
    </header>
  );
}

function StorefrontTopBar() {
  const session = usePreviewSession();
  const navigate = useNavigate();
  const [isFocused, setIsFocused] = useState(false);
  const {sections} = useSuggestions({inputValue: session.query, context: 'landing'});

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const query = session.query.trim();
    if (!query) return;
    setIsFocused(false);
    navigate(`/storefront-preview/search?q=${encodeURIComponent(query)}`);
  };

  const selectSuggestion = (item: SuggestionItem, sectionId: string) => {
    session.setQuery(item.label);
    setIsFocused(false);
    if (sectionId === 'conversational') {
      navigate('/storefront-preview/conversation', {state: {initialPrompt: item.label}});
    } else {
      navigate(`/storefront-preview/search?q=${encodeURIComponent(item.label)}`);
    }
  };

  return (
    <nav className={styles.storefrontBar} aria-label="Storefront preview navigation">
      <NavLink
        className={styles.storeLogo}
        to="/storefront-preview/home"
        aria-label="Barca Sports home"
      >
        BARCA
      </NavLink>
      <NavLink
        className={({isActive}) => `${styles.navLink} ${isActive ? styles.activeNav : ''}`}
        to="/storefront-preview/listings/kayaks"
      >
        Shop kayaks
      </NavLink>
      <form className={styles.searchForm} onSubmit={submitSearch}>
        <span className={styles.searchIcon} aria-hidden="true">
          ⌕
        </span>
        <input
          aria-label="Search the storefront"
          value={session.query}
          onChange={(event) => session.setQuery(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onClick={() => setIsFocused(true)}
          onBlur={() => window.setTimeout(() => setIsFocused(false), 150)}
          placeholder="Search products or ask an agent..."
        />
        {isFocused && (
          <div
            className={styles.searchPopover}
            role="listbox"
            aria-label="Search and conversation suggestions"
          >
            {sections.map((section) => (
              <section key={section.id}>
                <div className={styles.suggestionHeading}>
                  <span>{section.id === 'conversational' ? '✦' : '⌕'}</span>
                  {section.title}
                </div>
                {section.items.slice(0, section.id === 'conversational' ? 3 : 2).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectSuggestion(item, section.id)}
                  >
                    <span>{item.label}</span>
                    {item.subtitle && <small>{item.subtitle.split(' / ')[0]}</small>}
                  </button>
                ))}
              </section>
            ))}
          </div>
        )}
      </form>
      <button
        className={`${styles.navButton} ${session.simulatedVisitor ? styles.activeNavButton : ''}`}
        type="button"
        onClick={session.toggleVisitorSimulation}
      >
        ◉ <span>{session.simulatedVisitor ? 'Visitor active' : 'Simulate visitor'}</span>
      </button>
      <NavLink
        className={({isActive}) => `${styles.cartLink} ${isActive ? styles.activeNav : ''}`}
        to="/storefront-preview/cart"
      >
        Cart <span>{session.cartCount}</span>
      </NavLink>
    </nav>
  );
}

function HomePage() {
  return (
    <div className={styles.pageBody}>
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>MAKE WAVES</span>
          <h1>Gear for every adventure</h1>
          <p>Discover equipment selected for long days on, in, and around the water.</p>
          <Link className={styles.primaryButton} to="/storefront-preview/listings/kayaks">
            Explore kayaks
          </Link>
        </div>
        <div className={styles.heroArtwork} aria-hidden="true">
          <span>≈</span>
        </div>
      </section>
      <ProductSection
        title="Recommended for you"
        subtitle="Powered by the persistent preview session"
        products={FEATURED_PRODUCTS}
      />
    </div>
  );
}

function ProductSection({
  title,
  subtitle,
  products,
}: {
  title: string;
  subtitle: string;
  products: PreviewProduct[];
}) {
  const preview = usePreviewSession();
  return (
    <section className={styles.productSection}>
      <div className={styles.sectionHeading}>
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <Link to="/storefront-preview/listings/kayaks">View all →</Link>
      </div>
      <div className={styles.productGrid}>
        {products.map((product, index) => (
          <article className={styles.productCard} key={product.id}>
            <Link
              className={styles.productVisual}
              to={`/storefront-preview/products/${product.id}`}
            >
              {product.badge && <span className={styles.productBadge}>{product.badge}</span>}
              <span aria-hidden="true">{['🏄', '〰', '▰', '◒'][index % 4]}</span>
            </Link>
            <div className={styles.productInfo}>
              <small>BARCA SPORTS</small>
              <Link to={`/storefront-preview/products/${product.id}`}>{product.name}</Link>
              <strong>${product.price.toFixed(2)}</strong>
              <button type="button" onClick={() => preview.addToCart(product)}>
                Add to cart
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ListingPreviewPage() {
  const [searchParams] = useSearchParams();
  const {listingId} = useParams();
  const query = searchParams.get('q')?.trim() || listingId || 'kayaks';
  return (
    <section className={styles.listingPage}>
      <div className={styles.listingHeader}>
        <span className={styles.eyebrow}>LISTING PREVIEW</span>
        <h1>{query}</h1>
        <p>
          This page owns a fresh deterministic Thermidor session. The header and cart keep using the
          main preview session.
        </p>
      </div>
      <DeterministicSearch query={query} />
    </section>
  );
}

function DeterministicSearch({query}: {query: string}) {
  const generativeInterface = useGenerativeInterface();
  const [controller, state] = useBuildController(() =>
    buildUnifiedConverseController({interface: generativeInterface})
  );
  const submittedRef = useRef(false);

  useEffect(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    controller.submit({prompt: query});
  }, [controller, query]);

  const surfaceId = useMemo(() => {
    for (let index = state.turns.length - 1; index >= 0; index -= 1) {
      const surface = findCommerceSurfaceId(state.turns[index].agentResponse?.activities);
      if (surface) return surface;
    }
    return null;
  }, [state.turns]);

  const latestTurn = state.turns[state.turns.length - 1];

  if (latestTurn?.status === 'error') {
    return (
      <div className={styles.errorPanel} role="alert">
        <strong>The listing session could not load</strong>
        <p>{latestTurn.error ?? 'The Thermidor request failed without an error message.'}</p>
      </div>
    );
  }

  if (!surfaceId) {
    return (
      <div className={styles.loadingPanel} aria-live="polite">
        <span className={styles.loader} />
        <strong>
          {state.isStreaming
            ? 'Loading the deterministic listing…'
            : 'Preparing the listing preview…'}
        </strong>
        <p>
          Query: “{query}” · turns: {state.turns.length}
          {latestTurn ? ` · ${latestTurn.status}` : ''}
        </p>
      </div>
    );
  }

  return (
    <A2UIProvider catalog={catalog}>
      <StateSourceProvider stateSource={controller}>
        <CommerceSearchLayout surfaceId={surfaceId} embedded />
      </StateSourceProvider>
    </A2UIProvider>
  );
}

function ProductPage() {
  const {productId} = useParams();
  const preview = usePreviewSession();
  const product = FEATURED_PRODUCTS.find((item) => item.id === productId) ?? FEATURED_PRODUCTS[0];
  return (
    <div className={styles.pageBody}>
      <div className={styles.breadcrumbs}>
        <Link to="/storefront-preview/home">Home</Link> /{' '}
        <Link to="/storefront-preview/listings/kayaks">Kayaks</Link> / {product.name}
      </div>
      <section className={styles.productDetail}>
        <div className={styles.productDetailVisual} aria-hidden="true">
          🏄
        </div>
        <div>
          <span className={styles.eyebrow}>BARCA SPORTS</span>
          <h1>{product.name}</h1>
          <div className={styles.rating}>
            ★★★★★ <span>4.8 (124 reviews)</span>
          </div>
          <p className={styles.detailPrice}>${product.price.toFixed(2)}</p>
          <p>Reliable water-sports gear selected for the Storefront Preview proof of concept.</p>
          <button
            className={styles.primaryButton}
            type="button"
            onClick={() => preview.addToCart(product)}
          >
            Add to cart
          </button>
        </div>
      </section>
    </div>
  );
}

function CartPage() {
  const preview = usePreviewSession();
  const subtotal = preview.cart.reduce((total, item) => total + item.price * item.quantity, 0);
  return (
    <div className={styles.narrowPage}>
      <span className={styles.eyebrow}>MAIN SESSION STATE</span>
      <h1>Your cart</h1>
      <p>
        The cart survives page-session changes because it belongs to the persistent preview session.
      </p>
      {preview.cart.length === 0 ? (
        <div className={styles.emptyCart}>
          <span>Bag is empty</span>
          <Link className={styles.primaryButton} to="/storefront-preview/home">
            Find products
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.cartItems}>
            {preview.cart.map((item) => (
              <article key={item.id}>
                <div className={styles.cartThumb}>▰</div>
                <div>
                  <strong>{item.name}</strong>
                  <small>Quantity: {item.quantity}</small>
                </div>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
                <button type="button" onClick={() => preview.removeFromCart(item.id)}>
                  Remove
                </button>
              </article>
            ))}
          </div>
          <div className={styles.cartSummary}>
            <span>Subtotal</span>
            <strong>${subtotal.toFixed(2)}</strong>
          </div>
        </>
      )}
    </div>
  );
}

function ConversationRoute() {
  const location = useLocation();
  const initialPrompt = (location.state as {initialPrompt?: string} | null)?.initialPrompt;
  return (
    <div className={styles.conversationPage}>
      <AppShell initialPrompt={initialPrompt} />
    </div>
  );
}

function SessionInspector() {
  const main = usePreviewSession();
  const page = usePageSession();
  const shortId = (id: string) => id.slice(-8);
  return (
    <aside className={styles.sessionInspector} aria-label="POC session inspector">
      <strong>POC sessions</strong>
      <span>Main · {shortId(main.interfaceId)}</span>
      <span>Page · {shortId(page.interfaceId)}</span>
      <em>
        {page.surfaceType} · {page.mode}
      </em>
    </aside>
  );
}

'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';

const tabs = [
  {href: '/search', label: 'Search'},
  {href: '/surf-accessories', label: 'Surf Accessories'},
  {href: '/paddleboards', label: 'Paddleboards'},
  {href: '/toys', label: 'Toys'},
  {href: '/cart', label: 'Cart'},
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="Header">
      <div className="HeaderBrand">
        {/* Using a plain <img> keeps the SVG logo simple and un-optimized. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="HeaderLogo" src="/coveo-logo.svg" alt="Coveo" />
        <span className="AppTitle">Commerce SSR · Next.js</span>
      </div>
      <nav className="Tabs" aria-label="Primary">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={isActive ? 'Tab TabActive' : 'Tab'}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

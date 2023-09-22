import Link from 'next/link';

export default function Home() {
  return (
    <ul>
      <li>
        <Link href={'/generic'}>Framework agnostic example</Link>
      </li>
      <li>
        <Link href={'/react'}>React example</Link>
      </li>
      <li>
        <Link href={'/product-recommendation/react'}>
          React product recommendation example
        </Link>
      </li>
    </ul>
  );
}

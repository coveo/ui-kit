import Link from 'next/link';

export default function Home() {
  return (
    <ul>
      <li>
        <Link href={'/listing'}>Surfboard Listing Page</Link>
      </li>
      <li>
        <Link href={'/search'}>Search Page</Link>
      </li>
    </ul>
  );
}

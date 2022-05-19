import dynamic from 'next/dynamic';

const DynamicSearchPage = dynamic(() => import('./search-page'), {
  ssr: false,
});

export default <DynamicSearchPage />;

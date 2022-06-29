import dynamic from 'next/dynamic';

const DynamicSearchPage = dynamic(() => import('../components/search-page'), {
  ssr: false,
});

export default DynamicSearchPage;

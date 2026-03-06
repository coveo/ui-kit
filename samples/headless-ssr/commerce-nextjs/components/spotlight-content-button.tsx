import type {
  ProductList,
  SpotlightContent,
} from '@coveo/headless-react/ssr-commerce';

interface SpotlightContentButtonProps {
  methods: Omit<ProductList, 'state' | 'subscribe'> | undefined;
  spotlightContent: SpotlightContent;
}

export default function SpotlightContentButton({
  methods,
  spotlightContent,
}: SpotlightContentButtonProps) {
  const handleClick = () => {
    methods
      ?.interactiveSpotlightContent({options: {spotlightContent}})
      .select();
    window.location.href = spotlightContent.clickUri;
  };

  return (
    <button
      type="button"
      disabled={!methods}
      onClick={handleClick}
      style={{border: '2px solid gold', padding: '1rem'}}
    >
      <img
        src={spotlightContent.desktopImage}
        alt={spotlightContent.name || 'Spotlight content'}
        style={{maxWidth: '100%', height: 'auto'}}
      />
      {spotlightContent.name && <h3>{spotlightContent.name}</h3>}
      {spotlightContent.description && <p>{spotlightContent.description}</p>}
    </button>
  );
}

import type {
  ProductList,
  SpotlightContent,
} from '@coveo/headless-react/ssr-commerce-next';

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
      style={{border: '2px solid gold', maxWidth: '200px'}}
    >
      <img
        src={spotlightContent.desktopImage}
        alt={
          spotlightContent.altText ||
          spotlightContent.name ||
          'Spotlight content'
        }
        style={{height: 'auto', maxHeight: '120px', objectFit: 'contain'}}
      />
      {spotlightContent.name && (
        <h4 style={{color: spotlightContent.nameFontColor}}>
          {spotlightContent.name}
        </h4>
      )}
      {spotlightContent.description && (
        <span style={{color: spotlightContent.descriptionFontColor}}>
          {spotlightContent.description}
        </span>
      )}
    </button>
  );
}

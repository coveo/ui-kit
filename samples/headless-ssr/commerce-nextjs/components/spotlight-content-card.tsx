import type {ProductList, SpotlightContent} from '@coveo/headless-react/ssr-commerce';

interface SpotlightContentCardProps {
  methods: Omit<ProductList, 'state' | 'subscribe'> | undefined;
  spotlightContent: SpotlightContent;
}

/**
 * Renders a spotlight content item. Spotlight content is merchandising material
 * (banners, promotions) that the Commerce API can interleave with products when
 * the request opts into `results`.
 */
export default function SpotlightContentCard({
  methods,
  spotlightContent,
}: SpotlightContentCardProps) {
  const onSpotlightClick = () => {
    methods?.interactiveSpotlightContent({options: {spotlightContent}}).select();
    window.open(spotlightContent.clickUri, '_blank', 'noopener,noreferrer');
  };

  return (
    <button type="button" className="ProductLink" disabled={!methods} onClick={onSpotlightClick}>
      <img
        className="ProductImage"
        src={spotlightContent.desktopImage}
        alt={spotlightContent.altText ?? spotlightContent.name ?? ''}
        width={150}
        height={150}
      />
      {spotlightContent.name && (
        <span className="ProductName" style={{color: spotlightContent.nameFontColor}}>
          {spotlightContent.name}
        </span>
      )}
      {spotlightContent.description && (
        <span className="ProductDescription" style={{color: spotlightContent.descriptionFontColor}}>
          {spotlightContent.description}
        </span>
      )}
    </button>
  );
}

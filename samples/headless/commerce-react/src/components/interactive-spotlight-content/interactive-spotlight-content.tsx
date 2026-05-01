import type {
  InteractiveSpotlightContent as HeadlessInteractiveSpotlightContent,
  SpotlightContent,
} from '@coveo/headless/commerce';

interface IInteractiveSpotlightContentProps {
  spotlightContent: SpotlightContent;
  controller: HeadlessInteractiveSpotlightContent;
}

export default function InteractiveSpotlightContent(
  props: IInteractiveSpotlightContentProps
) {
  const {spotlightContent, controller} = props;

  const clickSpotlightContent = () => {
    controller.select();
    window.open(spotlightContent.clickUri, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="InteractiveSpotlightContent">
      <button
        type="button"
        className="SpotlightContentLink"
        onClick={clickSpotlightContent}
        style={{color: spotlightContent.nameFontColor}}
      >
        {spotlightContent.name ?? 'Spotlight Content name not available'}
      </button>
      <div className="SpotlightContentImageWrapper">
        <img
          src={spotlightContent.desktopImage}
          alt={
            spotlightContent.altText ||
            spotlightContent.name ||
            'Spotlight content'
          }
          height={100}
        />
      </div>
      {spotlightContent.description ? (
        <div className="SpotlightContentDescription">
          <p style={{color: spotlightContent.descriptionFontColor}}>
            {spotlightContent.description}
          </p>
        </div>
      ) : null}
      <hr />
    </div>
  );
}

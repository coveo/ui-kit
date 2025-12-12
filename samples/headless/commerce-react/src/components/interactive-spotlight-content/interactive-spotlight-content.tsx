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

  const handleClick = () => {
    controller.select();
    window.open(spotlightContent.clickUri, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="InteractiveSpotlightContent">
      <button
        type="button"
        className="SpotlightContentLink"
        onClick={handleClick}
      >
        {spotlightContent.name}
      </button>
      <div className="SpotlightContentImageWrapper">
        <img
          src={spotlightContent.desktopImage}
          alt={spotlightContent.name}
          height={100}
        />
      </div>
      <div className="SpotlightContentDescription">
        <p>{spotlightContent.description}</p>
      </div>
      <hr />
    </div>
  );
}

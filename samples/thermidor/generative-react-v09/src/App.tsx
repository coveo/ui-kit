import {ConversePage} from '@samples/thermidor-shared-react/src/components/ConversePage/ConversePage.js';
import {SurfaceRenderer} from './a2ui/SurfaceRenderer/SurfaceRenderer.js';
import {converseController} from './generative-setup.js';
import appStyles from '@samples/thermidor-shared-react/src/App.module.css';

export default function App() {
  return (
    <div className={appStyles.root}>
      <ConversePage
        controller={converseController}
        SurfaceRenderer={SurfaceRenderer}
      />
    </div>
  );
}

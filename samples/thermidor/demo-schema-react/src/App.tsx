import {HashRouter, Navigate, Route, Routes} from 'react-router';
import {EngineProvider} from './context/engine.js';
import {StorefrontPreviewPage} from './components/StorefrontPreview/StorefrontPreviewPage.js';

export default function App() {
  return (
    <EngineProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/storefront-preview/home" replace />} />
          <Route path="/storefront-preview/*" element={<StorefrontPreviewPage />} />
          <Route path="*" element={<Navigate to="/storefront-preview/home" replace />} />
        </Routes>
      </HashRouter>
    </EngineProvider>
  );
}

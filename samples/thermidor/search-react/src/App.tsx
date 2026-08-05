import {BrowserRouter, Routes, Route} from 'react-router';
import {EngineProvider} from './context/engine.js';
import {RootLayout} from './layouts/RootLayout.js';
import {HomePage} from './pages/HomePage.js';
import {SearchPage} from './pages/SearchPage.js';

export default function App() {
  return (
    <BrowserRouter>
      <EngineProvider>
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
          </Route>
        </Routes>
      </EngineProvider>
    </BrowserRouter>
  );
}

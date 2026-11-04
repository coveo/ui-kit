import {StorefrontSessionProvider} from './session/storefront-session.js';
import {StorefrontApp} from './StorefrontApp.js';

export default function App() {
  return (
    <StorefrontSessionProvider>
      <StorefrontApp />
    </StorefrontSessionProvider>
  );
}

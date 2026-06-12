/**
 * TiendaTech — AppRoot.jsx
 * Puente entre CartContext y UserProvider.
 *
 * Ubicación: /client/src/AppRoot.jsx
 */

import { useCart }      from './context/CartContext';
import { UserProvider } from './context/UserContext';
import App              from './App';

/**
 * AppRoot se renderiza DENTRO de CartProvider (en main.jsx),
 * por lo que puede llamar useCart() sin problema.
 * Pasa los callbacks al UserProvider para el merge/clear del carrito.
 */
export default function AppRoot() {
  const { hydrateCart, registerSyncFn } = useCart();

  return (
    <UserProvider
      onLoginCartMerge={hydrateCart}
      onLogoutClearCart={() => hydrateCart([])}
      onRegisterSync={registerSyncFn}
    >
      <App />
    </UserProvider>
  );
}
/**
 * TiendaTech — main.jsx
 * Árbol de providers. CartProvider envuelve UserProvider para que
 * UserProvider pueda recibir callbacks de hidratación del carrito.
 *
 * Ubicación: /client/src/main.jsx
 */

import { StrictMode }            from 'react';
import { createRoot }            from 'react-dom/client';
import { BrowserRouter }         from 'react-router-dom';
import { GoogleOAuthProvider }   from '@react-oauth/google';
import { CartProvider }          from './context/CartContext';
import { UserProvider }          from './context/UserContext';
import { AuthProvider }          from './context/AuthContext';
import AppRoot                   from './AppRoot';
import './index.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        {/*
          CartProvider va primero — sus funciones (hydrateCart, registerSyncFn)
          se pasan como props a UserProvider mediante AppRoot.
        */}
        <CartProvider>
          <AuthProvider>
            <AppRoot />
          </AuthProvider>
        </CartProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </StrictMode>
);
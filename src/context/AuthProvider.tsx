import React, { useEffect, useMemo, useState } from 'react';
import keycloak from '../auth/Keycloak';
import type { AuthContextType } from './authContext';
import { AuthContext } from './authContext';

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    keycloak
      .init({
        onLoad: 'login-required', // fuerza login antes de ver la app
        checkLoginIframe: false, // evita sondeo cada 5s en dev
        pkceMethod: 'S256',
      })
  .then((auth: boolean) => {
        if (!isMounted) return;
        setAuthenticated(Boolean(auth));
        setToken(keycloak.token);
        setInitialized(true);

        // refresco del token antes de expirar
        const refresh = async () => {
          try {
            const refreshed = await keycloak.updateToken(60);
            if (refreshed) {
              setToken(keycloak.token);
            }
          } catch {
            // si falla el refresh, volvemos a login
            keycloak.login();
          }
        };

        const interval = window.setInterval(refresh, 30_000);
        return () => window.clearInterval(interval);
      })
      .catch(() => {
        if (!isMounted) return;
        setInitialized(true);
        setAuthenticated(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const value: AuthContextType = useMemo(
    () => ({
      initialized,
      authenticated,
      token,
      login: () => keycloak.login(),
      logout: () => keycloak.logout(),
      user: keycloak.tokenParsed as Record<string, unknown> | undefined,
    }),
    [initialized, authenticated, token]
  );

  // Gate de autenticación: no renderiza la app hasta estar logueado
  if (!initialized) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <p>Inicializando autenticación…</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <p>No autenticado. Redirigiendo al login…</p>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
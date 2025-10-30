import Keycloak from 'keycloak-js';

// Lee configuración desde variables de entorno de Vite
const url = import.meta.env.VITE_KEYCLOAK_URL as string | undefined;
const realm = import.meta.env.VITE_KEYCLOAK_REALM as string | undefined;
const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID as string | undefined;

if (!url || !realm || !clientId) {
  // Advertimos en desarrollo si faltan variables; en producción esto debe estar configurado
  // No lanzamos error para no romper el build, pero la app no podrá autenticarse.
  console.warn('[Keycloak] Variables VITE_KEYCLOAK_URL / VITE_KEYCLOAK_REALM / VITE_KEYCLOAK_CLIENT_ID no configuradas');
}

const keycloak = new Keycloak({
  url: url || 'http://localhost:8080',
  realm: realm || 'myrealm',
  clientId: clientId || 'todo-frontend',
});

export default keycloak;
# ==========================================
# STAGE 1: BUILD - Construcción de la aplicación React
# ==========================================
# Utilizamos Node.js Alpine para una imagen ligera
FROM node:20-alpine AS builder

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos los archivos de dependencias primero (para aprovechar la cache de Docker)
COPY package*.json ./

# Instalamos dependencias
RUN npm install --production=false

# Copiamos todo el código fuente
COPY . .

# ARGs para variables de Keycloak y API que Vite necesita en build time
ARG VITE_KEYCLOAK_URL
ARG VITE_KEYCLOAK_REALM
ARG VITE_KEYCLOAK_CLIENT_ID
ARG VITE_API_BASE_URL

# Las convertimos en ENVs para que Vite las vea durante el build
ENV VITE_KEYCLOAK_URL=${VITE_KEYCLOAK_URL}
ENV VITE_KEYCLOAK_REALM=${VITE_KEYCLOAK_REALM}
ENV VITE_KEYCLOAK_CLIENT_ID=${VITE_KEYCLOAK_CLIENT_ID}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Construimos la aplicación para producción
# Vite generará los archivos optimizados en /app/dist con las variables horneadas
RUN npm run build

# ==========================================
# STAGE 2: PRODUCTION - Servir con Nginx
# ==========================================
# Utilizamos Nginx Alpine para una imagen final mínima
FROM nginx:alpine

# Copiamos los archivos construidos desde el stage anterior
# Nginx sirve archivos estáticos desde /usr/share/nginx/html por defecto
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiamos una configuración personalizada de Nginx (opcional pero recomendado para SPAs)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto 80
EXPOSE 80

# Nginx se inicia automáticamente con la imagen base
# El comando por defecto es: CMD ["nginx", "-g", "daemon off;"]
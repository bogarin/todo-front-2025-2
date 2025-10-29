#!/bin/bash

# ==========================================
# Script de Prueba de Seguridad de Nginx
# ==========================================
# Verifica que archivos sensibles estén bloqueados

echo "🔐 Iniciando pruebas de seguridad de Nginx..."
echo "================================================"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URL base del servidor
BASE_URL="${1:-http://localhost:8080}"

echo "🎯 Probando contra: $BASE_URL"
echo ""

# Contador de pruebas
PASSED=0
FAILED=0

# Función para probar un archivo
test_blocked() {
    local path=$1
    local description=$2
    
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$path")
    
    if [ "$STATUS" = "404" ] || [ "$STATUS" = "403" ]; then
        echo -e "${GREEN}✅ PASS${NC} - $description ($path) - Status: $STATUS"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} - $description ($path) - Status: $STATUS ⚠️ ACCESIBLE!"
        ((FAILED++))
    fi
}

# Función para probar un archivo permitido
test_allowed() {
    local path=$1
    local description=$2
    
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$path")
    
    if [ "$STATUS" = "200" ]; then
        echo -e "${GREEN}✅ PASS${NC} - $description ($path) - Status: $STATUS"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} - $description ($path) - Status: $STATUS ⚠️ NO ACCESIBLE!"
        ((FAILED++))
    fi
}

# ==========================================
# ARCHIVOS QUE DEBEN ESTAR BLOQUEADOS (404/403)
# ==========================================

echo "📋 Probando archivos que DEBEN estar bloqueados..."
echo "---------------------------------------------------"

# Archivos de entorno
test_blocked "/.env" "Archivo .env"
test_blocked "/.env.local" "Archivo .env.local"
test_blocked "/.env.development" "Archivo .env.development"
test_blocked "/.env.production" "Archivo .env.production"

# Archivos de configuración
test_blocked "/package.json" "package.json"
test_blocked "/package-lock.json" "package-lock.json"
test_blocked "/tsconfig.json" "tsconfig.json"
test_blocked "/vite.config.ts" "vite.config.ts"
test_blocked "/docker-compose.yml" "docker-compose.yml"

# Archivos Git
test_blocked "/.git/config" ".git/config"
test_blocked "/.gitignore" ".gitignore"

# Archivos ocultos
test_blocked "/.htaccess" ".htaccess"
test_blocked "/.DS_Store" ".DS_Store"

# Archivos de código fuente
test_blocked "/src/main.tsx" "src/main.tsx"
test_blocked "/src/App.tsx" "src/App.tsx"
test_blocked "/src/index.css" "src/index.css"

# Directorios
test_blocked "/node_modules/" "node_modules/"
test_blocked "/node_modules/react/index.js" "node_modules/react/index.js"
test_blocked "/src/" "src/"
test_blocked "/public/" "public/"

# Archivos de documentación
test_blocked "/README.md" "README.md"
test_blocked "/Dockerfile" "Dockerfile"
test_blocked "/LICENSE" "LICENSE"

# Source maps
test_blocked "/assets/index.js.map" "Source map"

echo ""
echo "================================================"
echo ""

# ==========================================
# ARCHIVOS QUE DEBEN ESTAR PERMITIDOS (200)
# ==========================================

echo "📋 Probando archivos que DEBEN estar permitidos..."
echo "---------------------------------------------------"

test_allowed "/" "Página principal (index.html)"
test_allowed "/health" "Health check endpoint"

# Nota: Los archivos de assets tienen hash dinámico, 
# por lo que no podemos probarlos directamente sin conocer el hash

echo ""
echo "================================================"
echo ""

# ==========================================
# RESUMEN
# ==========================================

TOTAL=$((PASSED + FAILED))

echo "📊 RESUMEN DE PRUEBAS"
echo "================================================"
echo -e "Total de pruebas: $TOTAL"
echo -e "${GREEN}Pruebas exitosas: $PASSED${NC}"
echo -e "${RED}Pruebas fallidas: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡Todas las pruebas pasaron! La configuración es segura.${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Algunas pruebas fallaron. Revisa la configuración de Nginx.${NC}"
    exit 1
fi

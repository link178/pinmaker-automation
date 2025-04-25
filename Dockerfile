# Base image oficial con Node.js y Chromium ya preinstalado
FROM ghcr.io/puppeteer/puppeteer:latest

# Crear directorio app
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de archivos
COPY . .

# Exponer puerto (Railway lo redirige internamente)
EXPOSE 3000

# Comando de arranque
CMD ["npm", "start"]

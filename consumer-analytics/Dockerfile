# Imagen base de Node.js
FROM node:18

# Crear directorio de la aplicación
WORKDIR /usr/src/app

# Copiar archivos necesarios
COPY package*.json ./
COPY analytics.js ./
COPY .env ./
COPY public ./public

# Instalar dependencias
RUN npm install

# Exponer el puerto
EXPOSE 3003

# Comando para ejecutar el consumer
CMD ["node", "analytics.js"]
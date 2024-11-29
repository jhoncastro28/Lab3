# Imagen base de Node.js
FROM node:18

# Crear el directorio de la aplicación
WORKDIR /usr/src/app

# Copiar archivos necesarios
COPY package*.json ./
COPY producer.js ./
COPY .env ./

# Instalar dependencias
RUN npm install

# Exponer el puerto
EXPOSE 3002

# Comando para ejecutar el producer
CMD ["node", "producer.js"]
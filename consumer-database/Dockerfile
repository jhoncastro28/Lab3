# Imagen base de Node.js
FROM node:18

# Crear el directorio de la aplicación
WORKDIR /usr/src/app

# Copiar los archivos necesarios
COPY package*.json ./
COPY database.js ./
COPY .env ./
COPY models ./models

# Instalar las dependencias
RUN npm install

# Exponer el puerto (si es necesario)
EXPOSE 3004

# Comando para ejecutar el consumer
CMD ["node", "database.js"]
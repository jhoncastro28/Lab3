# Usa una imagen base de Node.js
FROM node:16-alpine

# Establece el directorio de trabajo
WORKDIR /usr/src/app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de los archivos de tu proyecto (incluyendo 'public')
COPY . .

# Copia específicamente la carpeta 'public' a la ruta deseada en el contenedor
COPY public /usr/src/app/public

# Expone el puerto del servidor
EXPOSE 3003

# Comando para iniciar el servicio
CMD ["node", "analytics.js"]
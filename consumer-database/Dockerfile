# Usa una imagen base de Node.js
FROM node:16-alpine

# Establece el directorio de trabajo
WORKDIR /usr/src/app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de los archivos
COPY . .

# Expone el puerto del servidor
EXPOSE 3004

# Comando para iniciar el consumidor
CMD ["node", "database.js"]
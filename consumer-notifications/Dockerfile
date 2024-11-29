# Imagen base de Python
FROM python:3.9-slim

# Crear el directorio de la aplicación
WORKDIR /app

# Instalar las dependencias necesarias
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copiar los archivos de la aplicación
COPY notifications.py ./
COPY .env ./

# Comando para ejecutar el consumer
CMD ["python", "notifications.py"]
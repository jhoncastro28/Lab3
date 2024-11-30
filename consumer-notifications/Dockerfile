# Usa una imagen base de Python
FROM python:3.9-slim

# Establece el directorio de trabajo
WORKDIR /usr/src/app

# Instala dependencias del sistema para Kafka y SMTP
RUN apt-get update && apt-get install -y \
    libsasl2-dev \
    && rm -rf /var/lib/apt/lists/*

# Copia los archivos de dependencias
COPY requirements.txt .

# Instala las dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copia el resto de los archivos
COPY . .

# Comando para ejecutar el consumidor
CMD ["python", "notifications.py"]
import os
import json
from kafka import KafkaConsumer
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Cargar las variables de entorno
load_dotenv()

# Configuración de Kafka
KAFKA_BROKER = os.getenv("KAFKA_BROKER")
KAFKA_TOPIC = os.getenv("KAFKA_TOPIC")

# Configuración del servidor SMTP
SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL")

def send_email(to_email, movie_title, user_name, timestamp):
    """Enviar un correo electrónico usando SMTP."""
    try:
        # Crear el mensaje de correo
        message = MIMEMultipart()
        message["From"] = SMTP_FROM_EMAIL
        message["To"] = to_email
        message["Subject"] = f"Notificación: {user_name} ha seleccionado una película"

        # Contenido del correo
        body = (
            f"Hola,\n\n"
            f"{user_name} ha seleccionado la película '{movie_title}' el {timestamp}.\n\n"
            "Saludos,\nEquipo de Notificaciones"
        )
        message.attach(MIMEText(body, "plain"))

        # Conexión al servidor SMTP y envío
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(message)
        print(f"Correo enviado a {to_email} sobre la película '{movie_title}'")
    except Exception as e:
        print(f"Error al enviar correo: {e}")

def main():
    """Consumidor de Kafka para notificaciones."""
    print("Conectando al consumidor de Kafka...")
    consumer = KafkaConsumer(
        KAFKA_TOPIC,
        bootstrap_servers=[KAFKA_BROKER],
        auto_offset_reset="earliest",
        group_id="notifications-group",
        value_deserializer=lambda m: json.loads(m.decode("utf-8")),
    )

    print("Conectado al topic. Esperando mensajes...")
    for message in consumer:
        event = message.value
        user = event.get("user")
        movie = event.get("movie")
        timestamp = event.get("timestamp")

        # Verificar si el usuario es menor de edad
        if user and movie and user.get("age") < 18:
            send_email(
                to_email=user.get("parentEmail"),
                movie_title=movie.get("title"),
                user_name=user.get("name"),
                timestamp=timestamp,
            )

if __name__ == "__main__":
    main()
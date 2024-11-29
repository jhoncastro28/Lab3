from kafka import KafkaConsumer
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import json
import os
from dotenv import load_dotenv

# Cargar las variables de entorno
load_dotenv()

KAFKA_BROKER = os.getenv("KAFKA_BROKER")
KAFKA_TOPIC = os.getenv("KAFKA_TOPIC")
EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = int(os.getenv("EMAIL_PORT"))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

# Configurar el consumidor de Kafka
consumer = KafkaConsumer(
    KAFKA_TOPIC,
    bootstrap_servers=KAFKA_BROKER,
    auto_offset_reset="earliest",
    enable_auto_commit=True,
    group_id="notifications-group",
    value_deserializer=lambda x: json.loads(x.decode("utf-8"))
)

def send_email(to_email, subject, body):
    """Enviar un correo electrónico."""
    try:
        msg = MIMEMultipart()
        msg["From"] = EMAIL_USER
        msg["To"] = to_email
        msg["Subject"] = subject

        msg.attach(MIMEText(body, "plain"))

        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            server.sendmail(EMAIL_USER, to_email, msg.as_string())
            print(f"Correo enviado a {to_email}")
    except Exception as e:
        print(f"Error al enviar el correo: {e}")

print("Consumer de notificaciones iniciado...")
for message in consumer:
    event = message.value
    user = event.get("user")
    movie = event.get("movie")

    # Verificar si el usuario es menor de edad
    if user.get("age") < 18:
        parent_email = user.get("parent_email")
        subject = f"Notificación: {user['name']} ha seleccionado una película"
        body = (
            f"Hola,\n\n"
            f"Este es un aviso para informarte que {user['name']} (menor de edad) "
            f"seleccionó la película '{movie['title']}' a las {event.get('timestamp')}.\n\n"
            f"Saludos,\nSistema de Películas"
        )
        send_email(parent_email, subject, body)

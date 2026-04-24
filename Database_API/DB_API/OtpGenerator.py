import redis
import random
from twilio.rest import Client
from dotenv import load_dotenv
import os

load_dotenv()

sid = os.environ["SID"]
auth = os.environ["AUTH"]

client = Client(sid, auth)

red = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)

def generate_otp():
    return str(random.randint(100000, 999999))

def send_sms(otp :str, phone :str):
    message = client.messages.create(
            body=f"""Welcome to HelpHub!
                Your OTP to join as a Provider is: 
                {otp};
                Thankyou for joining us!
            """,
            from_="+18145464049",
            to=f"+91{phone}"
        )

    print("message sent")

import requests
from faker import Faker

fake = Faker()

API_URL = "http://localhost:3030/api/v1/create-account"

for i in range(3, 101):  # Tạo user từ 3 đến 100
    user = {
        "fullName": fake.name(),
        "email": f"user{i}@gmail.com",
        "password": "user2747",
        "phone": fake.numerify("##########"),
        "address": fake.street_address() + " " + fake.city(),
    }

    try:
        response = requests.post(API_URL, json=user)
        if response.status_code in [200, 201]:
            print(f"[{i}] ✅ Created: {user['email']}")
        else:
            print(f"[{i}] ❌ Failed ({response.status_code}): {response.text}")
    except Exception as e:
        print(f"[{i}] ❌ Exception: {e}")

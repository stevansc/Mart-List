import os
import sys

from sqlalchemy.orm import Session
from database import engine, SessionLocal
import models
import schemas
import crud

def seed():
    # Drop items table to apply schema changes cleanly
    print("Dropping existing items table...")
    models.Item.__table__.drop(bind=engine, checkfirst=True)
    
    # Make sure tables are created
    print("Recreating tables...")
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # List of 50 dummy mart items with categories
    dummy_items = [
        {"name": "Indomie Goreng", "category": "Mie & Makanan Instan", "cost": 2500, "selling_price": 3100},
        {"name": "Aqua Botol 600ml", "category": "Minuman", "cost": 2000, "selling_price": 3500},
        {"name": "Chitato Sapi Panggang 68g", "category": "Makanan Ringan", "cost": 8500, "selling_price": 11500},
        {"name": "Teh Pucuk Harum 350ml", "category": "Minuman", "cost": 2800, "selling_price": 4000},
        {"name": "Bimoli Minyak Goreng 2L", "category": "Sembako", "cost": 28000, "selling_price": 34500},
        {"name": "Sari Roti Tawar", "category": "Sembako", "cost": 12000, "selling_price": 16000},
        {"name": "Taro Net Seaweed", "category": "Makanan Ringan", "cost": 4000, "selling_price": 5500},
        {"name": "Ultra Milk Coklat 250ml", "category": "Minuman", "cost": 4500, "selling_price": 6000},
        {"name": "Beras Setra Ramos 5kg", "category": "Sembako", "cost": 65000, "selling_price": 72000},
        {"name": "Indocafe Coffeemix", "category": "Minuman", "cost": 1200, "selling_price": 1500},
        {"name": "Pepsodent White 190g", "category": "Perawatan Tubuh", "cost": 14000, "selling_price": 17500},
        {"name": "Lifebuoy Sabun Cair 450ml", "category": "Perawatan Tubuh", "cost": 20000, "selling_price": 25000},
        {"name": "Sunsilk Shampoo Black Shine 170ml", "category": "Perawatan Tubuh", "cost": 18000, "selling_price": 22000},
        {"name": "Rexona Men Roll On", "category": "Perawatan Tubuh", "cost": 15000, "selling_price": 19500},
        {"name": "Rinso Anti Noda 800g", "category": "Kebutuhan Rumah Tangga", "cost": 19000, "selling_price": 23500},
        {"name": "Sunlight Jeruk Nipis 400ml", "category": "Kebutuhan Rumah Tangga", "cost": 10000, "selling_price": 12500},
        {"name": "Baygon Aerosol 600ml", "category": "Kebutuhan Rumah Tangga", "cost": 30000, "selling_price": 36500},
        {"name": "Molto Pewangi Pakaian 820ml", "category": "Kebutuhan Rumah Tangga", "cost": 22000, "selling_price": 27500},
        {"name": "Kopi Kapal Api Special Mix", "category": "Minuman", "cost": 1100, "selling_price": 1500},
        {"name": "Luwak White Koffie", "category": "Minuman", "cost": 1200, "selling_price": 1600},
        {"name": "Tolak Angin Sido Muncul", "category": "Perawatan Tubuh", "cost": 3000, "selling_price": 4000},
        {"name": "Bear Brand Susu Steril", "category": "Minuman", "cost": 9000, "selling_price": 11000},
        {"name": "Pocari Sweat 500ml", "category": "Minuman", "cost": 6000, "selling_price": 7500},
        {"name": "Coca Cola 1.5L", "category": "Minuman", "cost": 12000, "selling_price": 16000},
        {"name": "Sprite 1.5L", "category": "Minuman", "cost": 12000, "selling_price": 16000},
        {"name": "Fanta Strawberry 1.5L", "category": "Minuman", "cost": 12000, "selling_price": 16000},
        {"name": "Floridina Orange 350ml", "category": "Minuman", "cost": 2500, "selling_price": 3000},
        {"name": "Nutriboost Strawberry", "category": "Minuman", "cost": 6500, "selling_price": 8000},
        {"name": "Good Time Chocochip", "category": "Makanan Ringan", "cost": 5000, "selling_price": 7000},
        {"name": "Oreo Vanilla 133g", "category": "Makanan Ringan", "cost": 7000, "selling_price": 9500},
        {"name": "Silverqueen Cashew 62g", "category": "Makanan Ringan", "cost": 12000, "selling_price": 15500},
        {"name": "Beng Beng Regular", "category": "Makanan Ringan", "cost": 2000, "selling_price": 2500},
        {"name": "Roma Kelapa 300g", "category": "Makanan Ringan", "cost": 8000, "selling_price": 10500},
        {"name": "Qtela Singkong Balado", "category": "Makanan Ringan", "cost": 4500, "selling_price": 6000},
        {"name": "Kacang Garuda Rosta", "category": "Makanan Ringan", "cost": 8500, "selling_price": 11000},
        {"name": "Tic Tac Sapi Panggang", "category": "Makanan Ringan", "cost": 3500, "selling_price": 5000},
        {"name": "Pop Mie Rasa Ayam Bawang", "category": "Mie & Makanan Instan", "cost": 4000, "selling_price": 5500},
        {"name": "Indomie Soto Mie", "category": "Mie & Makanan Instan", "cost": 2400, "selling_price": 3000},
        {"name": "Mie Sedaap Goreng", "category": "Mie & Makanan Instan", "cost": 2500, "selling_price": 3100},
        {"name": "ABC Sambal Asli 340ml", "category": "Sembako", "cost": 12000, "selling_price": 15000},
        {"name": "Bango Kecap Manis 550ml", "category": "Sembako", "cost": 22000, "selling_price": 26500},
        {"name": "Sasa Tepung Bumbu 225g", "category": "Sembako", "cost": 5000, "selling_price": 6500},
        {"name": "Royco Ayam 100g", "category": "Sembako", "cost": 4500, "selling_price": 5500},
        {"name": "Masako Sapi 100g", "category": "Sembako", "cost": 4500, "selling_price": 5500},
        {"name": "Indomilk Kental Manis", "category": "Sembako", "cost": 9000, "selling_price": 11500},
        {"name": "Frisian Flag Susu Kental Manis", "category": "Sembako", "cost": 9500, "selling_price": 12000},
        {"name": "Dancow Fortigro 400g", "category": "Sembako", "cost": 42000, "selling_price": 51000},
        {"name": "Paseo Tissu Soft 250s", "category": "Kebutuhan Rumah Tangga", "cost": 14000, "selling_price": 18000},
        {"name": "Nice Tissu Wajah 900g", "category": "Kebutuhan Rumah Tangga", "cost": 28000, "selling_price": 35000},
        {"name": "Zwitsal Baby Bath 300ml", "category": "Perawatan Tubuh", "cost": 21000, "selling_price": 26500}
    ]
    
    for item_data in dummy_items:
        # Check if exists
        existing = db.query(models.Item).filter(models.Item.name == item_data["name"]).first()
        if not existing:
            item_create = schemas.ItemCreate(**item_data)
            crud.create_item(db=db, item=item_create)
            print(f"Added {item_data['name']} ({item_data['category']})")
        else:
            print(f"Already exists {item_data['name']}")
            
    db.close()
    print("Database seeding completed.")

if __name__ == "__main__":
    seed()

from sqlalchemy import Column, Integer, String, Float
from database import Base

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    category = Column(String, index=True, nullable=False)
    cost = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)
    small_image_url = Column(String, nullable=True)

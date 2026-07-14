from pydantic import BaseModel, Field
from typing import Optional

class ItemBase(BaseModel):
    name: str = Field(..., description="The name of the item", example="Apple")
    category: str = Field(..., description="The category of the item", example="Fruits")
    cost: float = Field(..., description="The cost price of the item", example=0.5)
    selling_price: float = Field(..., description="The selling price of the item", example=1.0)

class ItemCreate(ItemBase):
    pass

class ItemUpdate(BaseModel):
    name: Optional[str] = Field(None, description="The name of the item", example="Apple")
    category: Optional[str] = Field(None, description="The category of the item", example="Fruits")
    cost: Optional[float] = Field(None, description="The cost price of the item", example=0.5)
    selling_price: Optional[float] = Field(None, description="The selling price of the item", example=1.0)

class ItemResponse(ItemBase):
    id: int = Field(..., description="The unique identifier of the item")
    small_image_url: Optional[str] = Field(None, description="The public URL of the item's image in Supabase Storage")

    class Config:
        from_attributes = True

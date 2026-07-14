from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import crud
import schemas
import services

router = APIRouter(
    prefix="/items",
    tags=["Items"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.ItemResponse, status_code=status.HTTP_201_CREATED, summary="Create a new item", description="Creates a new item. Accepts multipart/form-data for image upload to Supabase.")
def create_item(
    name: str = Form(..., description="The name of the item"),
    category: str = Form(..., description="The category of the item"),
    cost: float = Form(..., description="The cost price of the item"),
    selling_price: float = Form(..., description="The selling price of the item"),
    image: Optional[UploadFile] = File(None, description="Optional image file to upload"),
    db: Session = Depends(get_db)
):
    image_url = None
    if image:
        try:
            image_url = services.upload_image_to_supabase(image)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")
            
    item_create = schemas.ItemCreate(name=name, category=category, cost=cost, selling_price=selling_price)
    return crud.create_item(db=db, item=item_create, image_url=image_url)

@router.get("/", response_model=List[schemas.ItemResponse], summary="Get all items", description="Retrieves a list of all items from the database.")
def read_items(skip: int = 0, limit: int = 100, category: Optional[str] = None, name: Optional[str] = None, db: Session = Depends(get_db)):
    items = crud.get_items(db, skip=skip, limit=limit, category=category, name=name)
    return items

@router.get("/{item_id}", response_model=schemas.ItemResponse, summary="Get an item", description="Retrieves a specific item by its ID.")
def read_item(item_id: int, db: Session = Depends(get_db)):
    db_item = crud.get_item(db, item_id=item_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item

@router.put("/{item_id}", response_model=schemas.ItemResponse, summary="Update an item", description="Updates an existing item's text details.")
def update_item(item_id: int, item: schemas.ItemUpdate, db: Session = Depends(get_db)):
    db_item = crud.update_item(db, item_id=item_id, item_update=item)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete an item", description="Deletes an item from the database and removes its image from Supabase Storage.")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    db_item = crud.get_item(db, item_id=item_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
        
    # Delete image from Supabase if it exists
    if db_item.small_image_url:
        services.delete_image_from_supabase(db_item.small_image_url)
        
    crud.delete_item(db, item_id=item_id)
    return None

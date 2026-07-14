from sqlalchemy.orm import Session
import models
import schemas

def get_item(db: Session, item_id: int):
    return db.query(models.Item).filter(models.Item.id == item_id).first()

def get_items(db: Session, skip: int = 0, limit: int = 100, category: str = None, name: str = None):
    query = db.query(models.Item)
    if category:
        query = query.filter(models.Item.category == category)
    if name:
        query = query.filter(models.Item.name.ilike(f"%{name}%"))
    return query.offset(skip).limit(limit).all()

def create_item(db: Session, item: schemas.ItemCreate, image_url: str = None):
    db_item = models.Item(
        name=item.name,
        category=item.category,
        cost=item.cost,
        selling_price=item.selling_price,
        small_image_url=image_url
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_item(db: Session, item_id: int, item_update: schemas.ItemUpdate):
    db_item = get_item(db, item_id)
    if db_item:
        update_data = item_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_item, key, value)
        db.commit()
        db.refresh(db_item)
    return db_item

def delete_item(db: Session, item_id: int):
    db_item = get_item(db, item_id)
    if db_item:
        db.delete(db_item)
        db.commit()
    return db_item

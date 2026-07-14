import os
import uuid
from supabase import create_client, Client
from fastapi import UploadFile
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "items-images")

# Initialize Supabase client
# Ensure SUPABASE_URL and SUPABASE_KEY are provided before creating the client to avoid errors.
try:
    if SUPABASE_URL and SUPABASE_KEY and SUPABASE_URL.startswith("http"):
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    else:
        supabase = None
        print("Warning: SUPABASE_URL or SUPABASE_KEY is missing or invalid. File uploads will fail.")
except Exception as e:
    supabase = None
    print(f"Warning: Failed to initialize Supabase client: {e}. File uploads will fail.")

def upload_image_to_supabase(file: UploadFile) -> str:
    """
    Uploads an image file to Supabase Storage and returns the public URL.
    """
    if not supabase:
        raise Exception("Supabase client is not initialized.")
        
    try:
        # Generate a unique file name to prevent overwriting
        file_extension = file.filename.split(".")[-1] if "." in file.filename else "bin"
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        
        # Read file content
        file_bytes = file.file.read()
        
        # Upload to Supabase Storage
        res = supabase.storage.from_(SUPABASE_BUCKET).upload(
            file=file_bytes,
            path=unique_filename,
            file_options={"content-type": file.content_type}
        )
        
        # Get public URL
        public_url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(unique_filename)
        return public_url
    except Exception as e:
        raise Exception(f"Failed to upload image to Supabase: {str(e)}")

def delete_image_from_supabase(image_url: str) -> None:
    """
    Deletes an image from Supabase Storage given its public URL.
    """
    if not supabase:
        print("Warning: Supabase client is not initialized, could not delete image.")
        return
        
    try:
        if not image_url:
            return
            
        # Extract filename from URL
        filename = image_url.split("/")[-1]
        
        # Delete from Supabase Storage
        supabase.storage.from_(SUPABASE_BUCKET).remove([filename])
    except Exception as e:
        print(f"Warning: Failed to delete image from Supabase: {str(e)}")

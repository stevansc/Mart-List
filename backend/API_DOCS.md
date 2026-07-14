# Mart List API Documentation

Welcome to the **Mart List API** documentation. This guide is intended for frontend engineers to integrate the backend API seamlessly. The API is built using FastAPI and follows standard RESTful principles.

## Base URL
By default, when running locally, the API is accessible at:
`http://localhost:8000`

---

## Endpoints Overview

### 1. Health Check
Check if the API is up and running.

* **URL:** `/`
* **Method:** `GET`
* **Response (200 OK):**
  ```json
  {
    "status": "ok",
    "message": "Welcome to Mart List API"
  }
  ```

---

### 2. Get All Items
Retrieve a list of all inventory items in the database.

* **URL:** `/items/`
* **Method:** `GET`
* **Query Parameters:**
  * `skip` (optional, default: 0): Number of records to skip (for pagination).
  * `limit` (optional, default: 100): Maximum number of records to return.
  * `category` (optional, default: null): Filter items by an exact category name.
  * `name` (optional, default: null): Search items by a partial or full name (case-insensitive).
* **Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "name": "Indomie Goreng",
      "category": "Noodles",
      "cost": 2500,
      "selling_price": 3100,
      "small_image_url": "https://<supabase-url>/storage/v1/object/public/items/images/..."
    },
    ...
  ]
  ```

---

### 3. Get Single Item
Retrieve details of a specific item by its ID.

* **URL:** `/items/{item_id}`
* **Method:** `GET`
* **Path Parameters:**
  * `item_id`: The ID of the item.
* **Response (200 OK):**
  ```json
  {
    "id": 1,
    "name": "Indomie Goreng",
    "category": "Noodles",
    "cost": 2500,
    "selling_price": 3100,
    "small_image_url": null
  }
  ```
* **Error (404 Not Found):** If the item doesn't exist.

---

### 4. Create an Item
Create a new item in the inventory. This endpoint accepts `multipart/form-data` to support image uploads.

* **URL:** `/items/`
* **Method:** `POST`
* **Content-Type:** `multipart/form-data`
* **Form Data Fields:**
  * `name` (string, required): The name of the item.
  * `category` (string, required): The category of the item.
  * `cost` (float, required): The cost price of the item.
  * `selling_price` (float, required): The selling price.
  * `image` (file, optional): An image file to upload.
* **Response (201 Created):**
  ```json
  {
    "id": 11,
    "name": "Barang Baru",
    "category": "Essentials",
    "cost": 5000,
    "selling_price": 7000,
    "small_image_url": "https://..."
  }
  ```
* **Frontend Fetch Example (JS):**
  ```javascript
  const formData = new FormData();
  formData.append('name', 'Barang Baru');
  formData.append('category', 'Essentials');
  formData.append('cost', 5000);
  formData.append('selling_price', 7000);
  formData.append('image', fileInput.files[0]); // Optional

  fetch('http://localhost:8000/items/', {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => console.log(data));
  ```

---

### 5. Update an Item
Update the text details of an existing item. This endpoint is highly flexible; you can effortlessly change the **name**, **category**, **cost**, or **selling_price** by providing any combination of these fields in a JSON payload.

* **URL:** `/items/{item_id}`
* **Method:** `PUT`
* **Content-Type:** `application/json`
* **Body:**
  ```json
  {
    "name": "Indomie Ayam Bawang",
    "category": "Noodles",
    "cost": 2600,
    "selling_price": 3200
  }
  ```
  *(Note: You can include any or all of these fields; they are fully optional. Only the provided fields will be updated.)*
* **Response (200 OK):**
  Returns the updated item object.

---

### 6. Delete an Item
Delete an item from the database. It will also automatically remove the associated image from Supabase Storage.

* **URL:** `/items/{item_id}`
* **Method:** `DELETE`
* **Response (204 No Content):**
  Empty response indicating successful deletion.
* **Error (404 Not Found):** If the item doesn't exist.

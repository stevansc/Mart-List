import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Lock,
  Unlock,
  X,
  Image as ImageIcon,
  RotateCcw,
  AlertCircle,
  Database,
  TrendingUp,
  Tag
} from "lucide-react";
import { Item, CATEGORIES } from "./types";


const DEFAULT_IMAGE_PLACEHOLDER = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80";
const API_BASE_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:8000" : "");

export default function App() {
  // --- STATE ---
  const [items, setItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Password States
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Modal States
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // New Item Form States
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [newCost, setNewCost] = useState("");
  const [newSellingPrice, setNewSellingPrice] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);

  // Dynamic Categories (combines hardcoded defaults with any custom categories created)
  const dynamicCategories = Array.from(new Set([...CATEGORIES, ...items.map(item => item.category)]));

  // --- INITIALIZATION ---

  // --- DATA FETCHING & FILTERING ---
  const fetchFilteredItems = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const queryParams = new URLSearchParams();
      if (searchQuery.trim() !== "") {
        queryParams.append("name", searchQuery.trim());
      }
      if (selectedCategory !== "All") {
        queryParams.append("category", selectedCategory);
      }

      const url = `${API_BASE_URL}/items/?${queryParams.toString()}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Server returned status code ${response.status}`);
      }
      const data = await response.json();
      setItems(data);

      // Update available categories only when we have the full, unfiltered list
      if (selectedCategory === "All" && searchQuery.trim() === "") {
        setAvailableCategories(Array.from(new Set(data.map((item: Item) => item.category))));
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      setErrorMessage(
        `Could not connect to the FastAPI backend at ${API_BASE_URL || window.location.origin}. Please make sure your server is running and CORS is enabled`
      );
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch items whenever search criteria or backend toggle changes
  useEffect(() => {
    fetchFilteredItems();
  }, [searchQuery, selectedCategory]);

  // --- ACTIONS ---

  // Create Item Handler
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCost || !newSellingPrice) {
      alert("Please fill in all required fields!");
      return;
    }

    const costNum = parseFloat(newCost);
    const sellingPriceNum = parseFloat(newSellingPrice);

    if (isNaN(costNum) || costNum < 0) {
      alert("Cost must be a valid positive number!");
      return;
    }
    if (isNaN(sellingPriceNum) || sellingPriceNum < 0) {
      alert("Selling Price must be a valid positive number!");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("name", newName.trim());
      formData.append("category", newCategory);
      formData.append("cost", costNum.toString());
      formData.append("selling_price", sellingPriceNum.toString());

      if (newImageFile) {
        formData.append("image", newImageFile);
      }

      const response = await fetch(`${API_BASE_URL}/items/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to create item. Server responded with status ${response.status}`);
      }

      // Reset form
      resetAddForm();
      // Refresh list
      await fetchFilteredItems();
      alert("Success! Item added to inventory.");
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Could not create item on FastAPI backend. Check server console or connection status.");
    } finally {
      setLoading(false);
    }
  };

  // Update Item Handler
  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editingItem.name.trim() || !editingItem.category || editingItem.cost === undefined || editingItem.selling_price === undefined) {
      alert("Please fill in all required fields!");
      return;
    }

    const costNum = parseFloat(editingItem.cost.toString());
    const sellingPriceNum = parseFloat(editingItem.selling_price.toString());

    if (isNaN(costNum) || costNum < 0) {
      alert("Cost must be a valid positive number!");
      return;
    }
    if (isNaN(sellingPriceNum) || sellingPriceNum < 0) {
      alert("Selling Price must be a valid positive number!");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const payload = {
        name: editingItem.name.trim(),
        category: editingItem.category,
        cost: costNum,
        selling_price: sellingPriceNum
      };

      const response = await fetch(`${API_BASE_URL}/items/${editingItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to update item. Server responded with status ${response.status}`);
      }

      setEditingItem(null);
      await fetchFilteredItems();
      alert("Success! Item details updated.");
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Could not update item on FastAPI backend. Check server connection.");
    } finally {
      setLoading(false);
    }
  };

  // Delete Item Handler
  const handleDeleteItem = async (itemId: string | number) => {
    if (!confirm("Are you sure you want to permanently delete this item from the inventory? This cannot be undone.")) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete item. Server responded with status ${response.status}`);
      }

      // Remove from UI immediately
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      alert("Success! Item removed.");
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Could not delete item from FastAPI backend. Check your backend status.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to reset "Add New Item" form state
  const resetAddForm = () => {
    setNewName("");
    setNewCategory(CATEGORIES[0]);
    setNewCost("");
    setNewSellingPrice("");
    setNewImageFile(null);
    setNewImagePreview(null);
  };

  // Handle local image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImageFile(file);

      // Create a blob URL for beautiful instant previewing
      const previewUrl = URL.createObjectURL(file);
      setNewImagePreview(previewUrl);
    }
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      setPasswordInput("");
      setPasswordError("");
      setShowPasswordPrompt(true);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "hello") {
      setIsAdmin(true);
      setShowPasswordPrompt(false);
      setPasswordError("");
    } else {
      setPasswordError("Kata sandi salah! Silakan coba lagi.");
    }
  };

  return (
    <div id="app-root" className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col selection:bg-blue-100">

      {/* PRIMARY MART HEADER - CLEAN MINIMALISM */}
      <header id="mart-header" className="bg-white border-b-4 border-blue-600 px-4 md:px-6 py-4 flex flex-col sm:flex-row justify-between items-center shadow-md gap-4">
        <div className="flex items-center gap-3">
          {/* Logo emblem */}
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 2L3 12h18L13 22" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 uppercase leading-none">
              Toko Lintang Baru
            </h1>
            <p className="text-slate-500 text-[11px] md:text-xs font-black uppercase tracking-widest mt-1">
              Sistem Inventaris Minimarket
            </p>
          </div>
        </div>

        {/* SECURE ADMIN MODE CONTROL PANEL & STATUS BADGES */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
          {isAdmin ? (
            <div className="bg-green-100 text-green-800 px-3 py-1.5 rounded-lg font-bold text-sm flex items-center gap-1.5 border-2 border-green-600">
              <Unlock className="w-4 h-4 stroke-[2.5px]" />
              <span>MODE ADMIN AKTIF</span>
            </div>
          ) : null}

          <button
            id="admin-mode-toggle"
            type="button"
            onClick={handleAdminToggle}
            className={`px-4 py-2 rounded-xl text-sm font-black transition-all border-2 flex items-center gap-1.5 cursor-pointer shadow-sm ${isAdmin
                ? "bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300"
                : "bg-blue-600 hover:bg-blue-700 text-white border-blue-700"
              }`}
          >
            {isAdmin ? "Kunci Admin" : "Buka Admin"}
          </button>
        </div>
      </header>

      {/* PRIMARY LAYOUT CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 flex flex-col gap-4">

        {/* SYSTEM STATUS & ERROR ALERTS */}
        {errorMessage && (
          <div id="error-alert" className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-5 flex items-start gap-4 text-rose-950 shadow-sm animate-fade-in">
            <AlertCircle className="w-8 h-8 text-rose-600 shrink-0 mt-0.5 stroke-[2.5px]" />
            <div>
              <h3 className="font-extrabold text-xl">Connection Notice</h3>
              <p className="text-lg mt-1">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* --- SEARCH & FILTER BAR - CLEAN MINIMALISM --- */}
        <section
          id="search-filter-section"
          className="p-3 bg-white flex flex-col sm:flex-row gap-3 shadow-sm rounded-xl border-2 border-slate-200"
        >
          {/* Main Search Input */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400 stroke-[2.5px]" />
            </div>
            <input
              id="search-input"
              type="text"
              placeholder="Cari nama produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-11 pr-4 py-2.5 border-2 border-slate-200 rounded-xl text-base font-semibold focus:border-blue-500 focus:outline-none transition-colors placeholder-slate-400 text-slate-900"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 rounded-full transition text-slate-500"
              >
                <X className="w-5 h-5 stroke-[2.5px]" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="relative w-full sm:w-64">
            <select
              id="filter-category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-base font-bold text-slate-700 bg-slate-50 focus:border-blue-500 appearance-none focus:outline-none cursor-pointer"
            >
              <option value="All">Semua Kategori</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {/* Custom arrow indicator for cleaner dropdown */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
              <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </section>

        {/* --- ADMIN ADD NEW ITEM FORM - CLEAN MINIMALISM --- */}
        {isAdmin && (
          <section
            id="add-item-panel"
            className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 md:p-5 flex flex-col gap-4 shadow-sm"
          >
            <div className="text-blue-800 font-black text-lg md:text-xl whitespace-nowrap uppercase tracking-wider border-b border-blue-200 pb-2 flex items-center gap-1.5">
              <Plus className="w-5 h-5 stroke-[3px]" />
              <span>+ Tambah Produk Baru:</span>
            </div>

            <form onSubmit={handleAddItem} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">

                {/* Item Name Input */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="input-item-name" className="text-sm font-bold text-blue-900">
                    Nama Produk <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="input-item-name"
                    type="text"
                    required
                    placeholder="Contoh: Indomie Goreng"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full p-2.5 border-2 border-blue-200 rounded-lg text-base bg-white focus:border-blue-500 focus:outline-none font-semibold text-slate-950"
                  />
                </div>

                {/* Category Selection Dropdown */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="select-item-category" className="text-sm font-bold text-blue-900">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="select-item-category"
                    list="category-options"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Pilih atau ketik kategori baru"
                    className="w-full p-2.5 border-2 border-blue-200 rounded-lg text-base bg-white focus:border-blue-500 focus:outline-none font-bold text-slate-800"
                  />
                  <datalist id="category-options">
                    {dynamicCategories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                {/* Cost Price Input (How much shop paid) */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="input-item-cost" className="text-sm font-bold text-blue-900">
                    Harga Beli (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="input-item-cost"
                    type="number"
                    step="1"
                    min="0"
                    required
                    placeholder="Contoh: 2500"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    className="w-full p-2.5 border-2 border-blue-200 rounded-lg text-base bg-white focus:border-blue-500 focus:outline-none font-bold text-slate-900"
                  />
                </div>

                {/* Selling Price Input (How much customer pays) */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="input-item-selling-price" className="text-sm font-bold text-blue-900">
                    Harga Jual (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="input-item-selling-price"
                    type="number"
                    step="1"
                    min="0"
                    required
                    placeholder="Contoh: 3500"
                    value={newSellingPrice}
                    onChange={(e) => setNewSellingPrice(e.target.value)}
                    className="w-full p-2.5 border-2 border-blue-200 rounded-lg text-base bg-white focus:border-blue-500 focus:outline-none font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Image Upload Area with Click/Drag support */}
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-blue-900">
                  Foto Produk (Opsional)
                </span>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <label
                    id="dropzone-label"
                    className="flex-1 w-full border-2 border-dashed border-blue-300 hover:border-blue-500 bg-white hover:bg-blue-100/30 rounded-lg p-4 flex flex-col items-center justify-center gap-1 cursor-pointer transition"
                  >
                    <ImageIcon className="w-6 h-6 text-blue-500" />
                    <span className="text-sm font-bold text-blue-800 text-center">
                      Ketuk untuk memilih foto atau seret ke sini
                    </span>
                    <input
                      id="image-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  {/* Dynamic Image Preview */}
                  {newImagePreview && (
                    <div id="image-preview-box" className="relative bg-white p-1.5 rounded-lg border-2 border-blue-200 shrink-0">
                      <img
                        src={newImagePreview}
                        alt="Preview of uploaded item"
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setNewImageFile(null);
                          setNewImagePreview(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full border border-slate-200 transition"
                        title="Hapus gambar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  id="cancel-add-btn"
                  type="button"
                  onClick={resetAddForm}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-sm transition cursor-pointer"
                >
                  Bersihkan
                </button>
                <button
                  id="submit-add-btn"
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Menyimpan..." : "SIMPAN PRODUK"}
                </button>
              </div>
            </form>
          </section>
        )}
        {/* --- INVENTORY LIST VIEW - CLEAN MINIMALISM --- */}
        <section id="inventory-list-wrapper" className="flex flex-col gap-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-lg md:text-xl font-extrabold text-slate-800 tracking-tight uppercase">
              Daftar Inventaris ({items.length} Produk)
            </span>
            {loading && <span className="text-xs font-bold text-blue-600 animate-pulse">Sinkronisasi...</span>}
          </div>

          {items.length === 0 ? (
            /* EMPTY STATE BOARD */
            <div id="empty-state" className="bg-white border-2 border-slate-200 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3 shadow-sm">
              <span className="text-4xl">🥫</span>
              <h3 className="text-lg font-black text-slate-800">Produk Tidak Ditemukan</h3>
              <p className="text-slate-500 text-sm max-w-sm font-medium">
                Coba cari dengan kata kunci lain, pilih kategori lain, atau tambahkan produk baru di Mode Admin.
              </p>
              {(searchQuery || selectedCategory !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  className="mt-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition cursor-pointer"
                >
                  Tampilkan Semua Produk
                </button>
              )}
            </div>
          ) : (
            /* DYNAMIC SCROLLING VERTICAL ROWS */
            <div id="inventory-items-container" className="flex flex-col gap-3">
              {items.map((item) => {
                const profit = item.selling_price - item.cost;

                return (
                  <article
                    key={item.id}
                    id={`item-row-${item.id}`}
                    className="bg-white border-2 border-slate-200 rounded-xl p-3 md:p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shadow-sm hover:border-blue-400 transition-all"
                  >
                    {/* THUMBNAIL SIDEBAR LEFT */}
                    <div className="flex justify-center items-center shrink-0">
                      <button
                        type="button"
                        onClick={() => setZoomImageUrl(item.small_image_url || item.image_url || null)}
                        className="group relative block w-20 h-20 rounded-lg overflow-hidden border-2 border-slate-100 hover:scale-105 transition-transform bg-slate-50 cursor-pointer"
                        title="Klik untuk memperbesar foto"
                      >
                        <img
                          src={item.small_image_url || item.image_url || DEFAULT_IMAGE_PLACEHOLDER}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = DEFAULT_IMAGE_PLACEHOLDER;
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-white text-[10px] font-black bg-slate-900/80 px-1.5 py-0.5 rounded">
                            🔍 Zoom
                          </span>
                        </div>
                      </button>
                    </div>

                    {/* CONTENT DESCRIPTION MIDDLE */}
                    <div className="flex-grow flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                      {/* Name Col */}
                      <div className="space-y-0.5 max-w-sm">
                        <div className="text-slate-500 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                          <Tag className="w-3 h-3 text-slate-400" />
                          <span>{item.category}</span>
                        </div>
                        <h3 className="text-base md:text-lg font-bold text-slate-900 break-words leading-tight">
                          {item.name}
                        </h3>
                      </div>

                      {/* Prices Col */}
                      <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full sm:w-[340px] md:w-[420px] shrink-0">
                        <div className="flex flex-col justify-between space-y-0.5">
                          <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">BELI</div>
                          <div className="text-sm md:text-base font-bold text-slate-600 whitespace-nowrap">
                            Rp {item.cost !== undefined ? Number(item.cost).toLocaleString('id-ID') : "0"}
                          </div>
                        </div>
                        <div className="flex flex-col justify-between space-y-0.5">
                          <div className="text-blue-500 font-bold text-[10px] uppercase tracking-wider">JUAL</div>
                          <div className="text-base md:text-lg font-extrabold text-blue-700 whitespace-nowrap">
                            Rp {item.selling_price !== undefined ? Number(item.selling_price).toLocaleString('id-ID') : "0"}
                          </div>
                        </div>
                        {profit > 0 && (
                          <div className="flex flex-col justify-between space-y-0.5">
                            <div className="text-green-500 font-bold text-[10px] uppercase tracking-wider">UNTUNG</div>
                            <div className="text-sm md:text-base font-bold text-green-700 flex items-center gap-0.5 whitespace-nowrap">
                              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                              <span>+Rp {profit.toLocaleString('id-ID')}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ACTIONS COL - RIGHT (Only when Admin is ON) */}
                      {isAdmin && (
                        <div className="flex justify-end gap-1.5 shrink-0 pt-2 sm:pt-0">
                          <button
                            id={`edit-btn-${item.id}`}
                            type="button"
                            onClick={() => setEditingItem({ ...item })}
                            className="bg-amber-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 hover:bg-amber-600 shadow-sm transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>EDIT</span>
                          </button>

                          <button
                            id={`delete-btn-${item.id}`}
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 hover:bg-red-600 shadow-sm transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>HAPUS</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* --- FOOTER INFO - CLEAN MINIMALISM --- */}
      <footer className="mt-auto bg-slate-900 text-slate-400 px-4 py-3.5 flex flex-col sm:flex-row justify-between items-center text-xs md:text-sm font-semibold border-t-4 border-slate-950 gap-2">
        <div>{items.length} PRODUK TERDAFTAR</div>
        <div className="flex gap-4 items-center">
          <span className="text-blue-400">TOKO LINTANG BARU v1.1</span>
        </div>
        <div>HARI INI: {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </footer>

      {/* --- IMAGE ZOOM MODAL OVERLAY --- */}
      {zoomImageUrl && (
        <div
          id="zoom-modal"
          onClick={() => setZoomImageUrl(null)} // Close when clicking anywhere on overlay
          className="fixed inset-0 bg-slate-950/90 z-50 flex flex-col items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <div className="relative max-w-xl max-h-[85vh] flex flex-col items-center justify-center gap-3 bg-white p-4 rounded-2xl border-2 border-slate-900 shadow-2xl">
            {/* Modal Image container */}
            <img
              src={zoomImageUrl}
              alt="Zoomed inventory product representation"
              className="max-w-full max-h-[60vh] object-contain rounded-xl border border-slate-100 bg-slate-50"
              referrerPolicy="no-referrer"
              onClick={(e) => e.stopPropagation()} // Prevent close when clicking directly on image
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_IMAGE_PLACEHOLDER;
              }}
            />

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between w-full pt-1">
              <span className="text-slate-600 font-bold text-xs sm:inline-block">
                💡 Ketuk di mana saja di luar gambar untuk menutup
              </span>
              <button
                id="close-zoom-btn"
                type="button"
                onClick={() => setZoomImageUrl(null)}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-lg border border-slate-900 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <X className="w-4 h-4 stroke-[3px]" />
                <span>TUTUP</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL OVERLAY --- */}
      {editingItem && (
        <div
          id="edit-modal"
          className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white border-2 border-slate-300 rounded-xl w-full max-w-md p-4 md:p-5 shadow-2xl animate-scale-up">

            {/* Title Bar */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h2 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-1.5">
                <Edit2 className="w-5 h-5 text-blue-600 stroke-[3px]" />
                Edit Detail Produk
              </h2>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1 hover:bg-slate-100 rounded-full transition"
                title="Batal"
              >
                <X className="w-6 h-6 stroke-[2.5px]" />
              </button>
            </div>

            {/* Editing Form */}
            <form onSubmit={handleUpdateItem} className="flex flex-col gap-4">

              {/* Name */}
              <div className="flex flex-col gap-1">
                <label htmlFor="edit-item-name" className="text-sm font-bold text-slate-800">
                  Nama Produk <span className="text-rose-500">*</span>
                </label>
                <input
                  id="edit-item-name"
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full text-base p-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg font-bold text-slate-900"
                />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1">
                <label htmlFor="edit-item-category" className="text-sm font-bold text-slate-800">
                  Kategori <span className="text-rose-500">*</span>
                </label>
                <input
                  id="edit-item-category"
                  list="category-options"
                  value={editingItem.category}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  placeholder="Pilih atau ketik kategori baru"
                  className="w-full text-base p-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg font-black text-slate-950"
                />
              </div>

              {/* Cost and Selling Price in Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* Cost */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-item-cost" className="text-sm font-bold text-slate-800 flex items-center gap-1">
                    Harga Beli (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Rp</span>
                    <input
                      id="edit-item-cost"
                      type="number"
                      step="1"
                      min="0"
                      required
                      value={editingItem.cost}
                      onChange={(e) => setEditingItem({ ...editingItem, cost: parseFloat(e.target.value) || 0 })}
                      className="w-full text-base p-2.5 pl-9 bg-slate-50 border-2 border-slate-300 rounded-lg font-bold text-slate-900"
                    />
                  </div>
                </div>

                {/* Selling Price */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-item-selling-price" className="text-sm font-bold text-slate-800 flex items-center gap-1">
                    Harga Jual (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Rp</span>
                    <input
                      id="edit-item-selling-price"
                      type="number"
                      step="1"
                      min="0"
                      required
                      value={editingItem.selling_price}
                      onChange={(e) => setEditingItem({ ...editingItem, selling_price: parseFloat(e.target.value) || 0 })}
                      className="w-full text-base p-2.5 pl-9 bg-slate-50 border-2 border-slate-300 rounded-lg font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Guideline */}
              <p className="text-xs text-slate-500 font-bold bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-1">
                ⚠️ Perubahan data akan langsung disimpan di database/browser Anda.
              </p>

              {/* Footer Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  id="cancel-edit-btn"
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-sm transition"
                >
                  Batal
                </button>
                <button
                  id="submit-edit-btn"
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition cursor-pointer"
                >
                  {loading ? "Menyimpan..." : "💾 Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PASSWORD PROMPT MODAL --- */}
      {showPasswordPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-5 w-full max-w-sm animate-scale-up">
            <h3 className="text-base font-black text-slate-900 mb-1 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-blue-600" />
              Masuk Mode Admin
            </h3>
            <p className="text-slate-500 text-xs mb-3">Masukkan kata sandi untuk mengakses pengaturan admin.</p>
            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div>
                <input
                  type="password"
                  required
                  placeholder="Kata sandi..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full p-2 border-2 border-slate-200 rounded-lg text-base focus:border-blue-500 focus:outline-none font-bold"
                  autoFocus
                />
                {passwordError && (
                  <p className="text-red-500 text-xs font-bold mt-1">{passwordError}</p>
                )}
              </div>
              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowPasswordPrompt(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  Masuk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

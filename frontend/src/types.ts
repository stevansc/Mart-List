export interface Item {
  id: string | number;
  name: string;
  category: string;
  cost: number;
  selling_price: number;
  image_url?: string;
  small_image_url?: string;
}

export const CATEGORIES = [
  "Sembako",
  "Minuman",
  "Makanan Ringan",
  "Mie & Makanan Instan",
  "Susu & Olahan",
  "Perawatan Tubuh",
  "Kebutuhan Rumah Tangga",
  "Lainnya"
];

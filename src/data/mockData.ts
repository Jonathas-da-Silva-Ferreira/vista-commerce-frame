/**
 * Fallback mock data used ONLY when no backend API is configured.
 * Once VITE_API_URL is set, this file is no longer loaded at runtime.
 */
import type { Product, Category, PaginatedResponse } from '@/types';

// Fallback dataset used ONLY when no real backend is configured (VITE_API_URL
// unset). Once the env var is set, this file is no longer evaluated at runtime.
export const categories: Category[] = [
  { id: '1', name: 'Best Products', slug: 'best-products', icon: 'Award', color: 'gold', description: 'The highest-rated and most recommended products from our customers.', subcategories: ['Top 10', 'Recommended', 'Best Sellers'] },
  { id: '2', name: 'Deals', slug: 'deals', icon: 'Tag', color: 'red', description: 'Exclusive discounts for a limited time.', subcategories: ['Up to 30% OFF', 'Up to 50% OFF', 'Clearance'] },
  { id: '3', name: 'Home', slug: 'home', icon: 'Home', color: 'orange', description: 'Everything to make your home more beautiful and functional.', subcategories: ['Furniture', 'Decor', 'Lighting', 'Organization'] },
  { id: '4', name: 'Auto Parts', slug: 'auto-parts', icon: 'Car', color: 'olive', description: 'Parts and accessories to maintain and personalize your vehicle.', subcategories: ['Engine', 'Suspension', 'Electrical', 'Accessories'] },
  {
    id: '5', name: 'Books', slug: 'books', icon: 'BookOpen', color: 'brown',
    description: 'Explore best-sellers, new releases, and literary classics.',
    subcategories: ['Fantasy', 'Romance', 'Science Fiction', 'Horror', 'Thriller', 'Technology / Programming', 'Business / Entrepreneurship', 'Personal Development', 'History', 'Biography', 'Children', 'Comics / Manga'],
  },
  {
    id: '6', name: 'Tools', slug: 'tools', icon: 'Wrench', color: 'indigo',
    description: 'Professional and home tools for any project.',
    subcategories: ['Drills', 'Screwdrivers', 'Wrenches', 'Pliers', 'Power Tools', 'Hand Tools', 'Tool Kits', 'Measuring Tools'],
  },
  {
    id: '7', name: 'Fashion', slug: 'fashion', icon: 'Shirt', color: 'green-dark',
    description: 'Trends and essentials for your wardrobe.',
    subcategories: ['T-Shirts', 'Pants', 'Jackets', 'Dresses', 'Shoes', 'Sneakers', 'Accessories', "Men's Fashion", "Women's Fashion"],
  },
  { id: '8', name: 'PC Components', slug: 'pc-components', icon: 'Monitor', color: 'magenta', description: 'Hardware and peripherals to build or upgrade your PC.', subcategories: ['Processors', 'Graphics Cards', 'RAM Memory', 'Storage'] },
  {
    id: '9', name: 'Electronics', slug: 'electronics', icon: 'Headphones', color: 'blue',
    description: 'Gadgets, smartphones, and electronic accessories.',
    subcategories: ['Smartphones', 'Headphones', 'Tablets', 'Smartwatch', 'Speakers', 'Cameras', 'TVs', 'Monitors', 'Chargers', 'Cables & Adapters'],
  },
  { id: '10', name: 'Sports', slug: 'sports', icon: 'Dumbbell', color: 'teal', description: 'Equipment and accessories for every sport.', subcategories: ['Bodybuilding', 'Running', 'Swimming', 'Soccer'] },
  { id: '11', name: 'Kitchen', slug: 'kitchen', icon: 'ChefHat', color: 'crimson', description: 'Utensils and appliances to make day-to-day cooking easier.', subcategories: ['Pots & Pans', 'Utensils', 'Appliances', 'Organization'] },
  { id: '12', name: 'Adventure', slug: 'adventure', icon: 'Tent', color: 'khaki', description: 'Gear for camping, hiking, and outdoor activities.', subcategories: ['Tents', 'Backpacks', 'Lighting', 'Apparel'] },
  {
    id: '13', name: 'Fishing', slug: 'fishing', icon: 'Fish', color: 'cyan',
    description: 'Rods, reels, and accessories for anglers of every level.',
    subcategories: ['Fishing Rods', 'Spinning Reels', 'Baitcasting Reels', 'Fishing Lines', 'Artificial Baits', 'Natural Baits', 'Fishing Hooks', 'Floats', 'Tackle Boxes', 'Fishing Accessories'],
  },
  {
    id: '14', name: 'Pet Shop', slug: 'pet-shop', icon: 'PawPrint', color: 'purple',
    description: 'Food, toys, and accessories for your pets.',
    subcategories: ['Pet Food', 'Treats', 'Toys', 'Beds & Houses', 'Collars & Leashes', 'Hygiene & Cleaning', 'Medications', 'Pet Clothing', 'Carriers (Boxes / Bags)'],
  },
  { id: '15', name: 'Toys', slug: 'toys', icon: 'Blocks', color: 'wine', description: 'Guaranteed fun for children of all ages.', subcategories: ['Educational', 'Dolls', 'Vehicles', 'Games'] },
];

export const products: Product[] = [
  // Electronics
  { id: '1', name: 'Premium Bluetooth Headphones', description: 'Wireless headphones with active noise cancellation and long-lasting battery.', price: 299.90, originalPrice: 449.90, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600'], category: 'electronics', subcategory: 'Headphones', rating: 4.8, reviewCount: 234, seller: 'TechStore', stock: 50, isFeatured: true, isPromotion: true },
  { id: '2', name: 'Ultra 5G Smartphone', description: 'Next-generation smartphone with 108MP camera and AMOLED display.', price: 2499.00, originalPrice: 2999.00, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600', images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600', 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600'], category: 'electronics', subcategory: 'Smartphones', rating: 4.9, reviewCount: 567, seller: 'MobileWorld', stock: 25, isFeatured: true, isPromotion: true },
  { id: '16', name: 'Tablet Pro 11"', description: '11-inch tablet with a powerful processor and stylus included.', price: 1899.00, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600', category: 'electronics', subcategory: 'Tablets', rating: 4.7, reviewCount: 189, seller: 'TechStore', stock: 30 },
  { id: '17', name: 'Fitness Pro Smartwatch', description: 'Smart watch with GPS, heart-rate monitor, and 100+ workout modes.', price: 599.90, originalPrice: 799.90, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', category: 'electronics', subcategory: 'Smartwatch', rating: 4.6, reviewCount: 312, seller: 'TechStore', stock: 45, isPromotion: true },
  { id: '18', name: 'Portable Speaker 20W', description: 'Waterproof Bluetooth speaker with 12-hour battery life.', price: 199.90, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600', category: 'electronics', subcategory: 'Speakers', rating: 4.5, reviewCount: 156, seller: 'SoundMax', stock: 80 },
  { id: '19', name: '4K Mirrorless Digital Camera', description: 'Full-frame mirrorless camera with 4K 60fps recording.', price: 4299.00, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600', category: 'electronics', subcategory: 'Cameras', rating: 4.9, reviewCount: 98, seller: 'FotoShop', stock: 12, isFeatured: true },

  // Fashion
  { id: '3', name: 'Premium Cotton T-Shirt', description: '100% cotton T-shirt with premium finish, available in multiple colors.', price: 79.90, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', category: 'fashion', subcategory: 'T-Shirts', rating: 4.5, reviewCount: 189, seller: 'FashionBR', stock: 200 },
  { id: '20', name: 'Slim Fit Jeans', description: 'Comfortable and modern slim-cut jeans.', price: 149.90, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600', category: 'fashion', subcategory: 'Pants', rating: 4.4, reviewCount: 267, seller: 'FashionBR', stock: 150 },
  { id: '21', name: 'Windbreaker Jacket', description: 'Lightweight, waterproof jacket — ideal for rainy days.', price: 199.90, originalPrice: 279.90, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600', category: 'fashion', subcategory: 'Jackets', rating: 4.6, reviewCount: 134, seller: 'FashionBR', stock: 60, isPromotion: true },
  { id: '22', name: 'Urban Casual Sneakers', description: 'Comfortable, modern sneakers for daily wear.', price: 249.90, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600', category: 'fashion', subcategory: 'Sneakers', rating: 4.7, reviewCount: 423, seller: 'ShoesMax', stock: 90 },

  // Tools
  { id: '4', name: '150-piece Tool Kit', description: 'Complete home and shop tool kit with organizer case.', price: 189.90, originalPrice: 249.90, image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600', category: 'tools', subcategory: 'Tool Kits', rating: 4.7, reviewCount: 342, seller: 'ToolMaster', stock: 75, isPromotion: true },
  { id: '23', name: '750W Impact Drill', description: 'Professional drill with variable speed and a case with bits included.', price: 329.90, image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600', category: 'tools', subcategory: 'Drills', rating: 4.8, reviewCount: 198, seller: 'ToolMaster', stock: 40 },
  { id: '24', name: '12V Cordless Screwdriver', description: 'Compact screwdriver with lithium battery and 2 speeds.', price: 199.90, image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600', category: 'tools', subcategory: 'Screwdrivers', rating: 4.5, reviewCount: 156, seller: 'ToolMaster', stock: 55 },
  { id: '25', name: '40m Digital Laser Tape Measure', description: 'Laser measuring device with millimeter accuracy and LCD display.', price: 149.90, image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600', category: 'tools', subcategory: 'Measuring Tools', rating: 4.6, reviewCount: 89, seller: 'ToolMaster', stock: 35 },

  // Books
  { id: '5', name: 'Book: The Art of Programming', description: 'Best-seller about programming and software development.', price: 59.90, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600', category: 'books', subcategory: 'Technology / Programming', rating: 4.9, reviewCount: 892, seller: 'BookStore', stock: 150, isFeatured: true },
  { id: '26', name: 'The Lord of the Rings - Trilogy', description: 'The fantasy masterpiece in a special hardcover edition.', price: 129.90, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600', category: 'books', subcategory: 'Fantasy', rating: 4.9, reviewCount: 1230, seller: 'BookStore', stock: 200, isFeatured: true },
  { id: '27', name: 'Moonlit Romance', description: 'A contemporary romance best-seller that captivated millions of readers.', price: 39.90, image: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600', category: 'books', subcategory: 'Romance', rating: 4.5, reviewCount: 567, seller: 'BookStore', stock: 300 },
  { id: '28', name: 'Mindset: The New Psychology of Success', description: 'Transform your mindset and achieve extraordinary results.', price: 44.90, image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600', category: 'books', subcategory: 'Personal Development', rating: 4.7, reviewCount: 789, seller: 'BookStore', stock: 250 },
  { id: '29', name: 'Digital Entrepreneurship', description: 'A complete guide to starting your online business from scratch.', price: 54.90, image: 'https://images.unsplash.com/photo-1553729459-afe8f2e2ed65?w=600', category: 'books', subcategory: 'Business / Entrepreneurship', rating: 4.6, reviewCount: 345, seller: 'BookStore', stock: 180 },
  { id: '40', name: 'Dune - Frank Herbert', description: 'The science fiction classic in a commemorative edition.', price: 69.90, image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600', category: 'books', subcategory: 'Science Fiction', rating: 4.8, reviewCount: 678, seller: 'BookStore', stock: 120 },
  { id: '41', name: 'It', description: 'The classic Stephen King horror in a definitive edition.', price: 79.90, image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600', category: 'books', subcategory: 'Horror', rating: 4.7, reviewCount: 456, seller: 'BookStore', stock: 95 },

  // Home
  { id: '6', name: '3-Seat Reclining Sofa', description: 'Comfortable sofa with retractable seat and reclining backrest.', price: 1299.00, originalPrice: 1799.00, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600', category: 'home', subcategory: 'Furniture', rating: 4.6, reviewCount: 156, seller: 'CasaMoveis', stock: 10, isPromotion: true },

  // PC Components
  { id: '7', name: 'RTX 4060 Graphics Card', description: 'High-performance GPU for gaming and graphics work.', price: 2199.00, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600', category: 'pc-components', subcategory: 'Graphics Cards', rating: 4.8, reviewCount: 423, seller: 'PCGamer', stock: 15, isFeatured: true },

  // Sports
  { id: '8', name: 'Pro Running Shoes', description: 'Running shoes with gel cushioning and aerodynamic design.', price: 349.90, originalPrice: 449.90, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', category: 'sports', subcategory: 'Running', rating: 4.7, reviewCount: 678, seller: 'SportMax', stock: 80, isPromotion: true },

  // Kitchen
  { id: '9', name: 'Multifunction Electric Pot', description: 'Electric 6L pot with 10 programmable functions.', price: 299.90, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600', category: 'kitchen', subcategory: 'Appliances', rating: 4.6, reviewCount: 234, seller: 'ChefHome', stock: 45 },

  // Adventure
  { id: '10', name: '4-Person Camping Tent', description: 'Waterproof tent with UV protection and easy assembly.', price: 399.90, originalPrice: 549.90, image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600', category: 'adventure', subcategory: 'Tents', rating: 4.5, reviewCount: 167, seller: 'AdventureStore', stock: 30, isPromotion: true },

  // Fishing
  { id: '11', name: 'Carbon Fishing Rod 3m', description: 'High-strength carbon fishing rod.', price: 249.90, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600', category: 'fishing', subcategory: 'Fishing Rods', rating: 4.4, reviewCount: 89, seller: 'FishMax', stock: 40 },
  { id: '30', name: 'Shimano 4000 Spinning Reel', description: 'Professional spinning reel with 6 bearings and anti-reverse system.', price: 349.90, image: 'https://images.unsplash.com/photo-1532015889804-92320c4a6f4d?w=600', category: 'fishing', subcategory: 'Spinning Reels', rating: 4.7, reviewCount: 134, seller: 'FishMax', stock: 25 },
  { id: '31', name: '20-piece Artificial Bait Kit', description: 'Kit with 20 assorted artificial baits for sport fishing.', price: 89.90, image: 'https://images.unsplash.com/photo-1500463959177-e0869687df26?w=600', category: 'fishing', subcategory: 'Artificial Baits', rating: 4.3, reviewCount: 67, seller: 'FishMax', stock: 60 },
  { id: '32', name: 'Multifilament Fishing Line 300m', description: 'High-strength multifilament fishing line.', price: 69.90, image: 'https://images.unsplash.com/photo-1545450660-3378a7f3a364?w=600', category: 'fishing', subcategory: 'Fishing Lines', rating: 4.5, reviewCount: 98, seller: 'FishMax', stock: 100 },
  { id: '42', name: 'Marine Sports Baitcasting Reel', description: 'Low-profile baitcasting reel with magnetic brake and 7 bearings.', price: 289.90, image: 'https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=600', category: 'fishing', subcategory: 'Baitcasting Reels', rating: 4.6, reviewCount: 78, seller: 'FishMax', stock: 20 },

  // Pet Shop
  { id: '12', name: 'Premium Adult Dog Food 15kg', description: 'Super-premium food for adult dogs of all breeds.', price: 179.90, originalPrice: 219.90, image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600', category: 'pet-shop', subcategory: 'Pet Food', rating: 4.8, reviewCount: 456, seller: 'PetLove', stock: 100, isPromotion: true },
  { id: '33', name: 'Dog Chew Toy', description: 'Tough, non-toxic rubber chew toy for dogs.', price: 29.90, image: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=600', category: 'pet-shop', subcategory: 'Toys', rating: 4.4, reviewCount: 234, seller: 'PetLove', stock: 200 },
  { id: '34', name: 'Large Orthopedic Pet Bed', description: 'Orthopedic bed for large dogs with viscoelastic foam.', price: 189.90, image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600', category: 'pet-shop', subcategory: 'Beds & Houses', rating: 4.6, reviewCount: 123, seller: 'PetLove', stock: 35 },
  { id: '35', name: 'Adjustable Flea Collar', description: 'Collar with flea and tick protection for up to 8 months.', price: 49.90, image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600', category: 'pet-shop', subcategory: 'Collars & Leashes', rating: 4.5, reviewCount: 345, seller: 'PetLove', stock: 150 },
  { id: '43', name: 'Natural Dog Treats 500g', description: '100% natural dehydrated treats with no preservatives.', price: 34.90, image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=600', category: 'pet-shop', subcategory: 'Treats', rating: 4.7, reviewCount: 189, seller: 'PetLove', stock: 120 },
  { id: '44', name: 'Complete Pet Hygiene Kit', description: 'Kit with shampoo, conditioner, and perfume for at-home bathing.', price: 59.90, image: 'https://images.unsplash.com/photo-1583337130417-13104dec14a8?w=600', category: 'pet-shop', subcategory: 'Hygiene & Cleaning', rating: 4.3, reviewCount: 112, seller: 'PetLove', stock: 80 },

  // Toys
  { id: '13', name: 'LEGO Space City 500 Pieces', description: 'Space-themed LEGO kit for kids aged 7+.', price: 299.90, image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600', category: 'toys', subcategory: 'Educational', rating: 4.9, reviewCount: 234, seller: 'ToyWorld', stock: 25, isFeatured: true },

  // Auto Parts
  { id: '14', name: 'Synthetic Motor Oil Kit 5L', description: '5W30 synthetic oil for modern engines.', price: 189.90, originalPrice: 229.90, image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=600', category: 'auto-parts', subcategory: 'Engine', rating: 4.7, reviewCount: 312, seller: 'AutoParts', stock: 60, isPromotion: true },
];

// Default shipping policy applied to any product missing its own — keeps the
// downstream calculator working without per-product null checks.
const defaultShipping = { south: 0, southeast: 0, centerWest: 0, north: 25, northeast: 20 };
products.forEach(p => { if (!p.shipping) p.shipping = { ...defaultShipping }; });

/**
 * Class-style mock API kept for legacy callers. The active path goes through
 * mockServer.ts which intercepts fetch and serves the same data.
 */
function delay(ms = 200) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const mockApi = {
  async getProducts(
    filters?: { category?: string; subcategory?: string; query?: string; minPrice?: number; maxPrice?: number; sortBy?: string },
    page = 1,
    limit = 12
  ): Promise<PaginatedResponse<Product>> {
    await delay(300);
    let filtered = [...products];

    if (filters?.category) filtered = filtered.filter(p => p.category === filters.category);
    if (filters?.subcategory) filtered = filtered.filter(p => p.subcategory === filters.subcategory);
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (filters?.minPrice !== undefined) filtered = filtered.filter(p => p.price >= filters.minPrice!);
    if (filters?.maxPrice !== undefined) filtered = filtered.filter(p => p.price <= filters.maxPrice!);

    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'price-asc': filtered.sort((a, b) => a.price - b.price); break;
        case 'price-desc': filtered.sort((a, b) => b.price - a.price); break;
        case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
      }
    }

    const start = (page - 1) * limit;
    return { data: filtered.slice(start, start + limit), total: filtered.length, page, limit, hasMore: start + limit < filtered.length };
  },

  async getProductById(id: string): Promise<Product> {
    await delay();
    const product = products.find(p => p.id === id);
    if (!product) throw new Error('Product not found');
    return product;
  },

  async getCategories(): Promise<Category[]> {
    await delay(100);
    return categories;
  },

  async getFeaturedProducts(): Promise<Product[]> {
    await delay();
    return products.filter(p => p.isFeatured);
  },

  async getPromotionProducts(): Promise<Product[]> {
    await delay();
    return products.filter(p => p.isPromotion);
  },

  async getRelatedProducts(productId: string, category: string): Promise<Product[]> {
    await delay();
    return products.filter(p => p.category === category && p.id !== productId).slice(0, 4);
  },
};

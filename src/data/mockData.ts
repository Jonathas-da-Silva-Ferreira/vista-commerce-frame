import type { Product, Category } from '@/types';

export const categories: Category[] = [
  { id: '1', name: 'Melhores Produtos', slug: 'melhores-produtos', icon: 'Award', color: 'gold' },
  { id: '2', name: 'Promoção', slug: 'promocao', icon: 'Tag', color: 'red' },
  { id: '3', name: 'Casa', slug: 'casa', icon: 'Home', color: 'orange' },
  { id: '4', name: 'Peças Automotivas', slug: 'pecas-automotivas', icon: 'Car', color: 'olive' },
  { id: '5', name: 'Livros', slug: 'livros', icon: 'BookOpen', color: 'brown' },
  { id: '6', name: 'Ferramentas', slug: 'ferramentas', icon: 'Wrench', color: 'indigo' },
  { id: '7', name: 'Modas', slug: 'modas', icon: 'Shirt', color: 'green-dark' },
  { id: '8', name: 'Componentes de Computador', slug: 'componentes-computador', icon: 'Monitor', color: 'magenta' },
  { id: '9', name: 'Eletrônicos', slug: 'eletronicos', icon: 'Headphones', color: 'blue' },
  { id: '10', name: 'Esportes', slug: 'esportes', icon: 'Dumbbell', color: 'teal' },
  { id: '11', name: 'Cozinha', slug: 'cozinha', icon: 'ChefHat', color: 'crimson' },
  { id: '12', name: 'Aventura', slug: 'aventura', icon: 'Tent', color: 'khaki' },
  { id: '13', name: 'Pesca', slug: 'pesca', icon: 'Fish', color: 'cyan' },
  { id: '14', name: 'Pet Shop', slug: 'pet-shop', icon: 'PawPrint', color: 'purple' },
  { id: '15', name: 'Brinquedos', slug: 'brinquedos', icon: 'Blocks', color: 'wine' },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Fone de Ouvido Bluetooth Premium',
    description: 'Fone de ouvido sem fio com cancelamento de ruído ativo e bateria de longa duração.',
    price: 299.90,
    originalPrice: 449.90,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    category: 'eletronicos',
    rating: 4.8,
    reviewCount: 234,
    seller: 'TechStore',
    stock: 50,
    isFeatured: true,
    isPromotion: true,
  },
  {
    id: '2',
    name: 'Smartphone Ultra 5G',
    description: 'Smartphone de última geração com câmera de 108MP e tela AMOLED.',
    price: 2499.00,
    originalPrice: 2999.00,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
    category: 'eletronicos',
    rating: 4.9,
    reviewCount: 567,
    seller: 'MobileWorld',
    stock: 25,
    isFeatured: true,
    isPromotion: true,
  },
  {
    id: '3',
    name: 'Camiseta Algodão Premium',
    description: 'Camiseta 100% algodão com acabamento premium e várias cores.',
    price: 79.90,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    category: 'modas',
    rating: 4.5,
    reviewCount: 189,
    seller: 'FashionBR',
    stock: 200,
  },
  {
    id: '4',
    name: 'Kit Ferramentas 150 Peças',
    description: 'Kit completo de ferramentas para casa e oficina com maleta organizadora.',
    price: 189.90,
    originalPrice: 249.90,
    image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400',
    category: 'ferramentas',
    rating: 4.7,
    reviewCount: 342,
    seller: 'ToolMaster',
    stock: 75,
    isPromotion: true,
  },
  {
    id: '5',
    name: 'Livro: A Arte de Programar',
    description: 'Best-seller sobre programação e desenvolvimento de software.',
    price: 59.90,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
    category: 'livros',
    rating: 4.9,
    reviewCount: 892,
    seller: 'BookStore',
    stock: 150,
    isFeatured: true,
  },
  {
    id: '6',
    name: 'Sofá 3 Lugares Retrátil',
    description: 'Sofá confortável com assento retrátil e encosto reclinável.',
    price: 1299.00,
    originalPrice: 1799.00,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
    category: 'casa',
    rating: 4.6,
    reviewCount: 156,
    seller: 'CasaMóveis',
    stock: 10,
    isPromotion: true,
  },
  {
    id: '7',
    name: 'Placa de Vídeo RTX 4060',
    description: 'GPU de alta performance para jogos e trabalhos gráficos.',
    price: 2199.00,
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400',
    category: 'componentes-computador',
    rating: 4.8,
    reviewCount: 423,
    seller: 'PCGamer',
    stock: 15,
    isFeatured: true,
  },
  {
    id: '8',
    name: 'Tênis Running Pro',
    description: 'Tênis para corrida com amortecimento gel e design aerodinâmico.',
    price: 349.90,
    originalPrice: 449.90,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    category: 'esportes',
    rating: 4.7,
    reviewCount: 678,
    seller: 'SportMax',
    stock: 80,
    isPromotion: true,
  },
  {
    id: '9',
    name: 'Panela Elétrica Multifuncional',
    description: 'Panela elétrica 6L com 10 funções programáveis.',
    price: 299.90,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    category: 'cozinha',
    rating: 4.6,
    reviewCount: 234,
    seller: 'ChefHome',
    stock: 45,
  },
  {
    id: '10',
    name: 'Barraca de Camping 4 Pessoas',
    description: 'Barraca impermeável com proteção UV e fácil montagem.',
    price: 399.90,
    originalPrice: 549.90,
    image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=400',
    category: 'aventura',
    rating: 4.5,
    reviewCount: 167,
    seller: 'AventureiroStore',
    stock: 30,
    isPromotion: true,
  },
  {
    id: '11',
    name: 'Vara de Pesca Carbono 3m',
    description: 'Vara de pesca em carbono de alta resistência.',
    price: 249.90,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
    category: 'pesca',
    rating: 4.4,
    reviewCount: 89,
    seller: 'PescaMax',
    stock: 40,
  },
  {
    id: '12',
    name: 'Ração Premium Cães Adultos 15kg',
    description: 'Ração super premium para cães adultos de todas as raças.',
    price: 179.90,
    originalPrice: 219.90,
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400',
    category: 'pet-shop',
    rating: 4.8,
    reviewCount: 456,
    seller: 'PetLove',
    stock: 100,
    isPromotion: true,
  },
  {
    id: '13',
    name: 'LEGO Cidade Espacial 500 Peças',
    description: 'Kit LEGO temático de cidade espacial para crianças acima de 7 anos.',
    price: 299.90,
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400',
    category: 'brinquedos',
    rating: 4.9,
    reviewCount: 234,
    seller: 'ToyWorld',
    stock: 25,
    isFeatured: true,
  },
  {
    id: '14',
    name: 'Kit Óleo Motor Sintético 5L',
    description: 'Óleo sintético 5W30 para motores modernos.',
    price: 189.90,
    originalPrice: 229.90,
    image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400',
    category: 'pecas-automotivas',
    rating: 4.7,
    reviewCount: 312,
    seller: 'AutoPeças',
    stock: 60,
    isPromotion: true,
  },
];

// Simulate API calls with mock data
export const mockApi = {
  getProducts: async (filters?: { category?: string; query?: string }, page = 1, limit = 12) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filtered = [...products];
    
    if (filters?.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    
    if (filters?.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query)
      );
    }
    
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      data: filtered.slice(start, end),
      total: filtered.length,
      page,
      limit,
      hasMore: end < filtered.length,
    };
  },

  getProductById: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const product = products.find(p => p.id === id);
    if (!product) throw new Error('Product not found');
    return product;
  },

  getCategories: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return categories;
  },

  getFeaturedProducts: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return products.filter(p => p.isFeatured);
  },

  getPromotionProducts: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return products.filter(p => p.isPromotion);
  },
};

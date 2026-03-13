/**
 * Fallback mock data used ONLY when no backend API is configured.
 * Once VITE_API_URL is set, this file is no longer loaded at runtime.
 */
import type { Product, Category, PaginatedResponse } from '@/types';

export const categories: Category[] = [
  { id: '1', name: 'Melhores Produtos', slug: 'melhores-produtos', icon: 'Award', color: 'gold', description: 'Os produtos mais bem avaliados e recomendados pelos nossos clientes.', subcategories: ['Top 10', 'Recomendados', 'Mais Vendidos'] },
  { id: '2', name: 'Promoção', slug: 'promocao', icon: 'Tag', color: 'red', description: 'Aproveite descontos exclusivos por tempo limitado.', subcategories: ['Até 30% OFF', 'Até 50% OFF', 'Liquidação'] },
  { id: '3', name: 'Casa', slug: 'casa', icon: 'Home', color: 'orange', description: 'Tudo para deixar sua casa mais bonita e funcional.', subcategories: ['Móveis', 'Decoração', 'Iluminação', 'Organização'] },
  { id: '4', name: 'Peças Automotivas', slug: 'pecas-automotivas', icon: 'Car', color: 'olive', description: 'Peças e acessórios para manutenção e personalização do seu veículo.', subcategories: ['Motor', 'Suspensão', 'Elétrica', 'Acessórios'] },
  { id: '5', name: 'Livros', slug: 'livros', icon: 'BookOpen', color: 'brown', description: 'Explore best-sellers, lançamentos e clássicos da literatura.', subcategories: ['Fantasia', 'Romance', 'Tecnologia', 'Negócios'] },
  { id: '6', name: 'Ferramentas', slug: 'ferramentas', icon: 'Wrench', color: 'indigo', description: 'Ferramentas profissionais e domésticas para qualquer projeto.', subcategories: ['Manuais', 'Elétricas', 'Medição', 'Acessórios'] },
  { id: '7', name: 'Modas', slug: 'modas', icon: 'Shirt', color: 'green-dark', description: 'Tendências e peças essenciais para o seu guarda-roupa.', subcategories: ['Camisetas', 'Calças', 'Vestidos', 'Acessórios'] },
  { id: '8', name: 'Componentes de Computador', slug: 'componentes-computador', icon: 'Monitor', color: 'magenta', description: 'Hardware e periféricos para montar ou atualizar seu PC.', subcategories: ['Processadores', 'Placas de Vídeo', 'Memória RAM', 'Armazenamento'] },
  { id: '9', name: 'Eletrônicos', slug: 'eletronicos', icon: 'Headphones', color: 'blue', description: 'Gadgets, smartphones e acessórios eletrônicos.', subcategories: ['Smartphones', 'Fones', 'Tablets', 'Acessórios'] },
  { id: '10', name: 'Esportes', slug: 'esportes', icon: 'Dumbbell', color: 'teal', description: 'Equipamentos e acessórios para todas as modalidades esportivas.', subcategories: ['Musculação', 'Corrida', 'Natação', 'Futebol'] },
  { id: '11', name: 'Cozinha', slug: 'cozinha', icon: 'ChefHat', color: 'crimson', description: 'Utensílios e eletrodomésticos para facilitar o dia a dia na cozinha.', subcategories: ['Panelas', 'Utensílios', 'Eletrodomésticos', 'Organização'] },
  { id: '12', name: 'Aventura', slug: 'aventura', icon: 'Tent', color: 'khaki', description: 'Equipamentos para camping, trilhas e atividades ao ar livre.', subcategories: ['Barracas', 'Mochilas', 'Iluminação', 'Vestuário'] },
  { id: '13', name: 'Pesca', slug: 'pesca', icon: 'Fish', color: 'cyan', description: 'Varas, molinetes e acessórios para pescadores de todos os níveis.', subcategories: ['Varas', 'Molinetes', 'Iscas', 'Linhas'] },
  { id: '14', name: 'Pet Shop', slug: 'pet-shop', icon: 'PawPrint', color: 'purple', description: 'Rações, brinquedos e acessórios para seus pets.', subcategories: ['Ração', 'Brinquedos', 'Higiene', 'Acessórios'] },
  { id: '15', name: 'Brinquedos', slug: 'brinquedos', icon: 'Blocks', color: 'wine', description: 'Diversão garantida para crianças de todas as idades.', subcategories: ['Educativos', 'Bonecas', 'Veículos', 'Jogos'] },
];

export const products: Product[] = [
  { id: '1', name: 'Fone de Ouvido Bluetooth Premium', description: 'Fone de ouvido sem fio com cancelamento de ruído ativo e bateria de longa duração. Design ergonômico com almofadas macias, microfone integrado para chamadas com clareza cristalina e conexão Bluetooth 5.3 estável até 15 metros de distância.', price: 299.90, originalPrice: 449.90, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600', 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=600', 'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=600'], category: 'eletronicos', rating: 4.8, reviewCount: 234, seller: 'TechStore', stock: 50, isFeatured: true, isPromotion: true },
  { id: '2', name: 'Smartphone Ultra 5G', description: 'Smartphone de última geração com câmera de 108MP e tela AMOLED. Processador octa-core, 256GB de armazenamento e 12GB RAM. Bateria de 5000mAh com carregamento rápido de 65W.', price: 2499.00, originalPrice: 2999.00, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600', images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600', 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600', 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600'], category: 'eletronicos', rating: 4.9, reviewCount: 567, seller: 'MobileWorld', stock: 25, isFeatured: true, isPromotion: true },
  { id: '3', name: 'Camiseta Algodão Premium', description: 'Camiseta 100% algodão com acabamento premium e várias cores. Tecido macio e respirável, ideal para o dia a dia. Costuras reforçadas e modelagem moderna.', price: 79.90, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', 'https://images.unsplash.com/photo-1622445275576-721325763afe?w=600', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600'], category: 'modas', rating: 4.5, reviewCount: 189, seller: 'FashionBR', stock: 200 },
  { id: '4', name: 'Kit Ferramentas 150 Peças', description: 'Kit completo de ferramentas para casa e oficina com maleta organizadora. Inclui chaves de fenda, alicates, martelo, trena e muito mais. Material em aço cromo-vanádio.', price: 189.90, originalPrice: 249.90, image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600', images: ['https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600', 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600'], category: 'ferramentas', rating: 4.7, reviewCount: 342, seller: 'ToolMaster', stock: 75, isPromotion: true },
  { id: '5', name: 'Livro: A Arte de Programar', description: 'Best-seller sobre programação e desenvolvimento de software. Aborda conceitos fundamentais de algoritmos, estruturas de dados e boas práticas de engenharia de software.', price: 59.90, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600', images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600'], category: 'livros', rating: 4.9, reviewCount: 892, seller: 'BookStore', stock: 150, isFeatured: true },
  { id: '6', name: 'Sofá 3 Lugares Retrátil', description: 'Sofá confortável com assento retrátil e encosto reclinável. Estofamento em suede de alta qualidade, estrutura em madeira maciça e pés em alumínio escovado.', price: 1299.00, originalPrice: 1799.00, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600', images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600', 'https://images.unsplash.com/photo-1550254478-ead40cc54513?w=600', 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600'], category: 'casa', rating: 4.6, reviewCount: 156, seller: 'CasaMóveis', stock: 10, isPromotion: true },
  { id: '7', name: 'Placa de Vídeo RTX 4060', description: 'GPU de alta performance para jogos e trabalhos gráficos. 8GB GDDR6, Ray Tracing, DLSS 3.0. Ideal para gaming em 1440p com máxima qualidade.', price: 2199.00, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600', images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600'], category: 'componentes-computador', rating: 4.8, reviewCount: 423, seller: 'PCGamer', stock: 15, isFeatured: true },
  { id: '8', name: 'Tênis Running Pro', description: 'Tênis para corrida com amortecimento gel e design aerodinâmico. Solado em borracha de alta aderência, palmilha ortopédica e cabedal em mesh respirável.', price: 349.90, originalPrice: 449.90, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600', 'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=600'], category: 'esportes', rating: 4.7, reviewCount: 678, seller: 'SportMax', stock: 80, isPromotion: true },
  { id: '9', name: 'Panela Elétrica Multifuncional', description: 'Panela elétrica 6L com 10 funções programáveis. Timer digital, antiaderente, prepara arroz, feijão, sopas, carnes e muito mais.', price: 299.90, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600', images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600', 'https://images.unsplash.com/photo-1584990347449-a5d9f800a783?w=600'], category: 'cozinha', rating: 4.6, reviewCount: 234, seller: 'ChefHome', stock: 45 },
  { id: '10', name: 'Barraca de Camping 4 Pessoas', description: 'Barraca impermeável com proteção UV e fácil montagem. Coluna d\'água de 3000mm, costuras seladas e varetas em fibra de vidro.', price: 399.90, originalPrice: 549.90, image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600', images: ['https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600', 'https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=600'], category: 'aventura', rating: 4.5, reviewCount: 167, seller: 'AventureiroStore', stock: 30, isPromotion: true },
  { id: '11', name: 'Vara de Pesca Carbono 3m', description: 'Vara de pesca em carbono de alta resistência. Leve, flexível e durável. Ideal para pesca em água doce e salgada.', price: 249.90, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600', images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600', 'https://images.unsplash.com/photo-1532015889804-92320c4a6f4d?w=600'], category: 'pesca', rating: 4.4, reviewCount: 89, seller: 'PescaMax', stock: 40 },
  { id: '12', name: 'Ração Premium Cães Adultos 15kg', description: 'Ração super premium para cães adultos de todas as raças. Fórmula balanceada com proteínas de alta digestibilidade, ômega 3 e 6.', price: 179.90, originalPrice: 219.90, image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600', images: ['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600', 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600'], category: 'pet-shop', rating: 4.8, reviewCount: 456, seller: 'PetLove', stock: 100, isPromotion: true },
  { id: '13', name: 'LEGO Cidade Espacial 500 Peças', description: 'Kit LEGO temático de cidade espacial para crianças acima de 7 anos. Inclui 4 minifiguras, nave espacial e estação de lançamento.', price: 299.90, image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600', images: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600', 'https://images.unsplash.com/photo-1472457897821-70d561d07b09?w=600'], category: 'brinquedos', rating: 4.9, reviewCount: 234, seller: 'ToyWorld', stock: 25, isFeatured: true },
  { id: '14', name: 'Kit Óleo Motor Sintético 5L', description: 'Óleo sintético 5W30 para motores modernos. Alta proteção contra desgaste, economia de combustível e performance otimizada em todas as temperaturas.', price: 189.90, originalPrice: 229.90, image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=600', images: ['https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=600', 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600'], category: 'pecas-automotivas', rating: 4.7, reviewCount: 312, seller: 'AutoPeças', stock: 60, isPromotion: true },
];

/**
 * Mock API that simulates REST endpoints.
 * Used as fallback when VITE_API_URL is not configured.
 */
function delay(ms = 200) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const mockApi = {
  async getProducts(
    filters?: { category?: string; query?: string; minPrice?: number; maxPrice?: number; sortBy?: string },
    page = 1,
    limit = 12
  ): Promise<PaginatedResponse<Product>> {
    await delay(300);
    let filtered = [...products];

    if (filters?.category) filtered = filtered.filter(p => p.category === filters.category);
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

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
  {
    id: '5', name: 'Livros', slug: 'livros', icon: 'BookOpen', color: 'brown',
    description: 'Explore best-sellers, lançamentos e clássicos da literatura.',
    subcategories: ['Fantasia', 'Romance', 'Ficção científica', 'Terror', 'Suspense', 'Tecnologia / Programação', 'Negócios / Empreendedorismo', 'Desenvolvimento pessoal', 'História', 'Biografia', 'Infantil', 'HQ / Mangá'],
  },
  {
    id: '6', name: 'Ferramentas', slug: 'ferramentas', icon: 'Wrench', color: 'indigo',
    description: 'Ferramentas profissionais e domésticas para qualquer projeto.',
    subcategories: ['Furadeiras', 'Parafusadeiras', 'Chaves', 'Alicates', 'Ferramentas elétricas', 'Ferramentas manuais', 'Kits de ferramentas', 'Equipamentos de medição'],
  },
  {
    id: '7', name: 'Moda', slug: 'modas', icon: 'Shirt', color: 'green-dark',
    description: 'Tendências e peças essenciais para o seu guarda-roupa.',
    subcategories: ['Camisetas', 'Calças', 'Jaquetas', 'Vestidos', 'Sapatos', 'Tênis', 'Acessórios', 'Moda masculina', 'Moda feminina'],
  },
  { id: '8', name: 'Componentes de Computador', slug: 'componentes-computador', icon: 'Monitor', color: 'magenta', description: 'Hardware e periféricos para montar ou atualizar seu PC.', subcategories: ['Processadores', 'Placas de Vídeo', 'Memória RAM', 'Armazenamento'] },
  {
    id: '9', name: 'Eletrônicos', slug: 'eletronicos', icon: 'Headphones', color: 'blue',
    description: 'Gadgets, smartphones e acessórios eletrônicos.',
    subcategories: ['Smartphones', 'Fones de ouvido', 'Tablets', 'Smartwatch', 'Caixas de som', 'Câmeras', 'TVs', 'Monitores', 'Carregadores', 'Cabos e adaptadores'],
  },
  { id: '10', name: 'Esportes', slug: 'esportes', icon: 'Dumbbell', color: 'teal', description: 'Equipamentos e acessórios para todas as modalidades esportivas.', subcategories: ['Musculação', 'Corrida', 'Natação', 'Futebol'] },
  { id: '11', name: 'Cozinha', slug: 'cozinha', icon: 'ChefHat', color: 'crimson', description: 'Utensílios e eletrodomésticos para facilitar o dia a dia na cozinha.', subcategories: ['Panelas', 'Utensílios', 'Eletrodomésticos', 'Organização'] },
  { id: '12', name: 'Aventura', slug: 'aventura', icon: 'Tent', color: 'khaki', description: 'Equipamentos para camping, trilhas e atividades ao ar livre.', subcategories: ['Barracas', 'Mochilas', 'Iluminação', 'Vestuário'] },
  {
    id: '13', name: 'Pesca', slug: 'pesca', icon: 'Fish', color: 'cyan',
    description: 'Varas, molinetes e acessórios para pescadores de todos os níveis.',
    subcategories: ['Varas de pesca', 'Molinetes', 'Carretilhas', 'Linhas', 'Iscas artificiais', 'Iscas naturais', 'Anzóis', 'Boias', 'Caixas de pesca', 'Acessórios de pesca'],
  },
  {
    id: '14', name: 'Pet Shop', slug: 'pet-shop', icon: 'PawPrint', color: 'purple',
    description: 'Rações, brinquedos e acessórios para seus pets.',
    subcategories: ['Ração', 'Petiscos', 'Brinquedos', 'Camas e casinhas', 'Coleiras e guias', 'Higiene e limpeza', 'Medicamentos', 'Roupas para pets', 'Transporte (caixas / bolsas)'],
  },
  { id: '15', name: 'Brinquedos', slug: 'brinquedos', icon: 'Blocks', color: 'wine', description: 'Diversão garantida para crianças de todas as idades.', subcategories: ['Educativos', 'Bonecas', 'Veículos', 'Jogos'] },
];

export const products: Product[] = [
  // Eletrônicos
  { id: '1', name: 'Fone de Ouvido Bluetooth Premium', description: 'Fone de ouvido sem fio com cancelamento de ruído ativo e bateria de longa duração.', price: 299.90, originalPrice: 449.90, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600'], category: 'eletronicos', subcategory: 'Fones de ouvido', rating: 4.8, reviewCount: 234, seller: 'TechStore', stock: 50, isFeatured: true, isPromotion: true },
  { id: '2', name: 'Smartphone Ultra 5G', description: 'Smartphone de última geração com câmera de 108MP e tela AMOLED.', price: 2499.00, originalPrice: 2999.00, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600', images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600', 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600'], category: 'eletronicos', subcategory: 'Smartphones', rating: 4.9, reviewCount: 567, seller: 'MobileWorld', stock: 25, isFeatured: true, isPromotion: true },
  { id: '16', name: 'Tablet Pro 11"', description: 'Tablet com tela de 11 polegadas, processador potente e caneta stylus inclusa.', price: 1899.00, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600', category: 'eletronicos', subcategory: 'Tablets', rating: 4.7, reviewCount: 189, seller: 'TechStore', stock: 30 },
  { id: '17', name: 'Smartwatch Fitness Pro', description: 'Relógio inteligente com GPS, monitor cardíaco e mais de 100 modos de exercício.', price: 599.90, originalPrice: 799.90, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', category: 'eletronicos', subcategory: 'Smartwatch', rating: 4.6, reviewCount: 312, seller: 'TechStore', stock: 45, isPromotion: true },
  { id: '18', name: 'Caixa de Som Portátil 20W', description: 'Caixa de som Bluetooth à prova d\'água com 12h de bateria.', price: 199.90, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600', category: 'eletronicos', subcategory: 'Caixas de som', rating: 4.5, reviewCount: 156, seller: 'SoundMax', stock: 80 },
  { id: '19', name: 'Câmera Digital Mirrorless 4K', description: 'Câmera mirrorless com sensor full-frame e gravação em 4K 60fps.', price: 4299.00, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600', category: 'eletronicos', subcategory: 'Câmeras', rating: 4.9, reviewCount: 98, seller: 'FotoShop', stock: 12, isFeatured: true },

  // Moda
  { id: '3', name: 'Camiseta Algodão Premium', description: 'Camiseta 100% algodão com acabamento premium e várias cores.', price: 79.90, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', category: 'modas', subcategory: 'Camisetas', rating: 4.5, reviewCount: 189, seller: 'FashionBR', stock: 200 },
  { id: '20', name: 'Calça Jeans Slim Fit', description: 'Calça jeans com corte slim, confortável e moderna.', price: 149.90, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600', category: 'modas', subcategory: 'Calças', rating: 4.4, reviewCount: 267, seller: 'FashionBR', stock: 150 },
  { id: '21', name: 'Jaqueta Corta-Vento', description: 'Jaqueta leve e impermeável, ideal para dias chuvosos.', price: 199.90, originalPrice: 279.90, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600', category: 'modas', subcategory: 'Jaquetas', rating: 4.6, reviewCount: 134, seller: 'FashionBR', stock: 60, isPromotion: true },
  { id: '22', name: 'Tênis Casual Urbano', description: 'Tênis confortável para uso diário com design moderno.', price: 249.90, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600', category: 'modas', subcategory: 'Tênis', rating: 4.7, reviewCount: 423, seller: 'ShoesMax', stock: 90 },

  // Ferramentas
  { id: '4', name: 'Kit Ferramentas 150 Peças', description: 'Kit completo de ferramentas para casa e oficina com maleta organizadora.', price: 189.90, originalPrice: 249.90, image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600', category: 'ferramentas', subcategory: 'Kits de ferramentas', rating: 4.7, reviewCount: 342, seller: 'ToolMaster', stock: 75, isPromotion: true },
  { id: '23', name: 'Furadeira de Impacto 750W', description: 'Furadeira profissional com controle de velocidade e maleta com brocas.', price: 329.90, image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600', category: 'ferramentas', subcategory: 'Furadeiras', rating: 4.8, reviewCount: 198, seller: 'ToolMaster', stock: 40 },
  { id: '24', name: 'Parafusadeira sem Fio 12V', description: 'Parafusadeira compacta com bateria de lítio e 2 velocidades.', price: 199.90, image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600', category: 'ferramentas', subcategory: 'Parafusadeiras', rating: 4.5, reviewCount: 156, seller: 'ToolMaster', stock: 55 },
  { id: '25', name: 'Trena Digital a Laser 40m', description: 'Equipamento de medição a laser com precisão milimétrica e display LCD.', price: 149.90, image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600', category: 'ferramentas', subcategory: 'Equipamentos de medição', rating: 4.6, reviewCount: 89, seller: 'ToolMaster', stock: 35 },

  // Livros
  { id: '5', name: 'Livro: A Arte de Programar', description: 'Best-seller sobre programação e desenvolvimento de software.', price: 59.90, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600', category: 'livros', subcategory: 'Tecnologia / Programação', rating: 4.9, reviewCount: 892, seller: 'BookStore', stock: 150, isFeatured: true },
  { id: '26', name: 'O Senhor dos Anéis - Trilogia', description: 'A obra-prima da fantasia em edição especial com capa dura.', price: 129.90, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600', category: 'livros', subcategory: 'Fantasia', rating: 4.9, reviewCount: 1230, seller: 'BookStore', stock: 200, isFeatured: true },
  { id: '27', name: 'Romance ao Luar', description: 'Best-seller de romance contemporâneo que conquistou milhões de leitores.', price: 39.90, image: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600', category: 'livros', subcategory: 'Romance', rating: 4.5, reviewCount: 567, seller: 'BookStore', stock: 300 },
  { id: '28', name: 'Mindset: A Nova Psicologia do Sucesso', description: 'Transforme sua mentalidade e alcance resultados extraordinários.', price: 44.90, image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600', category: 'livros', subcategory: 'Desenvolvimento pessoal', rating: 4.7, reviewCount: 789, seller: 'BookStore', stock: 250 },
  { id: '29', name: 'Empreendedorismo Digital', description: 'Guia completo para iniciar seu negócio online do zero.', price: 54.90, image: 'https://images.unsplash.com/photo-1553729459-afe8f2e2ed65?w=600', category: 'livros', subcategory: 'Negócios / Empreendedorismo', rating: 4.6, reviewCount: 345, seller: 'BookStore', stock: 180 },
  { id: '40', name: 'Duna - Frank Herbert', description: 'O clássico da ficção científica em edição comemorativa.', price: 69.90, image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600', category: 'livros', subcategory: 'Ficção científica', rating: 4.8, reviewCount: 678, seller: 'BookStore', stock: 120 },
  { id: '41', name: 'It - A Coisa', description: 'O terror clássico de Stephen King em edição definitiva.', price: 79.90, image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600', category: 'livros', subcategory: 'Terror', rating: 4.7, reviewCount: 456, seller: 'BookStore', stock: 95 },

  // Casa
  { id: '6', name: 'Sofá 3 Lugares Retrátil', description: 'Sofá confortável com assento retrátil e encosto reclinável.', price: 1299.00, originalPrice: 1799.00, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600', category: 'casa', subcategory: 'Móveis', rating: 4.6, reviewCount: 156, seller: 'CasaMóveis', stock: 10, isPromotion: true },

  // Componentes de Computador
  { id: '7', name: 'Placa de Vídeo RTX 4060', description: 'GPU de alta performance para jogos e trabalhos gráficos.', price: 2199.00, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600', category: 'componentes-computador', subcategory: 'Placas de Vídeo', rating: 4.8, reviewCount: 423, seller: 'PCGamer', stock: 15, isFeatured: true },

  // Esportes
  { id: '8', name: 'Tênis Running Pro', description: 'Tênis para corrida com amortecimento gel e design aerodinâmico.', price: 349.90, originalPrice: 449.90, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', category: 'esportes', subcategory: 'Corrida', rating: 4.7, reviewCount: 678, seller: 'SportMax', stock: 80, isPromotion: true },

  // Cozinha
  { id: '9', name: 'Panela Elétrica Multifuncional', description: 'Panela elétrica 6L com 10 funções programáveis.', price: 299.90, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600', category: 'cozinha', subcategory: 'Eletrodomésticos', rating: 4.6, reviewCount: 234, seller: 'ChefHome', stock: 45 },

  // Aventura
  { id: '10', name: 'Barraca de Camping 4 Pessoas', description: 'Barraca impermeável com proteção UV e fácil montagem.', price: 399.90, originalPrice: 549.90, image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600', category: 'aventura', subcategory: 'Barracas', rating: 4.5, reviewCount: 167, seller: 'AventureiroStore', stock: 30, isPromotion: true },

  // Pesca
  { id: '11', name: 'Vara de Pesca Carbono 3m', description: 'Vara de pesca em carbono de alta resistência.', price: 249.90, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600', category: 'pesca', subcategory: 'Varas de pesca', rating: 4.4, reviewCount: 89, seller: 'PescaMax', stock: 40 },
  { id: '30', name: 'Molinete Shimano 4000', description: 'Molinete profissional com 6 rolamentos e sistema anti-reverso.', price: 349.90, image: 'https://images.unsplash.com/photo-1532015889804-92320c4a6f4d?w=600', category: 'pesca', subcategory: 'Molinetes', rating: 4.7, reviewCount: 134, seller: 'PescaMax', stock: 25 },
  { id: '31', name: 'Kit Iscas Artificiais 20 unid', description: 'Kit com 20 iscas artificiais variadas para pesca esportiva.', price: 89.90, image: 'https://images.unsplash.com/photo-1500463959177-e0869687df26?w=600', category: 'pesca', subcategory: 'Iscas artificiais', rating: 4.3, reviewCount: 67, seller: 'PescaMax', stock: 60 },
  { id: '32', name: 'Linha Multifilamento 300m', description: 'Linha de pesca multifilamento de alta resistência.', price: 69.90, image: 'https://images.unsplash.com/photo-1545450660-3378a7f3a364?w=600', category: 'pesca', subcategory: 'Linhas', rating: 4.5, reviewCount: 98, seller: 'PescaMax', stock: 100 },
  { id: '42', name: 'Carretilha Marine Sports', description: 'Carretilha de perfil baixo com freio magnético e 7 rolamentos.', price: 289.90, image: 'https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=600', category: 'pesca', subcategory: 'Carretilhas', rating: 4.6, reviewCount: 78, seller: 'PescaMax', stock: 20 },

  // Pet Shop
  { id: '12', name: 'Ração Premium Cães Adultos 15kg', description: 'Ração super premium para cães adultos de todas as raças.', price: 179.90, originalPrice: 219.90, image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600', category: 'pet-shop', subcategory: 'Ração', rating: 4.8, reviewCount: 456, seller: 'PetLove', stock: 100, isPromotion: true },
  { id: '33', name: 'Brinquedo Mordedor para Cães', description: 'Mordedor de borracha resistente e atóxico para cães.', price: 29.90, image: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=600', category: 'pet-shop', subcategory: 'Brinquedos', rating: 4.4, reviewCount: 234, seller: 'PetLove', stock: 200 },
  { id: '34', name: 'Cama Pet Ortopédica Grande', description: 'Cama ortopédica para cães de grande porte com espuma viscoelástica.', price: 189.90, image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600', category: 'pet-shop', subcategory: 'Camas e casinhas', rating: 4.6, reviewCount: 123, seller: 'PetLove', stock: 35 },
  { id: '35', name: 'Coleira Anti-Pulgas Ajustável', description: 'Coleira com proteção contra pulgas e carrapatos por até 8 meses.', price: 49.90, image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600', category: 'pet-shop', subcategory: 'Coleiras e guias', rating: 4.5, reviewCount: 345, seller: 'PetLove', stock: 150 },
  { id: '43', name: 'Petiscos Naturais para Cães 500g', description: 'Petiscos desidratados 100% naturais e sem conservantes.', price: 34.90, image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=600', category: 'pet-shop', subcategory: 'Petiscos', rating: 4.7, reviewCount: 189, seller: 'PetLove', stock: 120 },
  { id: '44', name: 'Kit Higiene Pet Completo', description: 'Kit com shampoo, condicionador e perfume para banho em casa.', price: 59.90, image: 'https://images.unsplash.com/photo-1583337130417-13104dec14a8?w=600', category: 'pet-shop', subcategory: 'Higiene e limpeza', rating: 4.3, reviewCount: 112, seller: 'PetLove', stock: 80 },

  // Brinquedos
  { id: '13', name: 'LEGO Cidade Espacial 500 Peças', description: 'Kit LEGO temático de cidade espacial para crianças acima de 7 anos.', price: 299.90, image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600', category: 'brinquedos', subcategory: 'Educativos', rating: 4.9, reviewCount: 234, seller: 'ToyWorld', stock: 25, isFeatured: true },

  // Peças Automotivas
  { id: '14', name: 'Kit Óleo Motor Sintético 5L', description: 'Óleo sintético 5W30 para motores modernos.', price: 189.90, originalPrice: 229.90, image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=600', category: 'pecas-automotivas', subcategory: 'Motor', rating: 4.7, reviewCount: 312, seller: 'AutoPeças', stock: 60, isPromotion: true },
];

// Apply default shipping to all products
const defaultShipping = { sul: 0, sudeste: 0, centroOeste: 0, norte: 25, nordeste: 20 };
products.forEach(p => { if (!p.shipping) p.shipping = { ...defaultShipping }; });


 * Mock API that simulates REST endpoints.
 * Used as fallback when VITE_API_URL is not configured.
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

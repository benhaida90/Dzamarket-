// Mock data for DzaMarket MVP

export const mockProducts = [
  {
    id: '1',
    title: 'Samsung Galaxy S24 Ultra',
    price: 180000,
    currency: 'DZD',
    category: 'Electronics',
    description: 'جهاز سامسونج جديد، حالة ممتازة، مع جميع الملحقات',
    images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'],
    seller: {
      id: 'seller1',
      name: 'محمد الأمين',
      avatar: 'https://ui-avatars.io/api/?name=Mohamed+Amine&background=16a34a&color=fff',
      rating: 4.8,
      followers: 1234,
      verified: true
    },
    location: 'Algiers, Algeria',
    likes: 45,
    comments: 12,
    views: 567,
    createdAt: '2025-01-15',
    status: 'available'
  },
  {
    id: '2',
    title: 'شقة للإيجار - 3 غرف',
    price: 45000,
    currency: 'DZD',
    category: 'Real Estate',
    description: 'شقة جميلة في حي راقي، قريبة من جميع المرافق',
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 'https://images.unsplash.com/photo-1502672260066-6bc35f0a1f70?w=800'],
    seller: {
      id: 'seller2',
      name: 'فاطمة زهرة',
      avatar: 'https://ui-avatars.io/api/?name=Fatima+Zahra&background=16a34a&color=fff',
      rating: 4.9,
      followers: 890,
      verified: true
    },
    location: 'Oran, Algeria',
    likes: 78,
    comments: 23,
    views: 1234,
    createdAt: '2025-01-10',
    status: 'available'
  },
  {
    id: '3',
    title: 'خروف العيد - حولي',
    price: 85000,
    currency: 'DZD',
    category: 'Animals',
    description: 'خروف بصحة ممتازة، وزن تقريبي 45 كلغ',
    images: ['https://images.unsplash.com/photo-1583537031470-89019dd84df4?w=800'],
    seller: {
      id: 'seller3',
      name: 'أحمد بن علي',
      avatar: 'https://ui-avatars.io/api/?name=Ahmed+Benali&background=16a34a&color=fff',
      rating: 4.7,
      followers: 456,
      verified: false
    },
    location: 'Constantine, Algeria',
    likes: 34,
    comments: 8,
    views: 345,
    createdAt: '2025-01-12',
    status: 'available'
  },
  {
    id: '4',
    title: 'سيارة رينو كليو 2020',
    price: 2500000,
    currency: 'DZD',
    category: 'Vehicles',
    description: 'سيارة نظيفة جداً، استعمال خفيف، الوثائق كاملة',
    images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800', 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800'],
    seller: {
      id: 'seller4',
      name: 'كريم الدين',
      avatar: 'https://ui-avatars.io/api/?name=Karim+Eddine&background=16a34a&color=fff',
      rating: 4.6,
      followers: 2345,
      verified: true
    },
    location: 'Annaba, Algeria',
    likes: 156,
    comments: 45,
    views: 2890,
    createdAt: '2025-01-08',
    status: 'available'
  },
  {
    id: '5',
    title: 'طاولة طعام خشبية فاخرة',
    price: 45000,
    currency: 'DZD',
    category: 'Furniture',
    description: 'طاولة جديدة، خشب زان أصلي، مع 6 كراسي',
    images: ['https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=800'],
    seller: {
      id: 'seller5',
      name: 'نبيل حمزة',
      avatar: 'https://ui-avatars.io/api/?name=Nabil+Hamza&background=16a34a&color=fff',
      rating: 4.5,
      followers: 567,
      verified: false
    },
    location: 'Blida, Algeria',
    likes: 23,
    comments: 5,
    views: 234,
    createdAt: '2025-01-14',
    status: 'available'
  }
];

export const mockCategories = [
  { 
    id: 'electronics', 
    name: {
      ar: 'الإلكترونيات',
      fr: 'Électronique',
      en: 'Electronics'
    },
    icon: 'Smartphone', 
    count: 1234 
  },
  { 
    id: 'vehicles', 
    name: {
      ar: 'السيارات',
      fr: 'Véhicules',
      en: 'Vehicles'
    },
    icon: 'Car', 
    count: 890 
  },
  { 
    id: 'real-estate', 
    name: {
      ar: 'العقارات',
      fr: 'Immobilier',
      en: 'Real Estate'
    },
    icon: 'Home', 
    count: 567 
  },
  { 
    id: 'animals', 
    name: {
      ar: 'الحيوانات',
      fr: 'Animaux',
      en: 'Animals'
    },
    icon: 'Dog', 
    count: 234 
  },
  { 
    id: 'furniture', 
    name: {
      ar: 'الأثاث',
      fr: 'Meubles',
      en: 'Furniture'
    },
    icon: 'Armchair', 
    count: 456 
  },
  { 
    id: 'clothing', 
    name: {
      ar: 'الملابس',
      fr: 'Vêtements',
      en: 'Clothing'
    },
    icon: 'Shirt', 
    count: 789 
  },
  { 
    id: 'food', 
    name: {
      ar: 'المواد الغذائية',
      fr: 'Alimentation',
      en: 'Food'
    },
    icon: 'UtensilsCrossed', 
    count: 345 
  },
  { 
    id: 'crafts', 
    name: {
      ar: 'الحرف اليدوية',
      fr: 'Artisanat',
      en: 'Crafts'
    },
    icon: 'Sparkles', 
    count: 123 
  }
];

export const mockUser = {
  id: 'user1',
  name: 'يوسف بن محمد',
  email: 'youcef@example.com',
  avatar: 'https://ui-avatars.io/api/?name=Youcef+Ben&background=16a34a&color=fff',
  isPremium: false,
  verified: true,
  phone: '+213 555 123 456',
  location: 'Algiers, Algeria',
  joinedDate: '2024-06-15',
  followers: 234,
  following: 156,
  totalSales: 12,
  totalPurchases: 8,
  rating: 4.7,
  referralCode: 'YOUCEF2025',
  referralEarnings: 1250.50,
  level1Referrals: 5,
  level2Referrals: 12
};

export const mockComments = [
  {
    id: 'c1',
    userId: 'user2',
    userName: 'سارة بنت أحمد',
    userAvatar: 'https://ui-avatars.io/api/?name=Sara+Ahmed&background=16a34a&color=fff',
    comment: 'ما شاء الله، المنتج يبدو ممتاز! هل السعر قابل للتفاوض؟',
    timestamp: '2025-01-16T10:30:00',
    likes: 3
  },
  {
    id: 'c2',
    userId: 'user3',
    userName: 'خالد العربي',
    userAvatar: 'https://ui-avatars.io/api/?name=Khaled+Arabi&background=16a34a&color=fff',
    comment: 'هل التوصيل متاح لولاية وهران؟',
    timestamp: '2025-01-16T11:15:00',
    likes: 1
  }
];

export const mockReferrals = [
  {
    id: 'ref1',
    name: 'أمينة زروق',
    joinDate: '2024-12-20',
    level: 1,
    totalTransactions: 8,
    yourEarnings: 450.25,
    status: 'active'
  },
  {
    id: 'ref2',
    name: 'رضا بلعيد',
    joinDate: '2024-12-25',
    level: 1,
    totalTransactions: 5,
    yourEarnings: 280.50,
    status: 'active'
  },
  {
    id: 'ref3',
    name: 'ليلى مصطفى',
    joinDate: '2025-01-05',
    level: 2,
    totalTransactions: 3,
    yourEarnings: 135.75,
    status: 'active'
  }
];

export const mockTransactions = [
  {
    id: 'tx1',
    type: 'purchase',
    productTitle: 'Samsung Galaxy A54',
    amount: 65000,
    status: 'completed',
    date: '2025-01-10',
    seller: 'محمد الأمين'
  },
  {
    id: 'tx2',
    type: 'sale',
    productTitle: 'طاولة خشبية',
    amount: 35000,
    status: 'in_escrow',
    date: '2025-01-14',
    buyer: 'فاطمة زهرة'
  },
  {
    id: 'tx3',
    type: 'referral_earning',
    productTitle: 'عمولة إحالة - المستوى 1',
    amount: 162.50,
    status: 'completed',
    date: '2025-01-15',
    referredUser: 'أمينة زروق'
  }
];
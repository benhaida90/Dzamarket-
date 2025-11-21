import { useState } from 'react';
import Header from '../components/Header';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { mockProducts, mockCategories } from '../utils/mock';
import { 
  Heart, MessageCircle, Eye, MapPin, ShieldCheck, 
  TrendingUp, Sparkles, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Home = ({ user, onLogout }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('all');
  const [likedProducts, setLikedProducts] = useState([]);

  const toggleLike = (productId) => {
    if (likedProducts.includes(productId)) {
      setLikedProducts(likedProducts.filter(id => id !== productId));
    } else {
      setLikedProducts([...likedProducts, productId]);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-DZ', {
      style: 'decimal',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Categories Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <Button 
              variant={activeTab === 'all' ? 'default' : 'outline'}
              onClick={() => setActiveTab('all')}
              className={activeTab === 'all' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {t('categories.all')}
            </Button>
            {mockCategories.map((category) => (
              <Button
                key={category.id}
                variant={activeTab === category.id ? 'default' : 'outline'}
                onClick={() => setActiveTab(category.id)}
                className={`whitespace-nowrap ${activeTab === category.id ? 'bg-green-600 hover:bg-green-700' : ''}`}
              >
                {typeof category.name === 'object' ? category.name[t('common.dzamarket').includes('Market') ? 'en' : t('common.dzamarket').includes('DzaMarket') ? 'ar' : 'fr'] : category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Filter Tabs */}
        <Tabs defaultValue="recent" className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-3 mx-auto">
            <TabsTrigger value="recent" className="gap-2">
              <Clock className="h-4 w-4" />
              {t('filters.recent')}
            </TabsTrigger>
            <TabsTrigger value="trending" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              {t('filters.trending')}
            </TabsTrigger>
            <TabsTrigger value="featured" className="gap-2">
              <Sparkles className="h-4 w-4" />
              {t('filters.featured')}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow product-card border-0">
              {/* Product Image */}
              <Link to={`/product/${product.id}`}>
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 right-3 bg-white text-gray-900 border-0">
                    {product.category}
                  </Badge>
                </div>
              </Link>

              {/* Product Info */}
              <div className="p-4">
                {/* Seller Info */}
                <Link to={`/seller/${product.seller.id}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={product.seller.avatar} />
                      <AvatarFallback className="bg-green-600 text-white text-xs">
                        {product.seller.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-semibold truncate">{product.seller.name}</p>
                        {product.seller.verified && (
                          <ShieldCheck className="h-4 w-4 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        ⭐ {product.seller.rating} • {product.seller.followers} متابع
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Product Title */}
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-bold text-lg mb-2 line-clamp-2 hover:text-green-600 transition-colors">
                    {product.title}
                  </h3>
                </Link>

                {/* Price */}
                <div className="mb-3">
                  <p className="text-2xl font-bold text-green-600">
                    {formatPrice(product.price)} <span className="text-sm">DZD</span>
                  </p>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                  <MapPin className="h-4 w-4" />
                  <span>{product.location}</span>
                </div>

                {/* Engagement Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 hover:text-red-500"
                    onClick={() => toggleLike(product.id)}
                  >
                    <Heart 
                      className={`h-4 w-4 ${likedProducts.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} 
                    />
                    <span>{product.likes + (likedProducts.includes(product.id) ? 1 : 0)}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{product.comments}</span>
                  </Button>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{product.views}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg" className="min-w-[200px]">
            {t('common.viewMore')}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Home;
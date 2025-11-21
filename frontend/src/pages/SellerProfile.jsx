import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { mockProducts, mockUser } from '../utils/mock';
import { 
  MapPin, ShieldCheck, Users, Package, Star, 
  MessageCircle, Share2, Heart, Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const SellerProfile = ({ user, onLogout }) => {
  const { id } = useParams();
  const seller = mockUser; // In real app, fetch seller by ID
  const sellerProducts = mockProducts.filter(p => p.seller.id === id).length > 0 
    ? mockProducts.filter(p => p.seller.id === id)
    : mockProducts.slice(0, 3); // Mock data
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(seller.followers);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setFollowerCount(isFollowing ? followerCount - 1 : followerCount + 1);
    toast.success(isFollowing ? 'تم إلغاء المتابعة' : 'تم متابعة البائع');
  };

  const handleMessage = () => {
    toast.info('فتح محادثة مع البائع...');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('تم نسخ رابط الملف الشخصي');
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
        {/* Profile Header */}
        <Card className="p-6 mb-6 border-0 shadow-lg">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <Avatar className="h-32 w-32 border-4 border-green-600">
                <AvatarImage src={seller.avatar} />
                <AvatarFallback className="bg-green-600 text-white text-4xl">
                  {seller.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold">{seller.name}</h1>
                    {seller.verified && (
                      <ShieldCheck className="h-6 w-6 text-green-600" />
                    )}
                    {seller.isPremium && (
                      <Badge className="premium-badge">Premium</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <MapPin className="h-4 w-4" />
                    <span>{seller.location}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleFollow}
                    className={`gap-2 ${isFollowing ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                  >
                    <Users className="h-4 w-4" />
                    {isFollowing ? 'متابع' : 'متابعة'}
                  </Button>
                  <Button onClick={handleMessage} variant="outline" className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    رسالة
                  </Button>
                  <Button onClick={handleShare} variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">المتابعون</span>
                  </div>
                  <p className="text-2xl font-bold">{followerCount}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Package className="h-4 w-4" />
                    <span className="text-sm">المنتجات</span>
                  </div>
                  <p className="text-2xl font-bold">{sellerProducts.length}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Star className="h-4 w-4" />
                    <span className="text-sm">التقييم</span>
                  </div>
                  <p className="text-2xl font-bold">{seller.rating}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Package className="h-4 w-4" />
                    <span className="text-sm">المبيعات</span>
                  </div>
                  <p className="text-2xl font-bold">{seller.totalSales}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Products Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="products">المنتجات</TabsTrigger>
            <TabsTrigger value="reviews">التقييمات</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sellerProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow product-card border-0">
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

                  <div className="p-4">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-bold text-lg mb-2 line-clamp-2 hover:text-green-600 transition-colors">
                        {product.title}
                      </h3>
                    </Link>

                    <div className="mb-3">
                      <p className="text-2xl font-bold text-green-600">
                        {formatPrice(product.price)} <span className="text-sm">DZD</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <MapPin className="h-4 w-4" />
                      <span>{product.location}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-3">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>{product.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{product.comments}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{product.views}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <Card className="p-6 border-0 shadow-lg">
              <div className="text-center py-8">
                <Star className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">لا توجد تقييمات بعد</p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SellerProfile;
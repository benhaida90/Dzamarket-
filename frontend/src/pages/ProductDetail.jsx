import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
import { mockProducts, mockComments } from '../utils/mock';
import { 
  Heart, MessageCircle, Share2, MapPin, ShieldCheck, 
  Eye, Clock, AlertCircle, Send
} from 'lucide-react';
import { toast } from 'sonner';

const ProductDetail = ({ user, onLogout }) => {
  const { id } = useParams();
  const product = mockProducts.find(p => p.id === id) || mockProducts[0];
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(mockComments);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-DZ', {
      style: 'decimal',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleBuyNow = () => {
    toast.success('تم بدء عملية الشراء بنظام الضمان');
  };

  const handleContactSeller = () => {
    toast.info('فتح محادثة مع البائع...');
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;
    
    const newComment = {
      id: 'c' + (comments.length + 1),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      comment: comment,
      timestamp: new Date().toISOString(),
      likes: 0
    };
    
    setComments([newComment, ...comments]);
    setComment('');
    toast.success('تم إضافة تعليقك');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('تم نسخ رابط المنتج');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden border-0 shadow-lg">
              {/* Main Image */}
              <div className="aspect-square bg-gray-100">
                <img
                  src={selectedImage}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnail Images */}
              <div className="p-4">
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(image)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === image ? 'border-green-600' : 'border-gray-200'
                      }`}
                    >
                      <img src={image} alt={`${product.title} ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Product Description */}
            <Card className="mt-6 p-6 border-0 shadow-lg">
              <h2 className="text-xl font-bold mb-4">وصف المنتج</h2>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </Card>

            {/* Comments Section */}
            <Card className="mt-6 p-6 border-0 shadow-lg">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                التعليقات ({comments.length})
              </h2>

              {/* Add Comment */}
              <div className="mb-6">
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-green-600 text-white">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="أضف تعليق..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      className="mb-2"
                    />
                    <Button 
                      onClick={handleAddComment}
                      className="bg-green-600 hover:bg-green-700 gap-2"
                      disabled={!comment.trim()}
                    >
                      <Send className="h-4 w-4" />
                      إرسال
                    </Button>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={c.userAvatar} />
                      <AvatarFallback className="bg-green-600 text-white text-xs">
                        {c.userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="font-semibold text-sm mb-1">{c.userName}</p>
                        <p className="text-gray-700">{c.comment}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <button className="hover:text-red-500 flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {c.likes > 0 && c.likes}
                        </button>
                        <button className="hover:text-green-600">رد</button>
                        <span>{new Date(c.timestamp).toLocaleDateString('ar-DZ')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column - Product Info & Actions */}
          <div className="lg:col-span-1">
            <Card className="p-6 border-0 shadow-lg sticky top-20">
              {/* Category Badge */}
              <Badge className="mb-4">{product.category}</Badge>

              {/* Title */}
              <h1 className="text-2xl font-bold mb-4">{product.title}</h1>

              {/* Price */}
              <div className="mb-6">
                <p className="text-4xl font-bold text-green-600">
                  {formatPrice(product.price)}
                  <span className="text-lg ml-2">DZD</span>
                </p>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <MapPin className="h-5 w-5" />
                <span>{product.location}</span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{product.views} مشاهدة</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>منذ {new Date(product.createdAt).toLocaleDateString('ar-DZ')}</span>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Seller Info */}
              <Link to={`/seller/${product.seller.id}`}>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-6 hover:bg-gray-100 transition-colors">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={product.seller.avatar} />
                    <AvatarFallback className="bg-green-600 text-white">
                      {product.seller.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <p className="font-semibold">{product.seller.name}</p>
                      {product.seller.verified && (
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      ⭐ {product.seller.rating} • {product.seller.followers} متابع
                    </p>
                  </div>
                </div>
              </Link>

              {/* Escrow Notice */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900 text-sm mb-1">حماية بنظام الضمان</p>
                    <p className="text-xs text-green-700">
                      أموالك محفوظة حتى تستلم المنتج وتؤكد استلامه
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={handleBuyNow}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-12"
                >
                  اشتري الآن
                </Button>
                <Button 
                  onClick={handleContactSeller}
                  variant="outline" 
                  className="w-full h-12"
                >
                  تواصل مع البائع
                </Button>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setLiked(!liked)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Heart className={`h-5 w-5 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="flex-1"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { 
  Heart, MessageCircle, Share2, ShoppingCart, 
  X, ChevronUp, ChevronDown, Filter, ShieldCheck
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Shorts = ({ user }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [liked, setLiked] = useState({});
  const videoRefs = useRef([]);
  const startTimeRef = useRef(Date.now());

  // Fetch videos
  useEffect(() => {
    fetchVideos();
    fetchCategories();
  }, [selectedCategory]);

  // Auto-play current video
  useEffect(() => {
    if (videoRefs.current[currentIndex]) {
      videoRefs.current[currentIndex].play();
      startTimeRef.current = Date.now();
    }
    
    // Pause other videos
    videoRefs.current.forEach((video, index) => {
      if (video && index !== currentIndex) {
        video.pause();
      }
    });

    // Track view when video changes
    if (videos[currentIndex]) {
      trackView(currentIndex);
    }
  }, [currentIndex, videos]);

  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem('dzamarket_token');
      const response = await axios.get(
        `${API}/shorts/feed${selectedCategory ? `?category=${selectedCategory}` : ''}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setVideos(response.data.data.products);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to load videos');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/shorts/categories`);
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const trackView = async (index) => {
    const video = videos[index];
    if (!video) return;

    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    
    try {
      const token = localStorage.getItem('dzamarket_token');
      await axios.post(
        `${API}/shorts/track-view`,
        { 
          product_id: video.id,
          duration: duration
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const handleNext = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Load more videos
      fetchVideos();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleLike = async (videoId) => {
    setLiked({ ...liked, [videoId]: !liked[videoId] });
    toast.success(liked[videoId] ? t('toast.unliked') : t('toast.liked'));
  };

  const handleBuyNow = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    setShowCategoryFilter(false);
    setCurrentIndex(0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-DZ', {
      style: 'decimal',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (videos.length === 0) {
    return (
      <div className=\"min-h-screen bg-black flex items-center justify-center\">
        <div className=\"text-white text-center\">
          <p className=\"text-xl mb-4\">{t('shorts.noVideos')}</p>
          <Button onClick={() => navigate('/')} className=\"bg-green-600 hover:bg-green-700\">
            {t('shorts.backToHome')}
          </Button>
        </div>
      </div>
    );
  }

  const currentVideo = videos[currentIndex];

  return (
    <div className=\"relative h-screen w-screen bg-black overflow-hidden\">
      {/* Close Button */}
      <button
        onClick={() => navigate('/')}
        className=\"absolute top-4 right-4 z-50 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors\"
      >
        <X className=\"h-6 w-6 text-white\" />
      </button>

      {/* Category Filter Button */}
      <button
        onClick={() => setShowCategoryFilter(!showCategoryFilter)}
        className=\"absolute top-4 left-4 z-50 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors\"
      >
        <Filter className=\"h-6 w-6 text-white\" />
      </button>

      {/* Category Filter Menu */}
      {showCategoryFilter && (
        <div className=\"absolute top-16 left-4 z-50 bg-black/90 rounded-lg p-4 max-w-xs\">
          <h3 className=\"text-white font-bold mb-3\">{t('shorts.categories')}</h3>
          <div className=\"space-y-2\">
            <Button
              onClick={() => handleCategoryFilter(null)}
              variant={selectedCategory === null ? 'default' : 'outline'}
              className={`w-full justify-start ${selectedCategory === null ? 'bg-green-600' : 'bg-white/10 text-white border-white/30'}`}
            >
              {t('categories.all')}
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                onClick={() => handleCategoryFilter(cat.name)}
                variant={selectedCategory === cat.name ? 'default' : 'outline'}
                className={`w-full justify-start ${selectedCategory === cat.name ? 'bg-green-600' : 'bg-white/10 text-white border-white/30'}`}
              >
                {cat.name} ({cat.videoCount})
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Video Container */}
      <div className=\"relative h-full w-full flex items-center justify-center\">
        {videos.map((video, index) => (
          <div
            key={video.id}
            className={`absolute inset-0 transition-opacity duration-300 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Video or Image placeholder */}
            {video.videos && video.videos.length > 0 ? (
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                src={video.videos[0]}
                className=\"h-full w-full object-contain\"
                loop
                playsInline
                onClick={(e) => {
                  if (e.target.paused) {
                    e.target.play();
                  } else {
                    e.target.pause();
                  }
                }}
              />
            ) : (
              <img
                src={video.images[0]}
                alt={video.title}
                className=\"h-full w-full object-contain\"
              />
            )}

            {/* Gradient Overlay */}
            <div className=\"absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70\" />

            {/* Product Info Overlay */}
            <div className=\"absolute bottom-0 left-0 right-0 p-6 pb-20\">
              {/* Seller Info */}
              <div className=\"flex items-center gap-3 mb-4\">
                <Avatar className=\"h-12 w-12 border-2 border-white\">
                  <AvatarImage src={video.seller.avatar} />
                  <AvatarFallback className=\"bg-green-600 text-white\">
                    {video.seller.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className=\"flex-1\">
                  <div className=\"flex items-center gap-2\">
                    <p className=\"text-white font-bold\">{video.seller.name}</p>
                    {video.seller.verified && (
                      <ShieldCheck className=\"h-4 w-4 text-green-400\" />
                    )}
                    {video.seller.isPremium && (
                      <Badge className=\"premium-badge text-xs\">Premium</Badge>
                    )}
                  </div>
                  <p className=\"text-white/80 text-sm\">{video.location}</p>
                </div>
                <Button 
                  size=\"sm\" 
                  className=\"bg-green-600 hover:bg-green-700 text-white\"
                >
                  {t('common.follow')}
                </Button>
              </div>

              {/* Product Title */}
              <h2 className=\"text-white text-xl font-bold mb-2 line-clamp-2\">
                {video.title}
              </h2>

              {/* Price */}
              <div className=\"flex items-center gap-3 mb-4\">
                <p className=\"text-3xl font-bold text-green-400\">
                  {formatPrice(video.price)} <span className=\"text-lg\">DZD</span>
                </p>
                <Badge className=\"bg-white/20 text-white border-0\">
                  {video.category}
                </Badge>
              </div>

              {/* Buy Button */}
              <Button
                onClick={() => handleBuyNow(video.id)}
                className=\"w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12\"
              >
                <ShoppingCart className=\"h-5 w-5 mr-2\" />
                {t('common.buyNow')}
              </Button>
            </div>

            {/* Action Buttons (Right Side) */}
            <div className=\"absolute right-4 bottom-32 flex flex-col gap-6\">
              {/* Like */}
              <button
                onClick={() => handleLike(video.id)}
                className=\"flex flex-col items-center gap-1\"
              >
                <div className=\"p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors\">
                  <Heart 
                    className={`h-7 w-7 ${liked[video.id] ? 'fill-red-500 text-red-500' : 'text-white'}`}
                  />
                </div>
                <span className=\"text-white text-sm font-medium\">
                  {video.likes + (liked[video.id] ? 1 : 0)}
                </span>
              </button>

              {/* Comment */}
              <button
                onClick={() => navigate(`/product/${video.id}`)}
                className=\"flex flex-col items-center gap-1\"
              >
                <div className=\"p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors\">
                  <MessageCircle className=\"h-7 w-7 text-white\" />
                </div>
                <span className=\"text-white text-sm font-medium\">
                  {video.comments || 0}
                </span>
              </button>

              {/* Share */}
              <button className=\"flex flex-col items-center gap-1\">
                <div className=\"p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors\">
                  <Share2 className=\"h-7 w-7 text-white\" />
                </div>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className=\"absolute right-1/2 translate-x-1/2 bottom-6 flex gap-4 z-40\">
        <Button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          size=\"icon\"
          className=\"bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full h-12 w-12\"
        >
          <ChevronUp className=\"h-6 w-6\" />
        </Button>
        <Button
          onClick={handleNext}
          size=\"icon\"
          className=\"bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full h-12 w-12\"
        >
          <ChevronDown className=\"h-6 w-6\" />
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className=\"absolute bottom-2 left-1/2 -translate-x-1/2 text-white/60 text-sm\">
        {currentIndex + 1} / {videos.length}
      </div>
    </div>
  );
};

export default Shorts;

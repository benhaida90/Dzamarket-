import { useState } from 'react';
import Header from '../components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { mockUser, mockReferrals, mockTransactions } from '../utils/mock';
import { 
  Package, DollarSign, Users, TrendingUp, Copy, 
  CheckCircle, Clock, XCircle, Crown, Share2, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = ({ user, onLogout }) => {
  const [referralCode] = useState(mockUser.referralCode);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-DZ', {
      style: 'decimal',
      minimumFractionDigits: 2
    }).format(price);
  };

  const copyReferralCode = () => {
    const referralLink = `https://dzamarket.dz/register?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast.success('تم نسخ رابط الإحالة');
  };

  const shareReferral = () => {
    const referralLink = `https://dzamarket.dz/register?ref=${referralCode}`;
    const message = `انضم إلى DzaMarket وابدأ بالبيع والشراء بأمان! استخدم رمزي: ${referralLink}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'DzaMarket',
        text: message,
        url: referralLink
      });
    } else {
      copyReferralCode();
    }
  };

  const upgradeToPremium = () => {
    toast.info('سيتم فتح صفحة الاشتراك المميز...');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_escrow':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'in_escrow':
        return 'في الضمان';
      case 'cancelled':
        return 'ملغى';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">لوحة التحكم</h1>
          <p className="text-gray-600">إدارة حسابك ومبيعاتك وأرباحك</p>
        </div>

        {/* Premium Upgrade Banner */}
        {!mockUser.isPremium && (
          <Card className="mb-6 border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Crown className="h-12 w-12 text-yellow-500" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      ارتقي إلى الحساب المميز
                    </h3>
                    <p className="text-sm text-gray-600">
                      احصل على مزايا حصرية: عمولات أقل، إعلانات مميزة، وتحليلات متقدمة
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={upgradeToPremium}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                >
                  اشترك الآن
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">إجمالي المبيعات</CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{mockUser.totalSales}</div>
              <p className="text-xs text-gray-500 mt-1">منتج مباع</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">أرباح الإحالة</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {formatPrice(mockUser.referralEarnings)}
                <span className="text-sm ml-1">DZD</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">من الإحالات</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">إحالات المستوى 1</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{mockUser.level1Referrals}</div>
              <p className="text-xs text-gray-500 mt-1">مستخدم محال</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">إحالات المستوى 2</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{mockUser.level2Referrals}</div>
              <p className="text-xs text-gray-500 mt-1">مستخدم محال</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="referrals" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3">
            <TabsTrigger value="referrals">نظام الإحالة</TabsTrigger>
            <TabsTrigger value="transactions">المعاملات</TabsTrigger>
            <TabsTrigger value="products">منتجاتي</TabsTrigger>
          </TabsList>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="space-y-6">
            {/* Referral Code Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>رمز الإحالة الخاص بك</CardTitle>
                <CardDescription>
                  شارك رمزك مع الأصدقاء واكسب 0.25% من كل معاملاتهم
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={`https://dzamarket.dz/register?ref=${referralCode}`}
                    readOnly
                    className="font-mono"
                  />
                  <Button onClick={copyReferralCode} className="gap-2 bg-green-600 hover:bg-green-700">
                    <Copy className="h-4 w-4" />
                    نسخ
                  </Button>
                  <Button onClick={shareReferral} variant="outline" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    مشاركة
                  </Button>
                </div>

                {/* Referral Info */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex gap-2">
                    <AlertCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <p className="font-semibold mb-1">كيف يعمل نظام الإحالة؟</p>
                      <ul className="space-y-1 text-xs">
                        <li>• اكسب 0.25% من معاملات المستوى 1 (المحالون مباشرة)</li>
                        <li>• اكسب 0.25% من معاملات المستوى 2 (محالو المحالين)</li>
                        <li>• أرباح غير محدودة من البيع والشراء</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Referrals List */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>إحالاتك ({mockReferrals.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockReferrals.map((ref) => (
                    <div key={ref.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold">{ref.name}</p>
                        <p className="text-sm text-gray-500">
                          انضم في {new Date(ref.joinDate).toLocaleDateString('ar-DZ')} • المستوى {ref.level}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          {formatPrice(ref.yourEarnings)} DZD
                        </p>
                        <p className="text-xs text-gray-500">
                          {ref.totalTransactions} معاملة
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>سجل المعاملات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(tx.status)}
                        <div>
                          <p className="font-semibold">{tx.productTitle}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(tx.date).toLocaleDateString('ar-DZ')} • {getStatusText(tx.status)}
                          </p>
                          {tx.type === 'purchase' && (
                            <p className="text-xs text-gray-500">البائع: {tx.seller}</p>
                          )}
                          {tx.type === 'sale' && (
                            <p className="text-xs text-gray-500">المشتري: {tx.buyer}</p>
                          )}
                          {tx.type === 'referral_earning' && (
                            <p className="text-xs text-gray-500">من: {tx.referredUser}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          tx.type === 'purchase' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {tx.type === 'purchase' ? '-' : '+'}{formatPrice(tx.amount)} DZD
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {tx.type === 'purchase' ? 'شراء' : tx.type === 'sale' ? 'بيع' : 'إحالة'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12">
                <div className="text-center">
                  <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold mb-2">لم تضف منتجات بعد</h3>
                  <p className="text-gray-500 mb-6">ابدأ بإضافة منتجاتك للبيع على DzaMarket</p>
                  <Button className="bg-green-600 hover:bg-green-700">
                    إضافة منتج جديد
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
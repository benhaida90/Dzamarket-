import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { mockUser } from '../utils/mock';
import { Store, Mail, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Mock login - في الإصدار النهائي سيتم استبدال هذا بـ API حقيقي
    setTimeout(() => {
      if (email && password) {
        const token = 'mock_jwt_token_' + Date.now();
        localStorage.setItem('dzamarket_token', token);
        localStorage.setItem('dzamarket_user', JSON.stringify(mockUser));
        onLogin(mockUser);
        toast.success(t('toast.loginSuccess'));
        navigate('/');
      } else {
        toast.error(t('toast.fillAllFields'));
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white p-4">
      <div className="w-full max-w-md">
        {/* Language Switcher - Top Right */}
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Store className="h-10 w-10 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-900">{t('common.dzamarket')}</h1>
          </div>
          <p className="text-gray-600">{t('common.tagline')}</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">{t('auth.loginTitle')}</CardTitle>
            <CardDescription className="text-center">
              {t('auth.loginDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                disabled={loading}
              >
                {loading ? t('common.loading') : t('common.login')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {t('auth.noAccount')}{' '}
                <Link to="/register" className="text-green-600 hover:text-green-700 font-semibold">
                  {t('auth.registerNow')}
                </Link>
              </p>
            </div>

            {/* Demo credentials */}
            <div className="mt-6 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-green-800 text-center">
                <strong>{t('auth.demoNotice')}</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          © 2025 {t('common.dzamarket')}. {t('common.allRightsReserved')}
        </p>
      </div>
    </div>
  );
};

export default Login;
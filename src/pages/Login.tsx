import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Flower2, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Verificação direta solicitada (Hardcoded)
    if (email === 'Gabryel.souza177@gmail.com' && password === '13102001m') {
      // Salvar Sessão no localStorage
      localStorage.setItem('admin_session', JSON.stringify({
        email: email,
        authenticated: true,
        loginDate: new Date().toISOString()
      }));

      toast({
        title: 'Acesso Autorizado',
        description: 'Bem-vindo de volta!',
        className: 'bg-emerald text-white border-none',
      });
      
      navigate('/admin');
    } else {
      toast({
        title: 'Erro de Acesso',
        description: 'Acesso negado para Flor do Campo',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-gold/10 rounded-full blur-3xl" />

      <Card className="w-full max-w-sm border-2 border-primary/20 shadow-xl relative z-10 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary via-gold to-primary" />
        <CardHeader className="text-center space-y-1 pb-6">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 border-2 border-primary/20">
            <Flower2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-serif text-primary">Painel Flor do Campo</CardTitle>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Acesso Restrito</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase font-bold text-muted-foreground">E-mail de Acesso</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="bg-muted/30 border-primary/20 focus-visible:ring-primary pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs uppercase font-bold text-muted-foreground">Senha de Acesso</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-muted/30 border-primary/20 focus-visible:ring-primary pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-xs h-12 transition-all active:scale-95" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Verificando...
                </>
              ) : (
                'Entrar no Painel'
              )}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
              Desenvolvido para Floricultura Flor do Campo
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

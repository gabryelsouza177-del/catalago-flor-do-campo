import { Input } from '@/components/ui/input';
import { Search, ShoppingBag, User } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';
import logo from '@/assets/logo.jpg';
import { useCart } from '@/hooks/useCart';
import { CartSheet } from './CartSheet';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Link } from 'react-router-dom';

interface CatalogHeaderProps {
  search: string;
  onSearchChange: (val: string) => void;
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
}

export function CatalogHeader({ search, onSearchChange, activeCategory, onCategoryChange }: CatalogHeaderProps) {
  const items = useCart((state) => state.items);
  const { isOpen } = useSiteSettings();
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-accent/10">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Top row: logo + search + actions */}
        <div className="flex items-center gap-4 py-4">
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-3">
              <div className="border border-accent/20 rounded-full p-0.5">
                <img src={logo} alt="Floricultura Flor do Campo" className="h-10 w-10 rounded-full object-cover" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base md:text-lg font-bold text-primary tracking-[0.3em] uppercase font-sans">
                  Flor do Campo
                </h1>
                <p className="text-[8px] tracking-[0.3em] uppercase text-accent font-sans font-bold">
                  Floricultura &amp; Presentes
                </p>
              </div>
            </Link>
          </div>

          <div className="relative flex-1 max-w-md mx-auto hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-accent/30" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 bg-muted/20 border-accent/10 focus:border-accent/20 text-foreground placeholder:text-muted-foreground/30 h-9 rounded-sm font-light text-xs"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Link 
              to="/meus-pedidos"
              className="p-2 text-accent/60 hover:text-accent transition-colors duration-200 flex items-center gap-1.5"
              title="Meus Pedidos"
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:inline text-[9px] uppercase tracking-widest font-bold">Meus Pedidos</span>
            </Link>

            {!isOpen ? (
              <div className="p-2 text-accent/20 cursor-not-allowed" title="Loja temporariamente fechada">
                <ShoppingBag className="h-5 w-5" />
              </div>
            ) : (
              <CartSheet>
                <button className="relative p-2 text-accent/60 hover:text-accent transition-colors duration-200">
                  <ShoppingBag className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-primary text-[9px] text-primary-foreground font-bold flex items-center justify-center rounded-full border border-primary/20">
                      {itemCount}
                    </span>
                  )}
                </button>
              </CartSheet>
            )}
          </div>
        </div>

        {/* Search for mobile */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-accent/30" />
            <Input
              placeholder="Buscar flores..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 bg-muted/20 border-accent/10 focus:border-accent/20 text-foreground placeholder:text-muted-foreground/30 h-9 rounded-sm font-light text-xs"
            />
          </div>
        </div>

        {/* Category nav */}
        <nav className="flex gap-2 overflow-x-auto scrollbar-hide py-4 -mt-1 items-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`whitespace-nowrap px-4 py-2 text-[9px] font-sans font-bold uppercase tracking-[0.15em] transition-all duration-300 rounded-full ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:bg-muted/30 hover:text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

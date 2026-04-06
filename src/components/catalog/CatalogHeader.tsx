import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';
import logo from '@/assets/logo.jpg';

interface CatalogHeaderProps {
  search: string;
  onSearchChange: (val: string) => void;
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
}

export function CatalogHeader({ search, onSearchChange, activeCategory, onCategoryChange }: CatalogHeaderProps) {
  return (
    <header className="sticky top-0 z-30 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-5 space-y-5">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="gold-border rounded-full p-0.5 gold-glow">
            <img src={logo} alt="Floricultura Flor do Campo" className="h-12 w-12 rounded-full object-cover" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-accent tracking-tight font-serif">
              Flor do Campo
            </h1>
            <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-sans font-light">
              Floricultura &amp; Presentes
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent/60" />
          <Input
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-11 bg-muted/50 border-border focus:border-accent/40 focus:ring-accent/20 text-foreground placeholder:text-muted-foreground/60 h-11"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-4 py-2 rounded text-xs font-medium whitespace-nowrap transition-all duration-300 tracking-wide uppercase font-sans ${
                activeCategory === cat
                  ? 'bg-accent text-accent-foreground gold-glow'
                  : 'gold-border text-muted-foreground hover:text-accent hover:border-accent/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

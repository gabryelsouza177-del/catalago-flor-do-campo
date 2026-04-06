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
    <header className="sticky top-0 z-30 glass">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="gold-border rounded-full p-0.5 gold-glow">
            <img src={logo} alt="Floricultura Flor do Campo" className="h-11 w-11 rounded-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-accent tracking-[0.25em] uppercase">
              Flor do Campo
            </h1>
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-sans font-light mt-0.5">
              Floricultura &amp; Presentes
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent/50" />
          <Input
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-11 bg-muted/40 border-border/50 focus:border-accent/30 focus:ring-accent/15 text-foreground placeholder:text-muted-foreground/50 h-11 rounded-lg font-light text-sm"
          />
        </div>

        {/* Categories — minimal text with gold underline */}
        <nav className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`gold-underline pb-1 text-xs font-sans font-medium whitespace-nowrap tracking-[0.15em] uppercase transition-colors duration-300 ${
                activeCategory === cat
                  ? 'active text-accent'
                  : 'text-muted-foreground hover:text-foreground'
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
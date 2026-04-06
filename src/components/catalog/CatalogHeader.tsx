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
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Flower2 className="h-7 w-7 text-primary" />
          <h1 className="text-xl md:text-2xl font-bold text-primary tracking-tight">
            Floricultura Flor do Campo
          </h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
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

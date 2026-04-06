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
    <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-accent/10">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Top row: logo + search */}
        <div className="flex items-center gap-4 py-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="border border-accent/20 rounded-full p-0.5">
              <img src={logo} alt="Floricultura Flor do Campo" className="h-10 w-10 rounded-full object-cover" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base md:text-lg font-medium text-accent tracking-[0.3em] uppercase font-sans">
                Flor do Campo
              </h1>
              <p className="text-[8px] tracking-[0.3em] uppercase text-muted-foreground font-sans font-light">
                Floricultura &amp; Presentes
              </p>
            </div>
          </div>

          <div className="relative flex-1 max-w-md ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-accent/30" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 bg-muted/20 border-accent/10 focus:border-accent/20 text-foreground placeholder:text-muted-foreground/30 h-9 rounded-sm font-light text-xs"
            />
          </div>
        </div>

        {/* Category nav */}
        <nav className="flex gap-1 overflow-x-auto scrollbar-hide pb-3 -mt-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`whitespace-nowrap px-3 py-1.5 text-[9px] font-sans font-medium uppercase tracking-[0.15em] transition-colors duration-150 min-h-[28px] border-b-2 ${
                activeCategory === cat
                  ? 'text-accent border-accent/60'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
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

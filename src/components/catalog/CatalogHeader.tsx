import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import logo from '@/assets/logo.jpg';

interface CatalogHeaderProps {
  search: string;
  onSearchChange: (val: string) => void;
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
}

export function CatalogHeader({ search, onSearchChange }: CatalogHeaderProps) {
  return (
    <header className="sticky top-0 z-30 glass">
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center gap-5">
        {/* Logo */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="gold-border rounded-full p-0.5 gold-glow">
            <img src={logo} alt="Floricultura Flor do Campo" className="h-11 w-11 rounded-full object-cover img-warm" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg md:text-xl font-semibold text-accent tracking-[0.3em] uppercase font-serif">
              Flor do Campo
            </h1>
            <p className="text-[8px] tracking-[0.35em] uppercase text-muted-foreground font-sans font-light mt-0.5">
              Floricultura &amp; Presentes
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent/40" />
          <Input
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-11 bg-muted/30 border-accent/10 focus:border-accent/25 focus:ring-accent/10 text-foreground placeholder:text-muted-foreground/40 h-10 rounded-full font-light text-sm"
          />
        </div>
      </div>
    </header>
  );
}

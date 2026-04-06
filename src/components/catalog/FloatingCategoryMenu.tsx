import { CATEGORIES } from '@/lib/constants';

interface FloatingCategoryMenuProps {
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
}

export function FloatingCategoryMenu({ activeCategory, onCategoryChange }: FloatingCategoryMenuProps) {
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 glass rounded-full px-2 py-2 gold-border gold-glow flex gap-1 overflow-x-auto max-w-[92vw] scrollbar-hide">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          className={`whitespace-nowrap px-4 py-2 rounded-full text-[10px] font-sans font-medium uppercase tracking-[0.15em] transition-all duration-400 min-h-[36px] ${
            activeCategory === cat
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
          }`}
        >
          {cat}
        </button>
      ))}
    </nav>
  );
}

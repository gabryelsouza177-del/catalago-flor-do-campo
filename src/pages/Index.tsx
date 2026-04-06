import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CatalogHeader } from '@/components/catalog/CatalogHeader';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { useProducts, useRealtimeProducts } from '@/hooks/useProducts';
import { Settings } from 'lucide-react';

export default function Index() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const { data: products, isLoading } = useProducts();

  useRealtimeProducts();

  const filtered = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      if (!p.active) return false;
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.description?.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = category === 'Todos' || p.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  return (
    <div className="min-h-screen bg-background">
      <CatalogHeader
        search={search}
        onSearchChange={setSearch}
        activeCategory={category}
        onCategoryChange={setCategory}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <ProductGrid products={filtered} loading={isLoading} />
      </main>

      <footer className="border-t border-border mt-12 py-6 text-center text-xs text-muted-foreground">
        <p>© 2026 Floricultura Flor do Campo · Todos os direitos reservados</p>
        <Link to="/admin" className="inline-flex items-center gap-1 mt-2 hover:text-primary transition-colors">
          <Settings className="h-3 w-3" />
          Painel Admin
        </Link>
      </footer>
    </div>
  );
}

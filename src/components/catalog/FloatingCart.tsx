import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { CartSheet } from "./CartSheet";
import { useState, useEffect } from "react";

export function FloatingCart() {
  const items = useCart((state) => state.items);
  const [isVisible, setIsVisible] = useState(false);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    if (itemCount > 0) {
      setIsVisible(true);
    }
  }, [itemCount]);

  if (!isVisible || itemCount === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CartSheet>
        <button className="relative group h-14 w-14 rounded-full bg-emerald text-accent shadow-2xl shadow-emerald/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300">
          <ShoppingCart className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
          
          <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-accent text-emerald text-[10px] font-bold flex items-center justify-center border-2 border-emerald shadow-lg animate-in zoom-in duration-500">
            {itemCount}
          </span>
          
          <div className="absolute inset-0 rounded-full bg-emerald animate-ping opacity-20 pointer-events-none" />
        </button>
      </CartSheet>
    </div>
  );
}

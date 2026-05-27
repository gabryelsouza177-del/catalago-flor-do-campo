import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import { useState } from "react";
import { CartSheet } from "./CartSheet";

export function AddToCartModal() {
  const { isModalOpen, setModalOpen } = useCart();
  const { isOpen } = useSiteSettings();
  const [showCart, setShowCart] = useState(false);

  const handleFinishOrder = () => {
    if (!isOpen) {
      setModalOpen(false);
      return;
    }
    setModalOpen(false);
    // We want to open the CartSheet after closing the modal
    setTimeout(() => {
      setShowCart(true);
    }, 100);
  };

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[400px] bg-background border-accent/20 p-6">
          <DialogHeader className="flex flex-col items-center gap-4 py-4">
            <div className="h-16 w-16 rounded-full bg-emerald/10 flex items-center justify-center animate-in zoom-in duration-300">
              <CheckCircle2 className="h-10 w-10 text-emerald" />
            </div>
            <DialogTitle className="text-xl font-sans font-bold uppercase tracking-widest text-accent text-center">
              Item adicionado!
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground font-light">
              Seu produto foi adicionado ao carrinho com sucesso.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-3 pt-4">
            <Button 
              onClick={() => setModalOpen(false)}
              variant="outline"
              className="w-full h-12 border-accent/20 text-accent font-sans uppercase tracking-widest hover:bg-accent/5 transition-all duration-300"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continuar Comprando
            </Button>
            
            <Button 
              onClick={handleFinishOrder}
              className="w-full h-12 bg-emerald text-accent font-sans uppercase tracking-widest hover:bg-emerald/80 transition-all duration-300 shadow-lg shadow-emerald/10"
            >
              Finalizar Pedido
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CartSheet open={showCart} onOpenChange={setShowCart}>
        <div className="hidden" />
      </CartSheet>
    </>
  );
}

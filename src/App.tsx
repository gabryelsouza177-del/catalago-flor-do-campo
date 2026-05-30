import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import Sucesso from "./pages/Sucesso";
import MyOrder from "./pages/MyOrder";
import MyOrdersList from "./pages/MyOrdersList";
import NotFound from "./pages/NotFound";
import { FloatingCart } from "./components/catalog/FloatingCart";
import { AddToCartModal } from "./components/catalog/AddToCartModal";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <FloatingCart />
        <AddToCartModal />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/sucesso" element={<Sucesso />} />
          <Route path="/pedido-confirmado" element={<Sucesso />} />
          <Route path="/meu-pedido/:id" element={<MyOrder />} />
          <Route path="/meus-pedidos" element={<MyOrdersList />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

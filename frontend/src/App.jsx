import { Route, Routes } from "react-router-dom";

import AdminPage from "./pages/AdminPage";
import CategoryPage from "./pages/CategoryPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";

import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import LoadingSpinner from "./components/LoadingSpinner";
import Navbar from "./components/Navbar";
import CartPage from "./pages/CartPage";
import PurchaseCancelPage from "./pages/PurchaseCancel";
import PurchaseSuccessPage from "./pages/PurchaseSuccess";
import useCartStore from "./store/useCartStore";
import { useUserStore } from "./store/useUserStore";

function App() {
  const { user, checkAuth, checkingAuth } = useUserStore();
  const { getCartItems } = useCartStore();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!user) return;

    getCartItems();
  }, [getCartItems, user]);

  if (checkingAuth) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.3)_0%,rgba(10,80,60,0.2)_45%,rgba(0,0,0,0.1)_100%)]" />
        </div>
      </div>

      <div className="relative z-50 pt-20">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/signup"
            element={!user ? <SignUpPage /> : <HomePage />}
          />
          <Route
            path="/login"
            element={!user ? <LoginPage /> : <HomePage />}
          />
          <Route
            path="/secret-dashboard"
            element={
              user?.role === "admin" ? <AdminPage /> : <LoginPage />
            }
          />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route
            path="/cart"
            element={user ? <CartPage /> : <LoginPage />}
          />
          <Route
            path="/purchase-success"
            element={user ? <PurchaseSuccessPage /> : <LoginPage />}
          />
          <Route
            path="/purchase-cancel"
            element={user ? <PurchaseCancelPage /> : <LoginPage />}
          />
        </Routes>
      </div>
      <Toaster />
    </div>
  );
}

export default App;

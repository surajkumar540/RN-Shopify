import { Product, WishlistContextType } from "@/constants/types";
import { useAuth } from "@clerk/clerk-expo";
import { createContext, useContext, useEffect, useState } from "react";
import api from "@/constants/api";

const WishListContext = createContext<WishlistContextType | undefined>(undefined);

export function WishListProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn } = useAuth();  // ← add isSignedIn
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishList = async () => {
    if (!isSignedIn) return;  // ← guard
    setLoading(true);
    try {
      const token = await getToken();
      const { data } = await api.get("/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setWishlist(data.data);
    } catch (error) {
      console.log("fetchWishList error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (product: Product) => {
    if (!isSignedIn) return;
    const exists = wishlist.some((p) => p._id === product._id);
    setWishlist((prev) =>
      exists ? prev.filter((p) => p._id !== product._id) : [...prev, product]
    );
    try {
      const token = await getToken();
      await api.post(
        "/wishlist/toggle",
        { productId: product._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.log("toggleWishlist error:", error);
      setWishlist((prev) =>
        exists ? [...prev, product] : prev.filter((p) => p._id !== product._id)
      );
    }
  };

  const isInWishlist = (productId: string) =>
    wishlist.some((p) => p._id === productId);

  useEffect(() => {
    fetchWishList();
  }, [isSignedIn]);  // ← re-run when auth state changes

  return (
    <WishListContext.Provider value={{ wishlist, loading, isInWishlist, toggleWishlist }}>
      {children}
    </WishListContext.Provider>
  );
}

export function useWishList() {
  const context = useContext(WishListContext);
  if (!context) throw new Error("useWishList must be used within a WishListProvider");
  return context;
}
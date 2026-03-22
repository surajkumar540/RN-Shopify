import api from "@/constants/api";
import { Product } from "@/constants/types";
import { SignedIn, useAuth } from "@clerk/clerk-expo";
import { createContext, useContext, useEffect, useState } from "react";
import Toast from "react-native-toast-message";

export type CartItem = {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  size?: string;
  price: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: Product, size?: string) => Promise<void>;
  removeFromCart: (itemId: string, size?: string) => Promise<void>;
  updateQuantity: (
    itemId: string,
    quantity: number,
    size?: string,
  ) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  itemCount: number;
  isLoading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);
  const fetchCart = async () => {
    try {
      const token = await getToken();
      const { data } = await api.get("/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data?.success) {
        const serverCart = data?.data;
        const mappedItems: CartItem[] = serverCart.items.map((item: any) => ({
          id: item.product._id,
          productId: item.product._id,
          product: item.product,
          quantity: item.quantity,
          size: item.size,
          price: item.product.price,
        }));
        setCartItems(mappedItems);
        setCartTotal(serverCart.totalAmount);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Failed to fetch cart",
        text2: error.response.data.message || "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product: Product, size?: string) => {
    if (!isSignedIn) {
      return Toast.show({
        type: "error",
        text1: "Please login to add items to cart",
      });
    }
    try {
      setIsLoading(true);
      const token = await getToken();
      const { data } = await api.post(
        "/cart/add",
        {
          productId: product._id,
          quantity: 1,
          size,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (data?.success) {
        Toast.show({
          type: "success",
          text1: "Item added to cart",
        });
        fetchCart();
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Failed to add item to cart",
        text2: error.response.data.message || "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: string, size?: string) => {
    if (!isSignedIn) return;

    try {
      setIsLoading(true);
      const token = await getToken();
      const { data } = await api.delete(`/cart/item/${itemId}?size=${size}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data?.success) {
        Toast.show({
          type: "success",
          text1: "Item removed from cart",
        });
        fetchCart();
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Failed to remove item from cart",
        text2: error.response.data.message || "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (
    itemId: string,
    quantity: number,
    size?: string,
  ) => {
    // API call to update item quantity in cart
    if (!isSignedIn) return;
    if (quantity < 1) return;

    try {
      setIsLoading(true);
      const token = await getToken();
      const { data } = await api.put(
        `/cart/item/${itemId}`,
        { quantity, size },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (data?.success) {
        Toast.show({
          type: "success",
          text1: "Item quantity updated successfully",
        });
        fetchCart();
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Failed to update item quantity",
        text2: error.response.data.message || "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    // API call to clear cart
    if (!isSignedIn) return;

    try {
      setIsLoading(true);
      const token = await getToken();
      const { data } = await api.delete("/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data?.success) {
        Toast.show({
          type: "success",
          text1: "Cart cleared successfully",
        });
        setCartItems([]);
        setCartTotal(0);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Failed to clear cart",
        text2: error.response.data.message || "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (isSignedIn) {
      fetchCart();
    } else {
      setCartItems([]);
      setCartTotal(0);
    }
  }, [isSignedIn]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        itemCount,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

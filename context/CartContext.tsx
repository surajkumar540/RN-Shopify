import { dummyCart, dummyWishlist } from "@/assets/assets";
import { Product } from "@/constants/types";
import { createContext, useContext, useEffect, useState } from "react";


export type CartItem = {
    id: string,
    productId: string,
    product: Product,
    quantity: number,
    size?: string,
    price: number
}

type CartContextType = {
    cartItems: CartItem[],
    addToCart: (product: Product, size?: string) => Promise<void>;
    removeFromCart: (itemId: string, size?: string) => Promise<void>;
    updateQuantity: (itemId: string, quantity: number, size?: string) => Promise<void>;
    clearCart: () => Promise<void>;
    cartTotal: number;
    itemCount: number;
    isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {

    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [cartTotal, setCartTotal] = useState(0);

    const fetchCart = async () => {
        setIsLoading(true);
        const serverCart = dummyCart;
        const mappedItems: CartItem[] = serverCart.items.map((item: any) => ({
            id: item.product._id,
            productId: item.product._id,
            product: item.product,
            quantity: item.quantity,
            size: item.size,
            price: item.product.price
        }));
        setCartItems(mappedItems);
        setCartTotal(serverCart.totalAmount)
        setIsLoading(false);
    }

    const addToCart = async (product: Product, size?: string) => {
        // API call to add item to cart
        await fetchCart();
    }

    const removeFromCart = async (itemId: string, size?: string) => {
        // API call to remove item from cart
        await fetchCart();
    }

    const updateQuantity = async (itemId: string, quantity: number, size?: string) => {
        // API call to update item quantity in cart
        await fetchCart();
    }

    const clearCart = async () => {
        // API call to clear cart
        await fetchCart();
    }

    useEffect(() => {
        fetchCart();
    }, []);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, itemCount: cartItems.length, isLoading }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider")
    }
    return context;
}
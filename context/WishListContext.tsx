import { dummyWishlist } from "@/assets/assets";
import { Product, WishlistContextType } from "@/constants/types";
import { createContext, useContext, useEffect, useState } from "react";

const WishListContext = createContext<WishlistContextType | undefined>(undefined)

export function WishListProvider({ children }: { children: React.ReactNode }) {

    const [wishlist, setWishlist] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)

    const fetchWishList = async () => {
        setLoading(true)
        setWishlist(dummyWishlist)
        setLoading(false)
    }

    const toggleWishlist = (product: Product) => {
        setWishlist((prev) => {
            const exists = wishlist.some((p) => p._id === product._id)
            if (exists) {
                return prev.filter((p) => p._id !== product._id)
            }
            return [...prev, product]
        })
    }


    const isInWishlist = (productId: string) => {
        return wishlist.some((p) => p._id === productId)
    }

    useEffect(() => {
        fetchWishList()
    }, []);



    return (
        <WishListContext.Provider value={{ wishlist, loading, isInWishlist, toggleWishlist }}>
            {children}
        </WishListContext.Provider>
    )
}

export function useWishList() {
    const context = useContext(WishListContext);
    if (!context) {
        throw new Error("useWishList must be used within a WishListProvider")
    }
    return context;
}
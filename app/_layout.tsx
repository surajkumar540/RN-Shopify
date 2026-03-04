import { Stack } from "expo-router";
import "@/global.css";
import { CartProvider } from "@/context/CartContext";
import { WishListProvider } from "@/context/WishListContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CartProvider>
        <WishListProvider>
          <Stack screenOptions={{
            headerShown: false
          }} />
        </WishListProvider>
      </CartProvider>
    </GestureHandlerRootView>
  )
}

import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "expo-router";
import { Address } from "@/constants/types";
import { dummyAddress } from "@/assets/assets";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants";
import Header from "@/components/Header";
import { ScrollView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-expo";
import api from "@/constants/api";

export default function Checkout() {
  const { getToken } = useAuth();
  const { cartTotal, clearCart } = useCart();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [selectAddress, setSelectAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "stripe">("cash");

  const shipping = 2.0;
  const tax = 0;
  const total = cartTotal + shipping + tax;

  const fetchAddresses = async () => {
    try {
      const token = await getToken();
      const { data } = await api.get("/addresses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const addrList = data?.data;

      if (addrList.length > 0) {
        const def = addrList.find((a: any) => a.isDefault || addrList[0]);
        setSelectAddress(def as Address);
      }
    } catch (error) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load checkout information",
      });
    } finally {
      setPageLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectAddress) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please add a shipping address",
      });
      return;
    }
    if (paymentMethod === "stripe") {
      return Toast.show({
        type: "error",
        text1: "Info",
        text2: "Stripe not implemented yet",
      });
    }

    setLoading(true);
    try {
      const payload = {
        shippingAddress: selectAddress,
        notes: "Placed via App",
        paymentMethod: "cash",
      };

      const token = await getToken();
      const { data } = await api.post("/orders", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data?.success) {
        await clearCart();
        Toast.show({
          type: "success",
          text1: "Order Placed",
          text2: "Your order has been placed successfully",
        });
        router.replace("/orders");
      }
    } catch (error) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to place order",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  if (pageLoading) {
    return (
      <SafeAreaView className="flex-1 bg-surface justify-center items-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className=" bg-surface flex-1" edges={["top"]}>
      <Header title="Checkout" showBack />

      <ScrollView className="flex-1 mt-4">
        <View className="px-2">
          <Text className="text-lg font-bold text-primary mb-4">
            Shipping Address
          </Text>
          {selectAddress ? (
            <View className="bg-white p-4 rounded-xl mb-6 shadow-md">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-base font-bold">
                  {selectAddress.type}
                </Text>
                <TouchableOpacity onPress={() => router.push("/addresses")}>
                  <Text className="text-accent text-sm">Change</Text>
                </TouchableOpacity>
              </View>
              <Text className="text-secondary leading-5">
                {selectAddress.street}, {selectAddress.city},{"\n"}
                {selectAddress.state} - {selectAddress.zipCode},{"\n"}
                {selectAddress.country}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              className="bg-white p-6 rounded-xl mb-6 items-center justify-center border-dashed border-2 border-gray-100"
              onPress={() => router.push("/addresses")}
            >
              <Text className="text-primary font-bold">Add Address</Text>
            </TouchableOpacity>
          )}

          {/* Payment Section */}
          <Text className="text-lg font-bold text-primary mb-4">
            Payment Method
          </Text>

          {/* Cash on Delivery */}
          <TouchableOpacity
            className={`bg-white p-4 rounded-xl mb-4 shadow-sm flex-row items-center border-2 ${paymentMethod === "cash" ? "border-primary" : "border-transparent"}`}
            onPress={() => setPaymentMethod("cash")}
          >
            <Ionicons
              name="cash-outline"
              size={24}
              color={COLORS.primary}
              className="mr-3"
            />

            <View className="ml-3 flex-1">
              <Text className="text-base font-bold text-primary">
                Cash on Delivery
              </Text>
              <Text className="text-secondary mt-1 text-xs">
                Pay when you receive the order
              </Text>
            </View>
            {paymentMethod === "cash" && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={COLORS.primary}
              />
            )}
          </TouchableOpacity>

          {/* Stripe Options */}

          <TouchableOpacity
            className={`bg-white p-4 rounded-xl mb-4 shadow-sm flex-row items-center border-2 ${paymentMethod === "stripe" ? "border-primary" : "border-transparent"}`}
            onPress={() => setPaymentMethod("stripe")}
          >
            <Ionicons
              name="cash-outline"
              size={24}
              color={COLORS.primary}
              className="mr-3"
            />

            <View className="ml-3 flex-1">
              <Text className="text-base font-bold text-primary">
                Pay with Card
              </Text>
              <Text className="text-secondary mt-1 text-xs">
                Credit or Debit Card
              </Text>
            </View>
            {paymentMethod === "stripe" && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={COLORS.primary}
              />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Order Summary */}
      <View className="p-4 bg-white shadow-lg border-t border-gray-100">
        <Text className="text-lg font-bold text-primary mb-4">
          Order Summary
        </Text>

        {/* Subtotal */}
        <View className="flex-row justify-between mb-2">
          <Text className="text-secondary">Subtotal</Text>
          <Text className="font-bold">${cartTotal.toFixed(2)}</Text>
        </View>

        {/* Shipping */}
        <View className="flex-row justify-between mb-2">
          <Text className="text-secondary">Shipping</Text>
          <Text className="font-bold">${shipping.toFixed(2)}</Text>
        </View>

        {/* Tax */}
        <View className="flex-row justify-between mb-4">
          <Text className="text-secondary">Tax</Text>
          <Text className="font-bold">${tax.toFixed(2)}</Text>
        </View>

        {/* Total */}
        <View className="flex-row justify-between mb-6">
          <Text className="text-primary text-xl font-bold">Total</Text>
          <Text className="text-primary text-xl fon-bold">
            ${total.toFixed(2)}
          </Text>
        </View>

        {/* Place Order Button */}
        <TouchableOpacity
          className={`p-4 rounded-xl items-center ${loading ? "bg-gray-400" : "bg-primary"}`}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={"white"} />
          ) : (
            <Text className="text-white font-bold text-lg">Place Order</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

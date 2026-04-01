import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList, Text, TouchableOpacity, View,
  ActivityIndicator, ScrollView, Image, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { COLORS, getStatusColor } from "@/constants";
import type { Order } from "@/constants/types";
import { formatDate } from "@/assets/assets";
import { useAuth } from "@clerk/clerk-expo";
import api from "@/constants/api";

export default function Orders() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = await getToken();
      const { data } = await api.get("/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data?.success) {
        setOrders(data.data);
      }
    } catch (error: any) {
      console.log(error);
      Alert.alert("Error", "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <Header title="My Orders" showBack />

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Ionicons name="bag-outline" size={64} color={COLORS.secondary} />
          <Text className="text-secondary text-lg mt-4">No orders found</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-white p-4 rounded-xl mb-4 border border-gray-100 shadow-sm"
              onPress={() => router.push(`/orders/${item._id}`)}
            >
              {/* Order Number + Date */}
              <View className="flex-row justify-between mb-2">
                <Text className="text-primary font-bold">#{item.orderNumber}</Text>
                <Text className="text-secondary text-sm">{formatDate(item.createdAt)}</Text>
              </View>

              {/* Status Badges */}
              <View className="flex-row gap-2 mb-3">
                <View className={`px-2 py-1 rounded-full ${getStatusColor(item.orderStatus ?? "placed")}`}>
                  <Text className="text-xs font-bold capitalize">{item.orderStatus ?? "placed"}</Text>
                </View>
                <View className={`px-2 py-1 rounded-full ${item.paymentStatus === "paid" ? "bg-green-100" : "bg-gray-100"}`}>
                  <Text className={`text-xs font-bold capitalize ${item.paymentStatus === "paid" ? "text-green-700" : "text-gray-700"}`}>
                    {item.paymentStatus}
                  </Text>
                </View>
              </View>

              {/* Payment Method */}
              <Text className="text-secondary text-xs mb-3">
                Payment: <Text className="text-primary font-medium capitalize">{item.paymentMethod}</Text>
              </Text>

              {/* Product Images */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                {item.items.map((prod: any, idx: number) => {
                  const image = prod.product?.images?.[0];
                  return (
                    <View key={idx} className="mr-2 items-center">
                      {image ? (
                        <Image
                          source={{ uri: image }}
                          className="w-14 h-14 rounded-lg"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-14 h-14 bg-gray-200 rounded-lg justify-center items-center">
                          <Ionicons name="image-outline" size={20} color={COLORS.secondary} />
                        </View>
                      )}
                      <Text className="text-xs text-secondary mt-1" numberOfLines={1}>
                        {prod.name}
                      </Text>
                      <Text className="text-xs text-gray-400">x{prod.quantity} • {prod.size}</Text>
                    </View>
                  );
                })}
              </ScrollView>

              {/* Total */}
              <View className="flex-row justify-between items-center mt-2 pt-3 border-t border-gray-100">
                <Text className="text-secondary text-sm">Items: {item.items.length}</Text>
                <Text className="text-primary font-bold text-lg">${item.totalAmount.toFixed(2)}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
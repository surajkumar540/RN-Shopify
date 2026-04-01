import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList, Text, TouchableOpacity, View,
  ActivityIndicator, Image, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { COLORS } from "@/constants";
import type { Order } from "@/constants/types";
import { formatDate } from "@/assets/assets";
import { useAuth } from "@clerk/clerk-expo";
import api from "@/constants/api";

const STATUS_CONFIG: Record<string, { textColor: string; bgColor: string; icon: any }> = {
  placed:     { textColor: "text-indigo-600",  bgColor: "bg-indigo-50",  icon: "receipt-outline" },
  processing: { textColor: "text-amber-600",   bgColor: "bg-amber-50",   icon: "refresh-outline" },
  shipped:    { textColor: "text-blue-600",    bgColor: "bg-blue-50",    icon: "airplane-outline" },
  delivered:  { textColor: "text-emerald-600", bgColor: "bg-emerald-50", icon: "checkmark-circle-outline" },
  cancelled:  { textColor: "text-red-500",     bgColor: "bg-red-50",     icon: "close-circle-outline" },
};

const STATUS_BAR_COLOR: Record<string, string> = {
  placed:     "bg-indigo-500",
  processing: "bg-amber-500",
  shipped:    "bg-blue-500",
  delivered:  "bg-emerald-500",
  cancelled:  "bg-red-500",
};

const PAYMENT_CONFIG: Record<string, { textColor: string; bgColor: string }> = {
  paid:    { textColor: "text-emerald-700", bgColor: "bg-emerald-50" },
  failed:  { textColor: "text-red-600",     bgColor: "bg-red-50" },
  pending: { textColor: "text-amber-600",   bgColor: "bg-amber-50" },
};

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
      if (data?.success) setOrders(data.data);
    } catch (error: any) {
      Alert.alert("Error", "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
        <Header title="My Orders" showBack />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (orders.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
        <Header title="My Orders" showBack />
        <View className="flex-1 justify-center items-center px-8">
          <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
            <Ionicons name="bag-outline" size={36} color="#9ca3af" />
          </View>
          <Text className="text-lg font-bold text-primary mb-2">No orders yet</Text>
          <Text className="text-sm text-secondary text-center">
            Your order history will appear here once you make a purchase.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <Header title="My Orders" showBack />

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const status = item.orderStatus ?? "placed";
          const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.placed;
          const barColor = STATUS_BAR_COLOR[status] ?? STATUS_BAR_COLOR.placed;
          const paymentCfg = PAYMENT_CONFIG[item.paymentStatus] ?? PAYMENT_CONFIG.pending;
          const firstImage = item.items?.[0]?.product?.images?.[0];
          const extraCount = item.items.length - 1;

          return (
            <TouchableOpacity
              onPress={() => router.push(`/orders/${item._id}`)}
              activeOpacity={0.85}
              className="bg-white rounded-2xl mb-4 border border-gray-100 overflow-hidden"
              style={{ elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 }}
            >
              {/* ── Status accent bar ── */}
              <View className={`h-1 w-full ${barColor}`} />

              <View className="p-4">
                {/* ── Row 1: Order number + date ── */}
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-sm font-bold text-primary">
                    #{item.orderNumber}
                  </Text>
                  <Text className="text-xs text-secondary">
                    {formatDate(item.createdAt)}
                  </Text>
                </View>

                {/* ── Row 2: Image + item info + total ── */}
                <View className="flex-row items-center mb-3">
                  {/* Product image with +N badge */}
                  <View className="w-14 h-14 mr-3">
                    {firstImage ? (
                      <Image
                        source={{ uri: firstImage }}
                        className="w-14 h-14 rounded-xl bg-gray-50"
                        resizeMode="contain"
                      />
                    ) : (
                      <View className="w-14 h-14 rounded-xl bg-gray-100 items-center justify-center">
                        <Ionicons name="image-outline" size={22} color="#d1d5db" />
                      </View>
                    )}
                    {extraCount > 0 && (
                      <View className="absolute -bottom-1 -right-1 bg-gray-800 rounded-lg px-1">
                        <Text className="text-white text-[9px] font-bold">+{extraCount}</Text>
                      </View>
                    )}
                  </View>

                  {/* Item name + chips */}
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-primary mb-1" numberOfLines={1}>
                      {item.items[0]?.name}
                    </Text>
                    {item.items.length > 1 && (
                      <Text className="text-xs text-secondary mb-1">
                        +{item.items.length - 1} more item{item.items.length > 2 ? "s" : ""}
                      </Text>
                    )}
                    <View className="flex-row gap-1.5">
                      <View className="bg-gray-100 px-2 py-0.5 rounded-md">
                        <Text className="text-[10px] text-gray-500">Size: {item.items[0]?.size}</Text>
                      </View>
                      <View className="bg-gray-100 px-2 py-0.5 rounded-md">
                        <Text className="text-[10px] text-gray-500">Qty: {item.items[0]?.quantity}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Total */}
                  <Text className="text-base font-extrabold text-primary ml-2">
                    ${item.totalAmount.toFixed(2)}
                  </Text>
                </View>

                {/* ── Divider ── */}
                <View className="h-px bg-gray-100 mb-3" />

                {/* ── Row 3: Status + payment + arrow ── */}
                <View className="flex-row justify-between items-center">
                  <View className="flex-row gap-2">
                    {/* Order status badge */}
                    <View className={`flex-row items-center gap-1 px-2.5 py-1 rounded-full ${statusCfg.bgColor}`}>
                      <Ionicons
                        name={statusCfg.icon}
                        size={11}
                        color={statusCfg.textColor.replace("text-", "").includes("indigo") ? "#4f46e5"
                          : statusCfg.textColor.includes("amber") ? "#d97706"
                          : statusCfg.textColor.includes("blue") ? "#2563eb"
                          : statusCfg.textColor.includes("emerald") ? "#059669"
                          : "#ef4444"}
                      />
                      <Text className={`text-[11px] font-bold capitalize ${statusCfg.textColor}`}>
                        {status}
                      </Text>
                    </View>

                    {/* Payment badge */}
                    <View className={`px-2.5 py-1 rounded-full ${paymentCfg.bgColor}`}>
                      <Text className={`text-[11px] font-bold capitalize ${paymentCfg.textColor}`}>
                        {item.paymentStatus}
                      </Text>
                    </View>
                  </View>

                  <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}
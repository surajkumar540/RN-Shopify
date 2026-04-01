import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { COLORS } from "@/constants";
import type { Order, Product } from "@/constants/types";
import { useAuth } from "@clerk/clerk-expo";
import api from "@/constants/api";

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any }> = {
  placed:     { color: "#6366f1", bg: "#eef2ff", icon: "receipt-outline" },
  processing: { color: "#f59e0b", bg: "#fffbeb", icon: "refresh-outline" },
  shipped:    { color: "#3b82f6", bg: "#eff6ff", icon: "airplane-outline" },
  delivered:  { color: "#10b981", bg: "#ecfdf5", icon: "checkmark-circle-outline" },
  cancelled:  { color: "#ef4444", bg: "#fef2f2", icon: "close-circle-outline" },
};

const PAYMENT_COLOR: Record<string, string> = {
  paid:    "#10b981",
  failed:  "#ef4444",
  pending: "#f59e0b",
};

const ORDER_STEPS = ["placed", "processing", "shipped", "delivered"];

const STEP_LABELS: Record<string, string> = {
  placed:     "Order Placed",
  processing: "Processing",
  shipped:    "Shipped",
  delivered:  "Delivered",
};

const STEP_HEIGHT = 56;

export default function OrderDetails() {
  const { getToken } = useAuth();
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetails = async () => {
    try {
      const token = await getToken();
      const { data } = await api.get(`/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(data.order);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrderDetails(); }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-surface justify-center items-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-surface justify-center items-center">
        <Text className="text-secondary">Order not found</Text>
      </SafeAreaView>
    );
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric",
    });

  const currentStepIdx = ORDER_STEPS.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === "cancelled";
  const statusCfg = STATUS_CONFIG[order.orderStatus] ?? STATUS_CONFIG.placed;

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <Header title={`Order #${order.orderNumber}`} showBack />

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>

        {/* ── Status Badge ── */}
        <View
          style={{ backgroundColor: statusCfg.bg, borderColor: statusCfg.color + "30" }}
          className="flex-row items-center gap-3 p-4 rounded-2xl mb-4 border"
        >
          <View
            style={{ backgroundColor: statusCfg.color + "20" }}
            className="w-10 h-10 rounded-full items-center justify-center"
          >
            <Ionicons name={statusCfg.icon} size={20} color={statusCfg.color} />
          </View>
          <View className="flex-1">
            <Text className="text-xs text-secondary mb-0.5">Current Status</Text>
            <Text style={{ color: statusCfg.color }} className="font-bold text-base capitalize">
              {order.orderStatus}
            </Text>
          </View>
          <Text className="text-xs text-secondary">{formatDate(order.updatedAt)}</Text>
        </View>

        {/* ── Order Progress Stepper ── */}
        {!isCancelled && (
          <View className="bg-white p-4 rounded-2xl mb-4 border border-gray-100">
            <Text className="text-base font-bold text-primary mb-4">Order Progress</Text>

            {ORDER_STEPS.map((step, index) => {
              const completed = index <= currentStepIdx;
              const isLast = index === ORDER_STEPS.length - 1;
              const cfg = STATUS_CONFIG[step];

              return (
                <View key={step} style={{ flexDirection: "row", minHeight: STEP_HEIGHT }}>
                  {/* Left: dot + line */}
                  <View style={{ width: 24, alignItems: "center" }}>
                    {/* Dot */}
                    <View
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        backgroundColor: completed ? cfg.color : "#e5e7eb",
                        borderWidth: completed ? 0 : 2,
                        borderColor: "#d1d5db",
                        marginTop: 3,
                        zIndex: 1,
                      }}
                    />
                    {/* Connector line */}
                    {!isLast && (
                      <View
                        style={{
                          width: 2,
                          flex: 1,
                          backgroundColor: index < currentStepIdx ? cfg.color : "#e5e7eb",
                          marginTop: 2,
                        }}
                      />
                    )}
                  </View>

                  {/* Right: label */}
                  <View style={{ flex: 1, paddingLeft: 12, paddingBottom: isLast ? 0 : 16 }}>
                    <Text
                      style={{
                        fontWeight: completed ? "700" : "400",
                        color: completed ? "#111827" : "#9ca3af",
                        fontSize: 14,
                        marginTop: 1,
                      }}
                    >
                      {STEP_LABELS[step]}
                    </Text>
                    {step === "placed" && (
                      <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                        {formatDate(order.createdAt)}
                      </Text>
                    )}
                    {step === "delivered" && order.orderStatus === "delivered" && order.deliveredAt && (
                      <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                        {formatDate(order.deliveredAt)}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ── Products ── */}
        <View className="bg-white p-4 rounded-2xl mb-4 border border-gray-100">
          <Text className="text-base font-bold text-primary mb-4">
            Products ({order.items.length})
          </Text>
          {order.items.map((item: any, index: number) => {
            const productData = item.product as Product;
            const image = productData?.images?.[0];
            const isLast = index === order.items.length - 1;

            return (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  paddingBottom: isLast ? 0 : 16,
                  marginBottom: isLast ? 0 : 16,
                  borderBottomWidth: isLast ? 0 : 1,
                  borderBottomColor: "#f3f4f6",
                }}
              >
                {image ? (
                  <Image
                    source={{ uri: image }}
                    style={{ width: 64, height: 64, borderRadius: 10, backgroundColor: "#f9fafb" }}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={{ width: 64, height: 64, borderRadius: 10, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name="image-outline" size={24} color="#d1d5db" />
                  </View>
                )}
                <View style={{ flex: 1, marginLeft: 12, justifyContent: "center" }}>
                  <Text className="text-primary font-semibold text-sm" numberOfLines={2}>
                    {item.name}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
                    <View style={{ backgroundColor: "#f3f4f6", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ fontSize: 11, color: "#6b7280" }}>Size: {item.size}</Text>
                    </View>
                    <View style={{ backgroundColor: "#f3f4f6", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ fontSize: 11, color: "#6b7280" }}>Qty: {item.quantity}</Text>
                    </View>
                  </View>
                  <Text className="text-primary font-bold mt-2">${item.price.toFixed(2)}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* ── Shipping ── */}
        <View className="bg-white p-4 rounded-2xl mb-4 border border-gray-100">
          <Text className="text-base font-bold text-primary mb-3">Shipping Address</Text>
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", marginRight: 10, marginTop: 1 }}>
              <Ionicons name="location-outline" size={16} color="#3b82f6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text className="text-primary font-medium text-sm">
                {order.shippingAddress?.street}
              </Text>
              <Text className="text-secondary text-xs mt-0.5">
                {order.shippingAddress?.city}, {order.shippingAddress?.state}
              </Text>
              <Text className="text-secondary text-xs">
                {order.shippingAddress?.zipCode}, {order.shippingAddress?.country}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Payment Summary ── */}
        <View className="bg-white p-4 rounded-2xl mb-8 border border-gray-100">
          <Text className="text-base font-bold text-primary mb-4">Payment Summary</Text>

          {/* Method + Status row */}
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
            <View style={{ flex: 1, backgroundColor: "#f9fafb", borderRadius: 10, padding: 10 }}>
              <Text style={{ fontSize: 10, color: "#9ca3af", marginBottom: 2, textTransform: "uppercase", fontWeight: "600" }}>Method</Text>
              <Text className="text-primary font-semibold capitalize text-sm">{order.paymentMethod}</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: "#f9fafb", borderRadius: 10, padding: 10 }}>
              <Text style={{ fontSize: 10, color: "#9ca3af", marginBottom: 2, textTransform: "uppercase", fontWeight: "600" }}>Status</Text>
              <Text style={{ fontWeight: "600", fontSize: 14, textTransform: "capitalize", color: PAYMENT_COLOR[order.paymentStatus] ?? "#111" }}>
                {order.paymentStatus}
              </Text>
            </View>
          </View>

          {/* Cost breakdown */}
          {[
            { label: "Subtotal",  value: order.subtotal },
            { label: "Shipping",  value: order.shippingCost },
            { label: "Tax",       value: order.tax },
          ].map(({ label, value }) => (
            <View key={label} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text className="text-secondary text-sm">{label}</Text>
              <Text className="text-primary font-medium text-sm">${value.toFixed(2)}</Text>
            </View>
          ))}

          <View style={{ height: 1, backgroundColor: "#f3f4f6", marginVertical: 10 }} />

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text className="text-primary font-bold text-base">Total</Text>
            <Text className="text-primary font-bold text-xl">${order.totalAmount.toFixed(2)}</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
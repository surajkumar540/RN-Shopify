import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { ProductCardProps } from "@/constants/types";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useWishList } from "@/context/WishListContext";

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { toggleWishlist, isInWishlist } = useWishList();
  const isLiked = isInWishlist(product._id);

  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : 0;

  return (
    <TouchableOpacity
      className="mb-4 w-[48%] rounded-2xl bg-white overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 3,
      }}
      onPress={() => router.push(`/product/${product._id}`)}
      activeOpacity={0.92}
    >
      {/* ── Image container ── */}
      <View className="relative w-full h-52 bg-gray-50">
        <Image
          source={{ uri: product.images?.[0] ?? "" }}
          className="w-full h-full"
          resizeMode="cover"
        />

        {/* Gradient overlay at bottom */}
        <View
          className="absolute bottom-0 left-0 right-0 h-12"
          style={{ background: "transparent" }}
        />

        {/* Wishlist button */}
        <TouchableOpacity
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 bg-white rounded-full items-center justify-center"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.12,
            shadowRadius: 4,
            elevation: 2,
          }}
          onPress={() => toggleWishlist(product)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={16}
            color={isLiked ? "#f43f5e" : "#9ca3af"}
          />
        </TouchableOpacity>

        {/* Badges */}
        <View className="absolute top-2.5 left-2.5 gap-1">
          {product.isFeatured && (
            <View className="bg-amber-400 px-2 py-0.5 rounded-md">
              <Text className="text-white text-[10px] font-bold uppercase tracking-wide">
                Featured
              </Text>
            </View>
          )}
          {hasDiscount && (
            <View className="bg-rose-500 px-2 py-0.5 rounded-md">
              <Text className="text-white text-[10px] font-bold">
                -{discountPct}%
              </Text>
            </View>
          )}
          {product.stock === 0 && (
            <View className="bg-gray-700 px-2 py-0.5 rounded-md">
              <Text className="text-white text-[10px] font-bold uppercase">
                Sold Out
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Info ── */}
      <View className="px-3 pt-2.5 pb-3">
        {/* Rating */}
        {product.ratings?.count > 0 && (
          <View className="flex-row items-center mb-1.5">
            <Ionicons name="star" size={11} color="#f59e0b" />
            <Text className="text-[11px] font-semibold text-amber-600 ml-1">
              {product.ratings.average.toFixed(1)}
            </Text>
            <Text className="text-[10px] text-gray-400 ml-1">
              ({product.ratings.count})
            </Text>
          </View>
        )}

        {/* Name */}
        <Text
          className="text-gray-900 font-semibold text-[13px] leading-tight mb-2"
          numberOfLines={2}
        >
          {product.name}
        </Text>

        {/* Price row */}
        <View className="flex-row items-center gap-1.5">
          <Text className="text-gray-900 font-bold text-sm">
            ${product.price.toFixed(2)}
          </Text>
          {hasDiscount && (
            <Text className="text-gray-400 text-xs line-through">
              ${product.comparePrice!.toFixed(2)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
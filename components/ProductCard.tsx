import { View, Text, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import { ProductCardProps } from '@/constants/types'
import { Link, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '@/constants'
import { useWishList } from '@/context/WishListContext'

export default function ProductCard({ product }: ProductCardProps) {

    const router = useRouter();
    const { toggleWishlist, isInWishlist } = useWishList();

    const isLiked = isInWishlist(product._id);

    return (
        <TouchableOpacity
            className="mb-4 w-[48%] rounded-lg border border-gray-200 overflow-hidden"
            onPress={() => router.push(`/product/${product._id}`)}
            activeOpacity={0.8}
        >
            <View className="relative w-full h-56 bg-gray-100">
                <Image
                    source={{ uri: product.images?.[0] ?? "" }}
                    className="w-full h-full"
                    resizeMode="cover"
                />

                {/* ❤️ Favorite icon */}
                <TouchableOpacity
                    className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full"
                    onPress={() => toggleWishlist(product)}
                >
                    <Ionicons
                        name={isLiked ? "heart" : "heart-outline"}
                        size={24}
                        color={isLiked ? COLORS.accent : COLORS.primary}
                    />
                </TouchableOpacity>

                {product.isFeatured && (
                    <View className="absolute top-2 left-2 z-10 px-2 py-1 bg-primary rounded">
                        <Text className="text-white text-xs font-bold uppercase">
                            Featured
                        </Text>
                    </View>
                )}
            </View>

            <View className="p-3">
                <Text className="text-primary font-medium mb-1" numberOfLines={1}>
                    {product.name}
                </Text>

                <Text className="text-primary font-medium text-base">
                    ${product.price.toFixed(2)}
                </Text>
            </View>
        </TouchableOpacity>
    );
}
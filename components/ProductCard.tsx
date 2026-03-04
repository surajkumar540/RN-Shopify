import { View, Text, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import { ProductCardProps } from '@/constants/types'
import { Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '@/constants'

export default function ProductCard({ product }: ProductCardProps) {

    const [isLiked, setIsLiked] = useState(true)

    return (
        <Link href={"/product/" + product._id} asChild>
            <TouchableOpacity className="mb-4 w-[48%] rounded-lg border border-gray-200 overflow-hidden">
                <View className="relative w-full h-56 bg-gray-100">
                    <Image
                        source={{ uri: product.images?.[0] ?? "" }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                    {/* favorite icon */}

                    <TouchableOpacity className='absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-sm' onPress={() => setIsLiked(!isLiked)}>

                        <Ionicons name={`${isLiked ? "heart" : "heart-outline"}`} size={24} color={isLiked ? COLORS.accent : COLORS.primary} />
                    </TouchableOpacity>

                    {/* Is Featured */}
                    {product.isFeatured && <View className='absolute top-2 left-2 z-10 px-2 py-1 bg-primary rounded'>
                        <Text className='text-white text-xs font-bold uppercase'>Featured</Text>
                    </View>}
                </View>

                {/* Product information */}

                <View className='p-3'>
                    <View className='flex-row items-center mb-1'>
                        <Ionicons name="star" size={16} color={"#FFD700"} />
                        <Text className='text-secondary text-xs ml-1'> 4.6
                            {/* {product.ratings} */}
                        </Text>
                    </View>
                    <Text className="text-primary font-medium mb-1" numberOfLines={1}>
                        {product.name}
                    </Text>

                    <View className='flex-row items-center'>
                        <Text className="text-primary font-medium text-base ">
                            ${product.price.toFixed(2)}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Link>
    )
}
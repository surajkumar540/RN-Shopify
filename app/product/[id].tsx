import { View, Text, ActivityIndicator, Image, Dimensions, TouchableOpacity } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Product } from '@/constants/types'
import { useCart } from '@/context/CartContext'
import { useWishList } from '@/context/WishListContext'
import { dummyProducts } from '@/assets/assets'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS } from '@/constants'
import { ScrollView } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons'

const { width } = Dimensions.get('window')

export default function ProductDetails() {

    const { id } = useLocalSearchParams()
    const router = useRouter()

    const scrollRef = useRef<ScrollView>(null)

    const [product, setProduct] = useState<Product | null>(null)

    const [loading, setLoading] = useState(true)
    const [activeImageIndex, setActiveImageIndex] = useState(0)

    const { toggleWishlist, isInWishlist } = useWishList()

    const fetchProduct = async () => {
        setProduct(dummyProducts.find(p => p._id === id) as any)
        setLoading(false)
    }

    useEffect(() => {
        fetchProduct()
    }, [])

    /* ---------------- AUTO SCROLL ---------------- */

    useEffect(() => {
        if (!product?.images?.length) return

        const interval = setInterval(() => {

            let nextIndex = activeImageIndex + 1

            if (nextIndex >= product.images.length) {
                nextIndex = 0
            }

            scrollRef.current?.scrollTo({
                x: nextIndex * width,
                animated: true
            })

            setActiveImageIndex(nextIndex)

        }, 3000)

        return () => clearInterval(interval)

    }, [activeImageIndex, product])

    /* --------------------------------------------- */

    if (loading) {
        return (
            <SafeAreaView className='flex-1 justify-center items-center'>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        )
    }

    if (!product) {
        return (
            <SafeAreaView className='flex-1 justify-center items-center'>
                <Text className='text-lg font-semibold'>Product not found</Text>
            </SafeAreaView>
        )
    }

    const isLiked = isInWishlist(product._id)

    return (
        <View className='flex-1 bg-white'>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>

                {/* Image Carousel */}
                <View className='relative h-[450px] bg-gray-100 mb-6'>

                    <ScrollView
                        ref={scrollRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        scrollEventThrottle={16}
                        onScroll={(e) => {

                            const slide = Math.ceil(
                                e.nativeEvent.contentOffset.x /
                                e.nativeEvent.layoutMeasurement.width
                            )

                            if (slide !== activeImageIndex) {
                                setActiveImageIndex(slide)
                            }

                        }}
                    >

                        {product.images?.map((img, index) => (
                            <Image
                                key={index}
                                source={{ uri: img }}
                                style={{ width: width, height: 450 }}
                                resizeMode='cover'
                            />
                        ))}

                    </ScrollView>

                    {/* Header buttons */}
                    <View className='absolute top-12 left-4 right-4 flex-row justify-between z-10'>

                        <TouchableOpacity
                            className='w-10 h-10 bg-white/80 rounded-full items-center justify-center'
                            onPress={() => router.back()}
                        >
                            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            className='w-10 h-10 bg-white/80 rounded-full items-center justify-center'
                            onPress={() => toggleWishlist(product)}
                        >
                            <Ionicons
                                name={isLiked ? "heart" : "heart-outline"}
                                size={24}
                                color={isLiked ? COLORS.accent : COLORS.primary}
                            />
                        </TouchableOpacity>

                    </View>

                    {/* Pagination dots */}
                    <View className='absolute bottom-4 left-0 right-0 flex-row justify-center gap-2'>

                        {product.images?.map((_, index) => (
                            <View
                                key={index}
                                className={`h-2 rounded-full ${index === activeImageIndex
                                    ? "w-6 bg-primary"
                                    : "w-2 bg-gray-300"
                                    }`}
                            />
                        ))}

                    </View>

                </View>

            </ScrollView>

        </View>
    )
}
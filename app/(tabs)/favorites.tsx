import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import { useWishList } from '@/context/WishListContext';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';

export default function Favorites() {

  const { wishlist } = useWishList();
  const router = useRouter();
  return (
    <SafeAreaView className='flex-1 bg-surface' edges={["top"]}>
      <Header title='Favorites' showMenu showCart />

      {wishlist.length > 0 ? (
        <ScrollView className='flex-1 px-4 mt-4' showsVerticalScrollIndicator={false}>
          <View className='flex-row flex-wrap justify-between'>
            {wishlist.map((product, index) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </View>
        </ScrollView>)
        : (
          <View className='flex-1 items-center justify-center'>
            <Text className='text-secondary text-lg'>
              Your wishlist is empty
            </Text>
            <TouchableOpacity className='mt-4' onPress={() => router.push('/')}>
              <Text className='text-primary font-bold'>
                Start Shopping
              </Text>
            </TouchableOpacity>
          </View>
        )
      }
    </SafeAreaView>
  )
}
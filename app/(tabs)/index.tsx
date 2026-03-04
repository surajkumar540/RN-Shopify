import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '@/components/Header'
import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { BANNERS } from '@/assets/assets'
import { useRouter } from 'expo-router'
import { CATEGORIES } from '@/constants'
import CategoriesItem from '@/components/CategoriesItem'

const { width } = Dimensions.get("window")

const Home = () => {

  const scrollRef = useRef(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const router = useRouter();
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const categories = [{ id: "All", name: "All", icon: "grid" }, ...CATEGORIES]


  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = currentIndex + 1

      if (nextIndex >= BANNERS.length) {
        nextIndex = 0
      }

      scrollRef.current?.scrollTo({
        x: nextIndex * (width - 32),
        animated: true
      })

      setCurrentIndex(nextIndex)
    }, 3000) // change slide every 3 seconds

    return () => clearInterval(interval)
  }, [currentIndex])

  return (
    <SafeAreaView className='flex-1' edges={["top"]}>
      <Header title={"Forever"} showMenu showCart showLogo />

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>

        {/* Banner slider */}

        <View className='mb-6'>


          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            className='w-full h-48 rounded-xl'
            onScroll={(e) => {
              const slide = Math.ceil(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width)

              if (slide !== activeBannerIndex) {
                setActiveBannerIndex(slide)
              }
            }}
          >
            {
              BANNERS?.map((banner, index) => (
                <View
                  key={index}
                  className='relative w-full h-48 bg-gray-200 overflow-hidden'
                  style={{ width: width - 32 }}
                >
                  <Image
                    source={{ uri: banner.image }}
                    className='w-full h-full'
                    resizeMode='cover'
                  />

                  <View className='absolute bottom-4 left-4 z-10'>
                    <Text className='text-white text-2xl font-bold'>
                      {banner.title}
                    </Text>
                    <Text className='text-white font-medium text-sm'>
                      {banner.subtitle}
                    </Text>

                    <TouchableOpacity className='mt-2 bg-white px-4 py-2 rounded-full self-start'>
                      <Text className='text-primary font-bold text-xs'>
                        Get Now
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View className='absolute inset-0 bg-black/10' />
                </View>
              ))
            }
          </ScrollView>

          {/* Pagination Dots */}
          <View className="flex-row justify-center mt-3 gap-2">
            {BANNERS.map((_, index) => (
              <View key={index} className={`h-2 rounded-full ${index === activeBannerIndex ? "w-6 bg-primary" : " w-2 bg-gray-300"} `} />
            ))}
          </View>
        </View>

        {/* Categories */}
        <View className='mb-6'>
          <View className='flex-row justify-between items-center mb-4'>
            <Text className='text-xl font-bold text-primary'>
              Categories
            </Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat: any) => (
              <CategoriesItem key={cat.id} item={cat} isSelected={false} onPress={() => router.push({ pathname: "/shop", params: { category: cat.id === "all" ? "" : cat.name } })} />
            ))}
          </ScrollView>

        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

export default Home
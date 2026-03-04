import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '@/components/Header'
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { BANNERS, dummyProducts } from '@/assets/assets'
import { useRouter } from 'expo-router'
import { CATEGORIES } from '@/constants'
import CategoriesItem from '@/components/CategoriesItem'
import { Product } from '@/constants/types'
import ProductCard from '@/components/ProductCard'

const { width } = Dimensions.get("window")

const Home = () => {

  const router = useRouter();
  const scrollRef = useRef(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
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


  const fetchProducts = async () => {
    setProducts(dummyProducts)
    setLoading(false)

  }
  useEffect(() => {
    fetchProducts()
  }, [])

  return (
    <SafeAreaView className='flex-1 bg-white' edges={["top"]}>
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

                  <View className='absolute inset-0 bg-black/10' />

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

        {/* Popular products */}
        <View className='mb-8'>
          <View className='flex-row justify-between items-center mb-4'>
            <Text className="text-xl font-bold text-primary">
              Popular
            </Text>

            <TouchableOpacity onPress={() => { router.push("/shop") }}>
              <Text className="text-sm text-secondary">
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size={'large'} />
          ) : (
            <View className='flex-row flex-wrap justify-between'>
              {products.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </View>)}

        </View>

        {/* Newsletter CTA */}

        <View className=' bg-gray-100 p-6 rounded-2xl mb-20 items-center'>
          <Text className='text-2xl font-bold text-primary text-center mb-2'>
            Join our Newsletter
          </Text>
          <Text className='text-secondary text-center mb-4 '>
            Subscribe to  our newsletter and get 10% off your first purchase!
          </Text>
          <TouchableOpacity className='bg-primary w-4/5 py-3 rounded-full items-center'>
            <Text className='text-white font-medium text-base'>
              Subscribe Now

            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Home
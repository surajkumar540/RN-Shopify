import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BANNERS } from "@/assets/assets";
import { useRouter } from "expo-router";
import { CATEGORIES } from "@/constants";
import CategoriesItem from "@/components/CategoriesItem";
import { Product } from "@/constants/types";
import ProductCard from "@/components/ProductCard";
import api from "@/constants/api";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const Home = () => {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  const categories = [{ id: "All", name: "All", icon: "grid" }, ...CATEGORIES];

  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = currentIndex + 1;

      if (nextIndex >= BANNERS.length) {
        nextIndex = 0;
      }

      scrollRef.current?.scrollTo({
        x: nextIndex * (width - 32),
        animated: true,
      });

      setCurrentIndex(nextIndex);
    }, 3000); // change slide every 3 seconds

    return () => clearInterval(interval);
  }, [currentIndex]);

  const fetchProducts = async () => {
    try {
      const response = await api.get("products");
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error: any) {
      console.log(error);
      Alert.alert("Error", "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <Header title={"Forever"} showMenu showCart showLogo />

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Banner slider */}

        <View className="mb-6">
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            className="w-full h-48 rounded-xl"
            onScroll={(e) => {
              const slide = Math.ceil(
                e.nativeEvent.contentOffset.x /
                  e.nativeEvent.layoutMeasurement.width,
              );

              if (slide !== activeBannerIndex) {
                setActiveBannerIndex(slide);
              }
            }}
          >
            {BANNERS?.map((banner, index) => (
              <View
                key={index}
                className="relative w-full h-48 bg-gray-200 overflow-hidden"
                style={{ width: width - 32 }}
              >
                <Image
                  source={{ uri: banner.image }}
                  className="w-full h-full"
                  resizeMode="cover"
                />

                <View className="absolute inset-0 bg-black/10" />

                <View className="absolute bottom-4 left-4 z-10">
                  <Text className="text-white text-2xl font-bold">
                    {banner.title}
                  </Text>
                  <Text className="text-white font-medium text-sm">
                    {banner.subtitle}
                  </Text>

                  <TouchableOpacity className="mt-2 bg-white px-4 py-2 rounded-full self-start">
                    <Text className="text-primary font-bold text-xs">
                      Get Now
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          <View className="flex-row justify-center mt-3 gap-2">
            {BANNERS.map((_, index) => (
              <View
                key={index}
                className={`h-2 rounded-full ${index === activeBannerIndex ? "w-6 bg-primary" : " w-2 bg-gray-300"} `}
              />
            ))}
          </View>
        </View>

        {/* Categories */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-primary">Categories</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat: any) => (
              <CategoriesItem
                key={cat.id}
                item={cat}
                isSelected={false}
                onPress={() =>
                  router.push({
                    pathname: "/shop",
                    params: { category: cat.id === "all" ? "" : cat.name },
                  })
                }
              />
            ))}
          </ScrollView>
        </View>

        {/* Popular products */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-primary">Popular</Text>

            <TouchableOpacity
              onPress={() => {
                router.push("/shop");
              }}
            >
              <Text className="text-sm text-secondary">See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size={"large"} />
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {products.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </View>
          )}
        </View>

        {/* Shop CTA Banner */}
        <TouchableOpacity
          onPress={() =>
            router.push({ pathname: "/shop", params: { category: "All" } })
          }
          activeOpacity={0.92}
          className="mb-20 rounded-2xl overflow-hidden"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 10,
            elevation: 3,
          }}
        >
          <View className="bg-rose-50 border border-rose-100 px-6 pt-5 pb-5">
            {/* Label pill */}
            <View className="bg-rose-100 self-start px-3 py-1 rounded-full mb-3">
              <Text className="text-rose-500 text-[10px] font-bold uppercase tracking-widest">
                New Arrivals
              </Text>
            </View>

            {/* Heading */}
            <Text className="text-gray-900 text-xl font-extrabold leading-snug mb-1">
              Explore the Full{"\n"}Collection
            </Text>
            <Text className="text-gray-400 text-sm mb-5">
              Hundreds of styles across every category.
            </Text>

            {/* Button row */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center bg-rose-500 px-5 py-2.5 rounded-full gap-2">
                <Text className="text-white font-bold text-sm">Shop Now</Text>
                <Ionicons name="arrow-forward" size={14} color="#fff" />
              </View>

              <View className="w-11 h-11 rounded-full bg-rose-100 items-center justify-center">
                <Ionicons name="bag-handle-outline" size={20} color="#f43f5e" />
              </View>
            </View>
          </View>

          {/* Bottom strip */}
          <View className="bg-rose-100 px-6 py-2 flex-row items-center gap-2">
            <Ionicons name="pricetag-outline" size={12} color="#f43f5e" />
            <Text className="text-rose-400 text-xs font-medium">
              Free shipping on orders over $50
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;

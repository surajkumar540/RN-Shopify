import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Product } from "@/constants/types";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants";
import ProductCard from "@/components/ProductCard";
import api from "@/constants/api";

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [search, setSearch] = useState("");


  const fetchProducts = async (pageNumber = 1) => {
    if (pageNumber === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const quaryParams = { page: pageNumber, limit: 10 };

      const { data } = await api.get("/products", { params: quaryParams });
      console.log(data?.data,"ssas");
      if (pageNumber === 1) {
        setProducts(data?.data);
        setFilteredProducts(data?.data);
      } else {
        setProducts((prev) => [...prev, ...data?.data]);
        setFilteredProducts((prev) => [...prev, ...data?.data]);
      }

      setHasMore(data?.pagination.page < data?.pagination.pages);
      setPage(pageNumber);
    } catch (error) {
      console.log("Error fetching products:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && !loading && hasMore) {
      fetchProducts(page + 1);
    }
  };

  const handleSearch = (text: string) => {
    setSearch(text);

    if (text === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredProducts(filtered);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <Header title="Shop" showBack showCart />

      {/* Search Bar */}
      <View className="flex-row items-center mx-4 my-3 gap-3">
        {/* Search Bar */}
        <View
          className="flex-1 flex-row items-center bg-white rounded-full px-4 py-3 border border-gray-200"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
            elevation: 2,
          }}
        >
          <Ionicons name="search" size={20} color={COLORS.secondary} />

          <TextInput
            value={search}
            onChangeText={handleSearch}
            placeholder="Search products..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-3 text-primary text-sm"
            returnKeyType="search"
          />
        </View>

        {/* Filter Button */}
        <TouchableOpacity className="bg-gray-800 w-12 h-12 items-center justify-center rounded-full">
          <Ionicons name="options-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Product List */}

      {loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          renderItem={({ item }) => <ProductCard product={item} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                size="small"
                color={COLORS.primary}
                style={{ marginVertical: 20 }}
              />
            ) : null
          }
          ListEmptyComponent={
            !loading && (
              <View className="items-center justify-center mt-20">
                <Ionicons
                  name="sad-outline"
                  size={48}
                  color={COLORS.secondary}
                />
                <Text className="text-secondary mt-4">No products found</Text>
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

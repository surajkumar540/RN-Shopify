import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Product } from "@/constants/types";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants";
import ProductCard from "@/components/ProductCard";
import api from "@/constants/api";
import { useLocalSearchParams } from "expo-router";

const SORT_OPTIONS = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Price: Low to High", value: "price" },
  { label: "Price: High to Low", value: "-price" },
];

const CATEGORY_OPTIONS = ["All", "Men", "Women", "Kids", "Shoes", "Bags", "Other"];

export default function Shop() {
  const params = useLocalSearchParams<{ category?: string }>();
  const initialCategory = Array.isArray(params.category)
    ? params.category[0]
    : params.category;

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");

  // Filter states
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedSort, setSelectedSort] = useState("-createdAt");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Temp states (inside modal before applying)
  const [tempSort, setTempSort] = useState(selectedSort);
  const [tempCategory, setTempCategory] = useState(selectedCategory);
  const [tempMinPrice, setTempMinPrice] = useState(minPrice);
  const [tempMaxPrice, setTempMaxPrice] = useState(maxPrice);

  const fetchProducts = useCallback(
    async (pageNumber = 1, sort = selectedSort, category = selectedCategory, min = minPrice, max = maxPrice) => {
      if (pageNumber === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const queryParams: any = {
          sort,
          page: pageNumber,
          limit: 10,
        };

        if (category && category !== "All") {
          queryParams.category = category;
        }

        if (min) queryParams.minPrice = min;
        if (max) queryParams.maxPrice = max;

        console.log("Fetching with params:", queryParams);

        const { data } = await api.get("/products", { params: queryParams });

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
    },
    [selectedSort, selectedCategory, minPrice, maxPrice]
  );

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
        p.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  const openFilterModal = () => {
    // Sync temp with current
    setTempSort(selectedSort);
    setTempCategory(selectedCategory);
    setTempMinPrice(minPrice);
    setTempMaxPrice(maxPrice);
    setFilterModalVisible(true);
  };

  const applyFilters = () => {
    setSelectedSort(tempSort);
    setSelectedCategory(tempCategory);
    setMinPrice(tempMinPrice);
    setMaxPrice(tempMaxPrice);
    setFilterModalVisible(false);

    setProducts([]);
    setFilteredProducts([]);
    setPage(1);
    setHasMore(true);
    setSearch("");

    fetchProducts(1, tempSort, tempCategory, tempMinPrice, tempMaxPrice);
  };

  const resetFilters = () => {
    setTempSort("-createdAt");
    setTempCategory(initialCategory || "All");
    setTempMinPrice("");
    setTempMaxPrice("");
  };

  useEffect(() => {
    setProducts([]);
    setFilteredProducts([]);
    setPage(1);
    setHasMore(true);
    setSearch("");
    fetchProducts(1);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <Header
        title={selectedCategory && selectedCategory !== "All" ? selectedCategory : "Shop"}
        showBack
        showCart
      />

      {/* Search Bar */}
      <View className="flex-row items-center mx-4 my-3 gap-3">
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
        <TouchableOpacity
          onPress={openFilterModal}
          className="bg-gray-800 w-12 h-12 items-center justify-center rounded-full"
        >
          <Ionicons name="options-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Product List */}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
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
              <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <View className="items-center justify-center mt-20">
                <Ionicons name="sad-outline" size={48} color={COLORS.secondary} />
                <Text className="text-secondary mt-4">No products found</Text>
              </View>
            ) : null
          }
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-lg font-bold text-primary">Filters</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Sort */}
              <Text className="text-sm font-semibold text-primary mb-3">Sort By</Text>
              <View className="flex-row flex-wrap gap-2 mb-6">
                {SORT_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setTempSort(opt.value)}
                    className={`px-4 py-2 rounded-full border ${
                      tempSort === opt.value
                        ? "bg-primary border-primary"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        tempSort === opt.value ? "text-white" : "text-secondary"
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Category */}
              <Text className="text-sm font-semibold text-primary mb-3">Category</Text>
              <View className="flex-row flex-wrap gap-2 mb-6">
                {CATEGORY_OPTIONS.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setTempCategory(cat)}
                    className={`px-4 py-2 rounded-full border ${
                      tempCategory === cat
                        ? "bg-primary border-primary"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        tempCategory === cat ? "text-white" : "text-secondary"
                      }`}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Price Range */}
              <Text className="text-sm font-semibold text-primary mb-3">Price Range</Text>
              <View className="flex-row gap-3 mb-8">
                <View className="flex-1 border border-gray-200 rounded-xl px-4 py-3 bg-white">
                  <TextInput
                    value={tempMinPrice}
                    onChangeText={setTempMinPrice}
                    placeholder="Min price"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    className="text-primary text-sm"
                  />
                </View>
                <View className="flex-1 border border-gray-200 rounded-xl px-4 py-3 bg-white">
                  <TextInput
                    value={tempMaxPrice}
                    onChangeText={setTempMaxPrice}
                    placeholder="Max price"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    className="text-primary text-sm"
                  />
                </View>
              </View>
            </ScrollView>

            {/* Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={resetFilters}
                className="flex-1 border border-gray-300 py-3 rounded-full items-center"
              >
                <Text className="text-secondary font-semibold text-sm">Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={applyFilters}
                className="flex-1 bg-primary py-3 rounded-full items-center"
              >
                <Text className="text-white font-semibold text-sm">Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
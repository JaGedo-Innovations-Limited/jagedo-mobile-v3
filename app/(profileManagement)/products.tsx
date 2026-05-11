import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";

import {
  getProductsData,
  getProfileData,
  getSignupData,
  saveProductsData,
  type SavedProduct,
  type SavedProfileData,
  type SavedSignupData,
} from "../../src/shared/utils/profileStorage";

type ProductParams = {
  userType?: string | string[];
  email?: string | string[];
  phone?: string | string[];
};

type ProductFormData = {
  name: string;
  price: string;
  sku: string;
  bid: string;
  material: string;
  size: string;
  color: string;
  region: string;
  uom: string;
  category: string;
  description: string;
  images: string[];
};

const EMPTY_FORM: ProductFormData = {
  name: "",
  price: "",
  sku: "",
  bid: "",
  material: "",
  size: "",
  color: "",
  region: "",
  uom: "",
  category: "",
  description: "",
  images: [],
};

const REGIONS = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Kiambu",
  "Machakos",
  "Nyeri",
];

const UOM_OPTIONS = ["Pieces", "Kilograms", "Meters", "Liters", "Set", "Pair"];

const pickFirst = (value?: string | string[]) => (Array.isArray(value) ? value[0] || "" : value || "");

const normalizeUserType = (value: string) => String(value || "").trim().toUpperCase();

const getCategoryOptions = (userType: string) => {
  const normalized = normalizeUserType(userType);
  if (normalized === "CUSTOMER") return ["General Supplies", "Home Essentials", "Custom Orders"];
  if (normalized === "FUNDI") return ["Custom Products", "Designs", "Hire of Machinery & Equipment"];
  if (normalized === "PROFESSIONAL") return ["Custom Products", "Designs", "Consultancy Kits"];
  if (normalized === "CONTRACTOR") return ["Hardware", "Custom Products", "Hire of Machinery & Equipment"];
  if (normalized === "HARDWARE") return ["Hardware", "Custom Products", "Designs", "Hire of Machinery & Equipment"];
  return ["Custom Products"];
};

const formatCurrency = (value: number) => {
  if (!Number.isFinite(value)) return "KES 0";
  return `KES ${value.toLocaleString()}`;
};

const formatStatus = (status: SavedProduct["status"]) => {
  if (status === "pending_approval") return "Pending Approval";
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return "Draft";
};

const buildProductKey = (userType: string, email: string, phone: string) => {
  const key = [userType || "USER", email || "", phone || ""].join("|").trim();
  return key || "USER|unknown";
};

const ProductsScreen = () => {
  const params = useLocalSearchParams<ProductParams>();
  const [savedProfile, setSavedProfile] = useState<SavedProfileData | null>(null);
  const [savedSignup, setSavedSignup] = useState<SavedSignupData | null>(null);
  const [products, setProducts] = useState<SavedProduct[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | SavedProduct["status"]>("all");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(EMPTY_FORM);
  const [imageInput, setImageInput] = useState("");
  const [notice, setNotice] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    const hydrateIdentity = async () => {
      const [profileData, signupData] = await Promise.all([getProfileData(), getSignupData()]);
      if (!mounted) return;
      setSavedProfile(profileData);
      setSavedSignup(signupData);
    };
    void hydrateIdentity();
    return () => {
      mounted = false;
    };
  }, []);

  const userType =
    pickFirst(params.userType) || savedProfile?.userType || savedSignup?.userType || "";
  const email = pickFirst(params.email) || savedProfile?.email || "";
  const phone = pickFirst(params.phone) || savedProfile?.phone || "";
  const profileKey = useMemo(
    () => buildProductKey(userType, email, phone),
    [email, phone, userType]
  );
  const categoryOptions = useMemo(() => getCategoryOptions(userType), [userType]);

  useEffect(() => {
    let mounted = true;
    const hydrateProducts = async () => {
      const payload = await getProductsData(profileKey);
      if (!mounted) return;
      setProducts(payload?.products || []);
      setHydrated(true);
    };
    setHydrated(false);
    void hydrateProducts();
    return () => {
      mounted = false;
    };
  }, [profileKey]);

  useEffect(() => {
    if (!hydrated) return;
    void saveProductsData(profileKey, {
      userType: normalizeUserType(userType),
      products,
    });
  }, [hydrated, products, profileKey, userType]);

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 2500);
    return () => clearTimeout(timeout);
  }, [notice]);

  const isFormIncomplete = useMemo(
    () =>
      !formData.name.trim() ||
      !formData.bid.trim() ||
      !formData.sku.trim() ||
      !formData.price.trim() ||
      !formData.category.trim() ||
      !formData.region.trim() ||
      !formData.description.trim() ||
      formData.images.length === 0,
    [formData]
  );

  const filteredProducts = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    return products.filter((product) => {
      if (statusFilter !== "all" && product.status !== statusFilter) return false;
      if (categoryFilter !== "All" && product.category !== categoryFilter) return false;
      if (!query) return true;
      return [product.name, product.sku, product.bid, product.category, product.region]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [categoryFilter, products, searchValue, statusFilter]);

  const handleChange = (field: keyof ProductFormData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const resetAndCloseForm = () => {
    setFormData(EMPTY_FORM);
    setImageInput("");
    setEditingProductId(null);
    setShowForm(false);
  };

  const openCreateForm = () => {
    setFormData(EMPTY_FORM);
    setImageInput("");
    setEditingProductId(null);
    setShowForm(true);
  };

  const openEditForm = (product: SavedProduct) => {
    setFormData({
      name: product.name,
      price: String(product.customPrice || ""),
      sku: product.sku,
      bid: product.bid,
      material: product.material,
      size: product.size,
      color: product.color,
      region: product.region,
      uom: product.uom,
      category: product.category,
      description: product.description,
      images: product.images,
    });
    setImageInput("");
    setEditingProductId(product.id);
    setShowForm(true);
  };

  const handleAddImage = () => {
    const trimmed = imageInput.trim();
    if (!trimmed) return;
    setFormData((current) => ({
      ...current,
      images: [...current.images, trimmed],
    }));
    setImageInput("");
  };

  const handleRemoveImage = (imageIndex: number) => {
    setFormData((current) => ({
      ...current,
      images: current.images.filter((_, idx) => idx !== imageIndex),
    }));
  };

  const handleSaveDraft = () => {
    if (!formData.name.trim()) {
      setNotice("Enter at least the product name to save a draft.");
      return;
    }
    const now = new Date().toISOString();
    const isEditing = Boolean(editingProductId);
    const nextProduct: SavedProduct = {
      id: editingProductId || `${Date.now()}`,
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category.trim(),
      region: formData.region.trim(),
      bid: formData.bid.trim(),
      sku: formData.sku.trim(),
      material: formData.material.trim(),
      size: formData.size.trim(),
      color: formData.color.trim(),
      uom: formData.uom.trim(),
      customPrice: Number.parseFloat(formData.price) || 0,
      images: formData.images,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    };

    setProducts((current) => {
      if (!isEditing) return [nextProduct, ...current];
      return current.map((item) =>
        item.id === editingProductId
          ? { ...nextProduct, createdAt: item.createdAt, updatedAt: now }
          : item
      );
    });
    setNotice(isEditing ? "Draft updated." : "Draft saved.");
    resetAndCloseForm();
  };

  const handleSubmitForApproval = () => {
    if (isFormIncomplete) {
      setNotice("Fill all required fields before submitting.");
      return;
    }
    const now = new Date().toISOString();
    const isEditing = Boolean(editingProductId);
    const nextProduct: SavedProduct = {
      id: editingProductId || `${Date.now()}`,
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category.trim(),
      region: formData.region.trim(),
      bid: formData.bid.trim(),
      sku: formData.sku.trim(),
      material: formData.material.trim(),
      size: formData.size.trim(),
      color: formData.color.trim(),
      uom: formData.uom.trim(),
      customPrice: Number.parseFloat(formData.price) || 0,
      images: formData.images,
      status: "pending_approval",
      createdAt: now,
      updatedAt: now,
    };

    setProducts((current) => {
      if (!isEditing) return [nextProduct, ...current];
      return current.map((item) =>
        item.id === editingProductId
          ? { ...nextProduct, createdAt: item.createdAt, updatedAt: now }
          : item
      );
    });
    setNotice(isEditing ? "Product changes submitted." : "Product submitted for approval.");
    resetAndCloseForm();
  };

  const handleDelete = (productId: string) => {
    setProducts((current) => current.filter((item) => item.id !== productId));
    setNotice("Product deleted.");
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-10 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4 flex-row items-center justify-between">
          <Pressable
            className="h-11 w-11 items-center justify-center rounded-full bg-white active:opacity-80"
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={20} color="#0F172A" />
          </Pressable>

          <Pressable
            className="rounded-full bg-slate-900 px-4 py-2.5 active:opacity-80"
            onPress={() => router.replace("/signin")}
          >
            <Text className="text-sm font-semibold text-white">Logout</Text>
          </Pressable>
        </View>

        <View className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
          <Text className="text-lg font-bold text-slate-900">Products</Text>
          <Text className="mt-1 text-xs text-slate-500">
            Manage shop products, inventory, and pricing from your mobile profile management.
          </Text>

          <ScrollView className="mt-4" horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {["All", ...categoryOptions].map((category) => {
                const selected = categoryFilter === category;
                return (
                  <Pressable
                    key={category}
                    className={`rounded-full px-3 py-2 ${
                      selected ? "bg-blue-700" : "bg-slate-100"
                    }`}
                    onPress={() => setCategoryFilter(category)}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        selected ? "text-white" : "text-slate-700"
                      }`}
                    >
                      {category}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View className="mt-3 flex-row gap-2">
            {(["all", "draft", "pending_approval"] as const).map((status) => {
              const selected = statusFilter === status;
              return (
                <Pressable
                  key={status}
                  className={`rounded-xl border px-3 py-2 ${
                    selected ? "border-blue-700 bg-blue-50" : "border-slate-200 bg-white"
                  }`}
                  onPress={() => setStatusFilter(status)}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      selected ? "text-blue-700" : "text-slate-600"
                    }`}
                  >
                    {status === "all"
                      ? "Status: All"
                      : status === "draft"
                      ? "Drafts"
                      : "Pending"}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="mt-3 gap-2">
            <TextInput
              className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900"
              placeholder="Search by name, SKU, product code"
              placeholderTextColor="#94A3B8"
              value={searchValue}
              onChangeText={setSearchValue}
            />
            <Pressable
              className="h-11 items-center justify-center rounded-xl bg-blue-700 active:opacity-80"
              onPress={openCreateForm}
            >
              <Text className="text-sm font-semibold text-white">+ Add Product</Text>
            </Pressable>
          </View>
        </View>

        {notice ? (
          <View className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
            <Text className="text-xs font-semibold text-emerald-700">{notice}</Text>
          </View>
        ) : null}

        {showForm ? (
          <View className="mb-5 rounded-2xl border border-slate-200 bg-white p-4">
            <Text className="text-base font-bold text-slate-900">
              {editingProductId ? "Edit Product" : "Add New Product"}
            </Text>

            <View className="mt-4 gap-3">
              <TextInput
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
                placeholder="Category*"
                value={formData.category}
                onChangeText={(value) => handleChange("category", value)}
              />
              <TextInput
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
                placeholder="Product Name*"
                value={formData.name}
                onChangeText={(value) => handleChange("name", value)}
              />
              <TextInput
                multiline
                numberOfLines={4}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
                placeholder="Product Description*"
                value={formData.description}
                onChangeText={(value) => handleChange("description", value)}
              />
              <TextInput
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
                placeholder="Region*"
                value={formData.region}
                onChangeText={(value) => handleChange("region", value)}
              />
              <View className="flex-row flex-wrap gap-2">
                {REGIONS.map((region) => {
                  const selected = formData.region === region;
                  return (
                    <Pressable
                      key={region}
                      className={`rounded-full px-3 py-1.5 ${
                        selected ? "bg-blue-700" : "bg-slate-100"
                      }`}
                      onPress={() => handleChange("region", region)}
                    >
                      <Text
                        className={`text-xs ${selected ? "text-white" : "text-slate-700"}`}
                      >
                        {region}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View className="flex-row gap-2">
                <TextInput
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
                  placeholder="B-ID*"
                  value={formData.bid}
                  onChangeText={(value) => handleChange("bid", value)}
                />
                <TextInput
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
                  placeholder="SKU*"
                  value={formData.sku}
                  onChangeText={(value) => handleChange("sku", value)}
                />
              </View>

              <View className="flex-row gap-2">
                <TextInput
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
                  placeholder="Material"
                  value={formData.material}
                  onChangeText={(value) => handleChange("material", value)}
                />
                <TextInput
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
                  placeholder="Size"
                  value={formData.size}
                  onChangeText={(value) => handleChange("size", value)}
                />
              </View>

              <View className="flex-row gap-2">
                <TextInput
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
                  placeholder="Color"
                  value={formData.color}
                  onChangeText={(value) => handleChange("color", value)}
                />
                <TextInput
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
                  placeholder="Price (KES)*"
                  keyboardType="numeric"
                  value={formData.price}
                  onChangeText={(value) => handleChange("price", value)}
                />
              </View>

              <TextInput
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
                placeholder="UOM"
                value={formData.uom}
                onChangeText={(value) => handleChange("uom", value)}
              />
              <View className="flex-row flex-wrap gap-2">
                {UOM_OPTIONS.map((uom) => {
                  const selected = formData.uom === uom;
                  return (
                    <Pressable
                      key={uom}
                      className={`rounded-full px-3 py-1.5 ${
                        selected ? "bg-blue-700" : "bg-slate-100"
                      }`}
                      onPress={() => handleChange("uom", uom)}
                    >
                      <Text
                        className={`text-xs ${selected ? "text-white" : "text-slate-700"}`}
                      >
                        {uom}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
                <Text className="text-xs text-slate-600">
                  Media Upload*: add image URLs (mobile-friendly placeholder flow).
                </Text>
                <View className="mt-2 flex-row gap-2">
                  <TextInput
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
                    placeholder="https://example.com/image.jpg"
                    value={imageInput}
                    onChangeText={setImageInput}
                  />
                  <Pressable
                    className="rounded-xl bg-slate-900 px-4 py-2.5 active:opacity-80"
                    onPress={handleAddImage}
                  >
                    <Text className="text-xs font-semibold text-white">Add</Text>
                  </Pressable>
                </View>

                {formData.images.length ? (
                  <View className="mt-3 gap-2">
                    {formData.images.map((image, index) => (
                      <View
                        key={`${image}-${index}`}
                        className="flex-row items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
                      >
                        <Text className="mr-3 flex-1 text-xs text-slate-700" numberOfLines={1}>
                          {image}
                        </Text>
                        <Pressable onPress={() => handleRemoveImage(index)}>
                          <Text className="text-xs font-semibold text-rose-600">Remove</Text>
                        </Pressable>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>

              <View className="mt-1 flex-row flex-wrap gap-2">
                <Pressable
                  className="rounded-xl bg-slate-200 px-4 py-2.5 active:opacity-80"
                  onPress={resetAndCloseForm}
                >
                  <Text className="text-xs font-semibold text-slate-800">Cancel</Text>
                </Pressable>
                <Pressable
                  className="rounded-xl bg-blue-700 px-4 py-2.5 active:opacity-80"
                  onPress={handleSaveDraft}
                >
                  <Text className="text-xs font-semibold text-white">Save as Draft</Text>
                </Pressable>
                <Pressable
                  className={`rounded-xl px-4 py-2.5 ${
                    isFormIncomplete ? "bg-slate-300" : "bg-emerald-600"
                  }`}
                  onPress={handleSubmitForApproval}
                  disabled={isFormIncomplete}
                >
                  <Text className="text-xs font-semibold text-white">
                    {editingProductId ? "Submit Changes" : "Submit for Approval"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}

        <View className="rounded-2xl border border-slate-200 bg-white p-4">
          <Text className="text-base font-bold text-slate-900">Products</Text>
          <Text className="mt-0.5 text-xs text-slate-500">
            {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
          </Text>

          <View className="mt-3 gap-3">
            {filteredProducts.length ? (
              filteredProducts.map((product) => (
                <View key={product.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-3">
                      <Text className="text-sm font-semibold text-slate-900">{product.name}</Text>
                      <Text className="mt-0.5 text-xs text-slate-500">
                        {product.category || "No category"} • {product.region || "No region"}
                      </Text>
                    </View>
                    <View className="rounded-full bg-slate-900 px-2 py-1">
                      <Text className="text-[10px] font-semibold text-white">
                        {formatStatus(product.status)}
                      </Text>
                    </View>
                  </View>

                  <Text className="mt-2 text-xs text-slate-700">
                    {formatCurrency(product.customPrice)} • SKU: {product.sku || "N/A"} • Code:{" "}
                    {product.bid || "N/A"}
                  </Text>
                  <Text className="mt-1 text-xs text-slate-600">
                    Images: {product.images.length} • Updated:{" "}
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </Text>

                  <View className="mt-3 flex-row gap-2">
                    <Pressable
                      className="rounded-lg bg-blue-700 px-3 py-2 active:opacity-80"
                      onPress={() => openEditForm(product)}
                    >
                      <Text className="text-xs font-semibold text-white">Edit</Text>
                    </Pressable>
                    <Pressable
                      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 active:opacity-80"
                      onPress={() => handleDelete(product.id)}
                    >
                      <Text className="text-xs font-semibold text-rose-700">Delete</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            ) : (
              <View className="rounded-xl border border-dashed border-slate-300 px-3 py-8">
                <Text className="text-center text-xs text-slate-500">No products found.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductsScreen;

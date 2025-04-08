"use client";

import ProductGrid from "@/components/product-grid";
import ProductHeader from "@/components/product-header";
import Sidebar from "@/components/sidebar";
import { productsData } from "@/data/products";
import { initialFilterState, initialFilterStateMap } from "@/lib/filter-utils";
import type { FilterState, Product, SortOption, ViewType } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Shop() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialLoadRef = useRef(true);
  const urlUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cartUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State for products, filters, pagination, and view
  const [products] = useState<Product[]>(productsData?.products || []);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(
    productsData?.products || []
  );
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [activeFilters, setActiveFilters] = useState<
    { type: string; value: string }[]
  >([]);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(12);
  const [viewType, setViewType] = useState<ViewType>("grid");
  const [cartItems, setCartItems] = useState<
    { product: Product; quantity: number }[]
  >([]);
  const [wishlist, setWishlist] = useState<number[]>([]);

  // Load cart and wishlist from localStorage on initial load
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error loading cart from localStorage", e);
      }
    }

    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error("Error loading wishlist from localStorage", e);
      }
    }
  }, []);

  // Load filters from URL on initial load only
  useEffect(() => {
    if (!searchParams || !initialLoadRef.current) return;

    const newFilters = { ...initialFilterState };

    // Get categories from URL
    const categories = searchParams.getAll("category");
    if (categories.length > 0) {
      newFilters.categories = categories;
    }

    // Get brands from URL
    const brands = searchParams.getAll("brand");
    if (brands.length > 0) {
      newFilters.brands = brands;
    }

    // Get price ranges from URL
    const prices = searchParams.getAll("price");
    if (prices.length > 0) {
      newFilters.priceRanges = prices;
    }

    // Get ratings from URL
    const ratings = searchParams.getAll("rating");
    if (ratings.length > 0) {
      newFilters.ratings = ratings;
    }

    // Get features from URL
    const features = searchParams.getAll("feature");
    if (features.length > 0) {
      newFilters.features = features;
    }

    // Get availability from URL
    const availability = searchParams.getAll("availability");
    if (availability.length > 0) {
      newFilters.availability = availability;
    }

    // Get release dates from URL
    const releaseDates = searchParams.getAll("releaseDate");
    if (releaseDates.length > 0) {
      newFilters.releaseDates = releaseDates;
    }

    // Get sorting from URL
    const sort = searchParams.get("sort");
    if (sort) {
      setSortBy(sort as SortOption);
    }

    // Get pagination from URL
    const page = searchParams.get("page");
    if (page) {
      setCurrentPage(Number.parseInt(page));
    }

    const perPage = searchParams.get("perPage");
    if (perPage) {
      setProductsPerPage(Number.parseInt(perPage));
    }

    // Get view type from URL
    const view = searchParams.get("view");
    if (view) {
      setViewType(view as ViewType);
    }

    setFilters(newFilters);

    // Build active filters array
    const activeFiltersArray: { type: string; value: string }[] = [];

    categories.forEach((category) => {
      activeFiltersArray.push({ type: "category", value: category });
    });

    brands.forEach((brand) => {
      activeFiltersArray.push({ type: "brand", value: brand });
    });

    prices.forEach((price) => {
      activeFiltersArray.push({ type: "price", value: price });
    });

    ratings.forEach((rating) => {
      activeFiltersArray.push({ type: "rating", value: rating });
    });

    features.forEach((feature) => {
      activeFiltersArray.push({ type: "feature", value: feature });
    });

    availability.forEach((status) => {
      activeFiltersArray.push({ type: "availability", value: status });
    });

    releaseDates.forEach((date) => {
      activeFiltersArray.push({ type: "releaseDate", value: date });
    });

    setActiveFilters(activeFiltersArray);

    // Mark initial load as complete
    initialLoadRef.current = false;
  }, [searchParams]);

  // Apply filters and sorting when state changes
  useEffect(() => {
    if (!products || products.length === 0) {
      setFilteredProducts([]);
      return;
    }

    let result = [...products];

    // Apply category filters
    if (filters.categories.length > 0) {
      result = result.filter((product) =>
        filters.categories.includes(product.category)
      );
    }

    // Apply brand filters
    if (filters.brands.length > 0) {
      result = result.filter((product) =>
        filters.brands.includes(product.brand)
      );
    }

    // Apply price range filters
    if (filters.priceRanges.length > 0) {
      result = result.filter((product) => {
        return filters.priceRanges.some((range) => {
          const priceRange = productsData.filters.priceRanges.find(
            (pr) => pr.range === range
          );
          if (!priceRange) return false;

          if (priceRange.max === null) {
            return product.price >= priceRange.min;
          }

          return (
            product.price >= priceRange.min && product.price <= priceRange.max
          );
        });
      });
    }

    // Apply rating filters
    if (filters.ratings.length > 0) {
      result = result.filter((product) => {
        return filters.ratings.some((rating) => {
          const minRating = Number.parseInt(rating.split("+")[0]);
          return product.rating >= minRating;
        });
      });
    }

    // Apply feature filters
    if (filters.features.length > 0) {
      result = result.filter((product) =>
        filters.features.some((feature) => product.features.includes(feature))
      );
    }

    // Apply availability filters
    if (filters.availability.length > 0) {
      result = result.filter((product) =>
        filters.availability.includes(product.availability)
      );
    }

    // Apply release date filters
    if (filters.releaseDates.length > 0) {
      const now = new Date();

      result = result.filter((product) => {
        const releaseDate = new Date(product.releaseDate);

        return filters.releaseDates.some((period) => {
          if (period === "Last 30 days") {
            const thirtyDaysAgo = new Date(now);
            thirtyDaysAgo.setDate(now.getDate() - 30);
            return releaseDate >= thirtyDaysAgo;
          } else if (period === "Last 3 months") {
            const threeMonthsAgo = new Date(now);
            threeMonthsAgo.setMonth(now.getMonth() - 3);
            return releaseDate >= threeMonthsAgo;
          } else if (period === "Last 6 months") {
            const sixMonthsAgo = new Date(now);
            sixMonthsAgo.setMonth(now.getMonth() - 6);
            return releaseDate >= sixMonthsAgo;
          } else if (period === "Last year") {
            const oneYearAgo = new Date(now);
            oneYearAgo.setFullYear(now.getFullYear() - 1);
            return releaseDate >= oneYearAgo;
          }
          return false;
        });
      });
    }

    // Apply sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
      );
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "popularity") {
      result.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    setFilteredProducts(result);

    // Update active filters
    if (!initialLoadRef.current) {
      const newActiveFilters: { type: string; value: string }[] = [];

      filters.categories.forEach((category) => {
        newActiveFilters.push({ type: "category", value: category });
      });

      filters.brands.forEach((brand) => {
        newActiveFilters.push({ type: "brand", value: brand });
      });

      filters.priceRanges.forEach((price) => {
        newActiveFilters.push({ type: "price", value: price });
      });

      filters.ratings.forEach((rating) => {
        newActiveFilters.push({ type: "rating", value: rating });
      });

      filters.features.forEach((feature) => {
        newActiveFilters.push({ type: "feature", value: feature });
      });

      filters.availability.forEach((status) => {
        newActiveFilters.push({ type: "availability", value: status });
      });

      filters.releaseDates.forEach((date) => {
        newActiveFilters.push({ type: "releaseDate", value: date });
      });

      setActiveFilters(newActiveFilters);
    }

    // Update URL with debounce to prevent too many history entries
    if (!initialLoadRef.current && typeof window !== "undefined") {
      if (urlUpdateTimeoutRef.current) {
        clearTimeout(urlUpdateTimeoutRef.current);
      }

      urlUpdateTimeoutRef.current = setTimeout(() => {
        updateUrl();
      }, 300);
    }
  }, [filters, sortBy, products]);

  // Update URL with current filters and sorting
  const updateUrl = () => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams();

    // Add categories to URL
    filters.categories.forEach((category) => {
      params.append("category", category);
    });

    // Add brands to URL
    filters.brands.forEach((brand) => {
      params.append("brand", brand);
    });

    // Add price ranges to URL
    filters.priceRanges.forEach((range) => {
      params.append("price", range);
    });

    // Add ratings to URL
    filters.ratings.forEach((rating) => {
      params.append("rating", rating);
    });

    // Add features to URL
    filters.features.forEach((feature) => {
      params.append("feature", feature);
    });

    // Add availability to URL
    filters.availability.forEach((status) => {
      params.append("availability", status);
    });

    // Add release dates to URL
    filters.releaseDates.forEach((date) => {
      params.append("releaseDate", date);
    });

    // Add sorting to URL
    if (sortBy !== "relevance") {
      params.append("sort", sortBy);
    }

    // Add pagination to URL
    params.append("page", currentPage.toString());
    params.append("perPage", productsPerPage.toString());

    // Add view type to URL
    params.append("view", viewType);

    // Update URL without refreshing the page
    const url = `${window.location.pathname}?${params.toString()}`;

    // Only update if the URL has actually changed to prevent unnecessary history entries
    if (window.location.search !== `?${params.toString()}`) {
      window.history.pushState({ path: url }, "", url);
    }
  };

  // Handle filter changes
  const handleFilterChange = (
    filterType: keyof FilterState,
    value: string,
    checked: boolean
  ) => {
    setFilters((prev) => {
      const newFilters = { ...prev };

      if (checked) {
        // Add the value to the filter array if it's not already there
        if (!newFilters[filterType].includes(value)) {
          newFilters[filterType] = [...newFilters[filterType], value];
        }
      } else {
        // Remove the value from the filter array
        newFilters[filterType] = newFilters[filterType].filter(
          (item) => item !== value
        );
      }

      return newFilters;
    });

    // Reset to first page when filters change
    setCurrentPage(1);
  };

  // Remove a single filter
  const removeFilter = (type: string, value: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      const filterKey = initialFilterStateMap(type);

      newFilters[filterKey] = newFilters[filterKey].filter(
        (item) => item !== value
      );

      return newFilters;
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters(initialFilterState);
    setSortBy("relevance");
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSortChange = (option: SortOption) => {
    setSortBy(option);
  };

  // Handle products per page change
  const handleProductsPerPageChange = (count: number) => {
    setProductsPerPage(count);
    setCurrentPage(1);
  };

  // Handle view type change
  const handleViewTypeChange = (type: ViewType) => {
    setViewType(type);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Add to cart functionality
  const addToCart = (product: Product) => {
    // Check if product is already in cart before updating state
    const existingItem = cartItems.find(
      (item) => item.product.id === product.id
    );
    const isIncreasingQuantity = !!existingItem;

    setCartItems((prev) => {
      let updatedCart;
      if (existingItem) {
        // Increase quantity if product is already in cart
        updatedCart = prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new product to cart
        updatedCart = [...prev, { product, quantity: 1 }];
      }

      // Update localStorage but don't dispatch event yet
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      console.log(
        "Cart updated:",
        updatedCart,
        isIncreasingQuantity ? "(increased quantity)" : "(added new item)"
      );

      return updatedCart;
    });

    // Schedule the event dispatch
    if (cartUpdateTimeoutRef.current) {
      clearTimeout(cartUpdateTimeoutRef.current);
    }

    cartUpdateTimeoutRef.current = setTimeout(() => {
      console.log("Dispatching cartUpdate event");
      // Pass information about whether we're increasing quantity in the event
      window.dispatchEvent(
        new CustomEvent("cartUpdate", {
          detail: {
            productId: product.id,
            isIncreasingQuantity: isIncreasingQuantity,
          },
        })
      );
    }, 100);

    // Return information about the operation for UI feedback
    return isIncreasingQuantity;
  };

  // Toggle wishlist functionality
  const toggleWishlist = (productId: number) => {
    setWishlist((prev) => {
      let updatedWishlist;
      if (prev.includes(productId)) {
        // Remove from wishlist
        updatedWishlist = prev.filter((id) => id !== productId);
      } else {
        // Add to wishlist
        updatedWishlist = [...prev, productId];
      }

      // Update localStorage
      localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));

      return updatedWishlist;
    });
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (urlUpdateTimeoutRef.current) {
        clearTimeout(urlUpdateTimeoutRef.current);
      }
      if (cartUpdateTimeoutRef.current) {
        clearTimeout(cartUpdateTimeoutRef.current);
      }
    };
  }, []);

  // Calculate pagination values
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Check if data is available
  if (!productsData || !productsData.products) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-xl">Loading products...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8">Shop Electronics</h2>

      <div className="flex flex-col md:flex-row gap-6">
        <Sidebar
          filters={filters}
          productsData={productsData}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onRemoveFilter={removeFilter}
          onClearAllFilters={clearAllFilters}
          filteredProducts={filteredProducts}
        />

        <div className="w-full md:w-3/4">
          <ProductHeader
            filteredProducts={filteredProducts}
            currentPage={currentPage}
            productsPerPage={productsPerPage}
            sortBy={sortBy}
            viewType={viewType}
            onSortChange={handleSortChange}
            onProductsPerPageChange={handleProductsPerPageChange}
            onViewTypeChange={handleViewTypeChange}
            indexOfFirstProduct={indexOfFirstProduct}
            indexOfLastProduct={Math.min(
              indexOfLastProduct,
              filteredProducts.length
            )}
          />

          <ProductGrid
            products={currentProducts}
            viewType={viewType}
            wishlist={wishlist}
            onAddToCart={addToCart}
            onToggleWishlist={toggleWishlist}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </main>
  );
}

"use client";

import type { ProductsData } from "@/data/products";
import type { FilterState } from "@/types";
import { useState } from "react";

interface SidebarProps {
  filters: FilterState;
  productsData: ProductsData;
  activeFilters: { type: string; value: string }[];
  onFilterChange: (
    filterType: keyof FilterState,
    value: string,
    checked: boolean
  ) => void;
  onRemoveFilter: (type: string, value: string) => void;
  onClearAllFilters: () => void;
  filteredProducts: any[];
}

export default function Sidebar({
  filters,
  productsData,
  activeFilters,
  onFilterChange,
  onRemoveFilter,
  onClearAllFilters,
  filteredProducts,
}: SidebarProps) {
  // State for expanded sections
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    brands: true,
    priceRanges: true,
    ratings: true,
    features: true,
    availability: true,
    releaseDates: true,
  });

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Calculate counts for each filter option based on current filtered products
  const getFilterCount = (type: string, value: string) => {
    // Create a copy of filters without the current filter type to see what would happen
    // if only this filter were not applied
    const filtersWithoutCurrentType = { ...filters };

    if (type === "categories") {
      filtersWithoutCurrentType.categories = [];
    } else if (type === "brands") {
      filtersWithoutCurrentType.brands = [];
    } else if (type === "priceRanges") {
      filtersWithoutCurrentType.priceRanges = [];
    } else if (type === "ratings") {
      filtersWithoutCurrentType.ratings = [];
    } else if (type === "features") {
      filtersWithoutCurrentType.features = [];
    } else if (type === "availability") {
      filtersWithoutCurrentType.availability = [];
    } else if (type === "releaseDates") {
      filtersWithoutCurrentType.releaseDates = [];
    }

    // Apply all other filters to get a base set of products
    let baseFilteredProducts = [...productsData.products];

    // Apply category filters
    if (filtersWithoutCurrentType.categories.length > 0) {
      baseFilteredProducts = baseFilteredProducts.filter((product) =>
        filtersWithoutCurrentType.categories.includes(product.category)
      );
    }

    // Apply brand filters
    if (filtersWithoutCurrentType.brands.length > 0) {
      baseFilteredProducts = baseFilteredProducts.filter((product) =>
        filtersWithoutCurrentType.brands.includes(product.brand)
      );
    }

    // Apply price range filters
    if (filtersWithoutCurrentType.priceRanges.length > 0) {
      baseFilteredProducts = baseFilteredProducts.filter((product) => {
        return filtersWithoutCurrentType.priceRanges.some((range) => {
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
    if (filtersWithoutCurrentType.ratings.length > 0) {
      baseFilteredProducts = baseFilteredProducts.filter((product) => {
        return filtersWithoutCurrentType.ratings.some((rating) => {
          const minRating = Number.parseInt(rating.split("+")[0]);
          return product.rating >= minRating;
        });
      });
    }

    // Apply feature filters
    if (filtersWithoutCurrentType.features.length > 0) {
      baseFilteredProducts = baseFilteredProducts.filter((product) =>
        filtersWithoutCurrentType.features.some((feature) =>
          product.features.includes(feature)
        )
      );
    }

    // Apply availability filters
    if (filtersWithoutCurrentType.availability.length > 0) {
      baseFilteredProducts = baseFilteredProducts.filter((product) =>
        filtersWithoutCurrentType.availability.includes(product.availability)
      );
    }

    // Apply release date filters
    if (filtersWithoutCurrentType.releaseDates.length > 0) {
      const now = new Date();

      baseFilteredProducts = baseFilteredProducts.filter((product) => {
        const releaseDate = new Date(product.releaseDate);

        return filtersWithoutCurrentType.releaseDates.some((period) => {
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

    // Now count how many products would match if we applied this specific filter
    switch (type) {
      case "categories":
        return baseFilteredProducts.filter((p) => p.category === value).length;

      case "brands":
        return baseFilteredProducts.filter((p) => p.brand === value).length;

      case "priceRanges":
        const range = productsData.filters.priceRanges.find(
          (r) => r.range === value
        );
        if (!range) return 0;
        if (range.max === null) {
          return baseFilteredProducts.filter((p) => p.price >= range.min)
            .length;
        }
        return baseFilteredProducts.filter(
          (p) => p.price >= range.min && p.price <= (range.max || Infinity)
        ).length;

      case "ratings":
        const minRating = Number.parseInt(value.split("+")[0]);
        return baseFilteredProducts.filter((p) => p.rating >= minRating).length;

      case "features":
        return baseFilteredProducts.filter((p) => p.features.includes(value))
          .length;

      case "availability":
        return baseFilteredProducts.filter((p) => p.availability === value)
          .length;

      case "releaseDates":
        const now = new Date();
        if (value === "Last 30 days") {
          const thirtyDaysAgo = new Date(now);
          thirtyDaysAgo.setDate(now.getDate() - 30);
          return baseFilteredProducts.filter(
            (p) => new Date(p.releaseDate) >= thirtyDaysAgo
          ).length;
        } else if (value === "Last 3 months") {
          const threeMonthsAgo = new Date(now);
          threeMonthsAgo.setMonth(now.getMonth() - 3);
          return baseFilteredProducts.filter(
            (p) => new Date(p.releaseDate) >= threeMonthsAgo
          ).length;
        } else if (value === "Last 6 months") {
          const sixMonthsAgo = new Date(now);
          sixMonthsAgo.setMonth(now.getMonth() - 6);
          return baseFilteredProducts.filter(
            (p) => new Date(p.releaseDate) >= sixMonthsAgo
          ).length;
        } else if (value === "Last year") {
          const oneYearAgo = new Date(now);
          oneYearAgo.setFullYear(now.getFullYear() - 1);
          return baseFilteredProducts.filter(
            (p) => new Date(p.releaseDate) >= oneYearAgo
          ).length;
        }
        return 0;
      default:
        return 0;
    }
  };

  return (
    <aside className="w-full md:w-1/4 bg-white p-6 rounded-lg shadow-md h-fit">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 flex justify-between items-center">
          Filters
          <button
            className="text-sm text-blue-600 hover:underline"
            onClick={onClearAllFilters}
          >
            Clear All
          </button>
        </h3>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilters.map((filter, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
              >
                {filter.value}
                <button
                  className="ml-2 text-blue-800"
                  onClick={() => onRemoveFilter(filter.type, filter.value)}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="border-t pt-4">
        <h3
          className="text-lg font-semibold mb-3 flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection("categories")}
        >
          Category
          <button className="text-xs text-gray-500">
            <i
              className={`fas fa-chevron-${
                expandedSections.categories ? "up" : "down"
              }`}
            ></i>
          </button>
        </h3>

        {expandedSections.categories && (
          <div className="space-y-2">
            {productsData.filters.categories.map((category) => (
              <label key={category.name} className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-blue-600"
                  checked={filters.categories.includes(category.name)}
                  onChange={(e) =>
                    onFilterChange(
                      "categories",
                      category.name,
                      e.target.checked
                    )
                  }
                />
                <span className="ml-2 text-gray-700">
                  {category.name} ({getFilterCount("categories", category.name)}
                  )
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Brands */}
      <div className="border-t pt-4 mt-4">
        <h3
          className="text-lg font-semibold mb-3 flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection("brands")}
        >
          Brand
          <button className="text-xs text-gray-500">
            <i
              className={`fas fa-chevron-${
                expandedSections.brands ? "up" : "down"
              }`}
            ></i>
          </button>
        </h3>
        {expandedSections.brands && (
          <div className="space-y-2">
            {productsData.filters.brands.map((brand) => (
              <label key={brand.name} className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-blue-600"
                  checked={filters.brands.includes(brand.name)}
                  onChange={(e) =>
                    onFilterChange("brands", brand.name, e.target.checked)
                  }
                />
                <span className="ml-2 text-gray-700">
                  {brand.name} ({getFilterCount("brands", brand.name)})
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="border-t pt-4 mt-4">
        <h3
          className="text-lg font-semibold mb-3 flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection("priceRanges")}
        >
          Price Range
          <button className="text-xs text-gray-500">
            <i
              className={`fas fa-chevron-${
                expandedSections.priceRanges ? "up" : "down"
              }`}
            ></i>
          </button>
        </h3>
        {expandedSections.priceRanges && (
          <div className="space-y-2">
            {productsData.filters.priceRanges.map((range) => (
              <label key={range.range} className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-blue-600"
                  checked={filters.priceRanges.includes(range.range)}
                  onChange={(e) =>
                    onFilterChange("priceRanges", range.range, e.target.checked)
                  }
                />
                <span className="ml-2 text-gray-700">
                  {range.range} ({getFilterCount("priceRanges", range.range)})
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="border-t pt-4 mt-4">
        <h3
          className="text-lg font-semibold mb-3 flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection("ratings")}
        >
          Rating
          <button className="text-xs text-gray-500">
            <i
              className={`fas fa-chevron-${
                expandedSections.ratings ? "up" : "down"
              }`}
            ></i>
          </button>
        </h3>

        {expandedSections.ratings && (
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600"
                checked={filters.ratings.includes("5")}
                onChange={(e) =>
                  onFilterChange("ratings", "5", e.target.checked)
                }
              />
              <span className="ml-2 flex items-center text-gray-700">
                <i className="fas fa-star text-yellow-400"></i>
                <i className="fas fa-star text-yellow-400"></i>
                <i className="fas fa-star text-yellow-400"></i>
                <i className="fas fa-star text-yellow-400"></i>
                <i className="fas fa-star text-yellow-400"></i>
                <span className="ml-1">({getFilterCount("ratings", "5")})</span>
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600"
                checked={filters.ratings.includes("4+")}
                onChange={(e) =>
                  onFilterChange("ratings", "4+", e.target.checked)
                }
              />
              <span className="ml-2 flex items-center text-gray-700">
                <i className="fas fa-star text-yellow-400"></i>
                <i className="fas fa-star text-yellow-400"></i>
                <i className="fas fa-star text-yellow-400"></i>
                <i className="fas fa-star text-yellow-400"></i>
                <i className="fas fa-star text-gray-300"></i>
                <span className="ml-1 whitespace-nowrap">
                  & Up ({getFilterCount("ratings", "4+")})
                </span>
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600"
                checked={filters.ratings.includes("3+")}
                onChange={(e) =>
                  onFilterChange("ratings", "3+", e.target.checked)
                }
              />

              <span className="ml-2 flex items-center text-gray-700">
                <i className="fas fa-star text-yellow-400"></i>
                <i className="fas fa-star text-yellow-400"></i>
                <i className="fas fa-star text-yellow-400"></i>
                <i className="fas fa-star text-gray-300"></i>
                <i className="fas fa-star text-gray-300"></i>
                <span className="ml-1 whitespace-nowrap">
                  & Up ({getFilterCount("ratings", "3+")})
                </span>
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600"
                checked={filters.ratings.includes("2+")}
                onChange={(e) =>
                  onFilterChange("ratings", "2+", e.target.checked)
                }
              />

              <span className="ml-2 flex items-center text-gray-700">
                <i className="fas fa-star text-yellow-400"></i>
                <i className="fas fa-star text-yellow-400"></i>
                <i className="fas fa-star text-gray-300"></i>
                <i className="fas fa-star text-gray-300"></i>
                <i className="fas fa-star text-gray-300"></i>
                <span className="ml-1 whitespace-nowrap">
                  & Up ({getFilterCount("ratings", "2+")})
                </span>
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="border-t pt-4 mt-4">
        <h3
          className="text-lg font-semibold mb-3 flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection("features")}
        >
          Features
          <button className="text-xs text-gray-500">
            <i
              className={`fas fa-chevron-${
                expandedSections.features ? "up" : "down"
              }`}
            ></i>
          </button>
        </h3>

        {expandedSections.features && (
          <div className="space-y-2">
            {productsData.filters.features.map((feature) => (
              <label key={feature.name} className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-blue-600"
                  checked={filters.features.includes(feature.name)}
                  onChange={(e) =>
                    onFilterChange("features", feature.name, e.target.checked)
                  }
                />
                <span className="ml-2 text-gray-700">
                  {feature.name} ({getFilterCount("features", feature.name)})
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Availability */}
      <div className="border-t pt-4 mt-4">
        <h3
          className="text-lg font-semibold mb-3 flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection("availability")}
        >
          Availability
          <button className="text-xs text-gray-500">
            <i
              className={`fas fa-chevron-${
                expandedSections.availability ? "up" : "down"
              }`}
            ></i>
          </button>
        </h3>

        {expandedSections.availability && (
          <div className="space-y-2">
            {productsData.filters.availability.map((status) => (
              <label key={status.status} className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-blue-600"
                  checked={filters.availability.includes(status.status)}
                  onChange={(e) =>
                    onFilterChange(
                      "availability",
                      status.status,
                      e.target.checked
                    )
                  }
                />

                <span className="ml-2 text-gray-700">
                  {status.status} (
                  {getFilterCount("availability", status.status)})
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Release Date */}
      <div className="border-t pt-4 mt-4">
        <h3
          className="text-lg font-semibold mb-3 flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection("releaseDates")}
        >
          Release Date
          <button className="text-xs text-gray-500">
            <i
              className={`fas fa-chevron-${
                expandedSections.releaseDates ? "up" : "down"
              }`}
            ></i>
          </button>
        </h3>

        {expandedSections.releaseDates && (
          <div className="space-y-2">
            {productsData.filters.releaseDates.map((date) => (
              <label key={date.period} className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-blue-600"
                  checked={filters.releaseDates.includes(date.period)}
                  onChange={(e) =>
                    onFilterChange(
                      "releaseDates",
                      date.period,
                      e.target.checked
                    )
                  }
                />

                <span className="ml-2 text-gray-700">
                  {date.period} ({getFilterCount("releaseDates", date.period)})
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 border-t pt-4">
        <button
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
          onClick={() => window.scrollTo(0, 0)}
        >
          Apply Filters
        </button>
      </div>
    </aside>
  );
}

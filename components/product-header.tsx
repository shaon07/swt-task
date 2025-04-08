"use client";

import type { SortOption, ViewType } from "@/types";

interface ProductHeaderProps {
  filteredProducts: any[];
  currentPage: number;
  productsPerPage: number;
  sortBy: SortOption;
  viewType: ViewType;
  onSortChange: (option: SortOption) => void;
  onProductsPerPageChange: (count: number) => void;
  onViewTypeChange: (type: ViewType) => void;
  indexOfFirstProduct: number;
  indexOfLastProduct: number;
}

export default function ProductHeader({
  filteredProducts,
  currentPage,
  productsPerPage,
  sortBy,
  viewType,
  onSortChange,
  onProductsPerPageChange,
  onViewTypeChange,
  indexOfFirstProduct,
  indexOfLastProduct,
}: ProductHeaderProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div>
            <span className="text-gray-600">
              Showing {indexOfFirstProduct + 1}-{indexOfLastProduct} of{" "}
              {filteredProducts.length} products
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-gray-600 whitespace-nowrap">Sort by:</label>
            <select
              className="form-select border rounded-md py-1 px-2"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
            >
              <option value="relevance">Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="rating">Rating</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-gray-600">View:</label>
          <div className="flex">
            <button
              className={`px-3 py-1 ${
                viewType === "grid"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-600"
              } rounded-l-md hover:bg-blue-200`}
              onClick={() => onViewTypeChange("grid")}
            >
              <i className="fas fa-th-large"></i>
            </button>

            <button
              className={`px-3 py-1 ${
                viewType === "list"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-600"
              } rounded-r-md hover:bg-blue-200`}
              onClick={() => onViewTypeChange("list")}
            >
              <i className="fas fa-list"></i>
            </button>
          </div>

          <label className="text-gray-600 ml-2">Show:</label>
          <select
            className="form-select border rounded-md py-1 px-2"
            value={productsPerPage}
            onChange={(e) =>
              onProductsPerPageChange(Number.parseInt(e.target.value))
            }
          >
            <option value="12">12</option>
            <option value="24">24</option>
            <option value="36">36</option>
            <option value="48">48</option>
          </select>
        </div>
      </div>
    </div>
  );
}

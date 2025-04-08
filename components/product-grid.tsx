import type { Product, ViewType } from "@/types"
import ProductCard from "./product-card"
import ProductListItem from "./product-list-item"
import Pagination from "./pagination"

interface ProductGridProps {
  products: Product[]
  viewType: ViewType
  wishlist: number[]
  onAddToCart: (product: Product) => boolean // Update the type to return boolean
  onToggleWishlist: (productId: number) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function ProductGrid({
  products,
  viewType,
  wishlist,
  onAddToCart,
  onToggleWishlist,
  currentPage,
  totalPages,
  onPageChange,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h3 className="text-xl font-semibold mb-2">No products found</h3>
        <p className="text-gray-600">Try adjusting your filters to find what you're looking for.</p>
      </div>
    )
  }

  return (
    <>
      {viewType === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isWishlisted={wishlist.includes(product.id)}
              onAddToCart={() => onAddToCart(product)}
              onToggleWishlist={() => onToggleWishlist(product.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {products.map((product) => (
            <ProductListItem
              key={product.id}
              product={product}
              isWishlisted={wishlist.includes(product.id)}
              onAddToCart={() => onAddToCart(product)}
              onToggleWishlist={() => onToggleWishlist(product.id)}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />}
    </>
  )
}

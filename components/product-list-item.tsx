"use client"

import type { Product } from "@/types"
import Image from "next/image"
import { useState } from "react"

interface ProductListItemProps {
  product: Product
  isWishlisted: boolean
  onAddToCart: () => boolean
  onToggleWishlist: () => void
}

export default function ProductListItem({
  product,
  isWishlisted,
  onAddToCart,
  onToggleWishlist,
}: ProductListItemProps) {
  // Format rating to display stars
  const renderRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    return (
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="text-yellow-400">
            <i className="fas fa-star"></i>
          </span>
        ))}
        {hasHalfStar && (
          <span className="text-yellow-400">
            <i className="fas fa-star-half-alt"></i>
          </span>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300">
            <i className="fas fa-star"></i>
          </span>
        ))}
        <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
      </div>
    )
  }

  const [showAddedMessage, setShowAddedMessage] = useState(false)
  const [showIncreasedMessage, setShowIncreasedMessage] = useState(false)

  const handleAddToCart = () => {
    const isIncreasingQuantity = onAddToCart()

    if (isIncreasingQuantity) {
      setShowIncreasedMessage(true)
      setTimeout(() => setShowIncreasedMessage(false), 2000)
    } else {
      setShowAddedMessage(true)
      setTimeout(() => setShowAddedMessage(false), 2000)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col md:flex-row">
        <div className="relative md:w-1/4">
          {product.tags.includes("sale") && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
              SALE
            </span>
          )}
          {product.tags.includes("new") && (
            <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
              NEW
            </span>
          )}
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            width={600}
            height={400}
            className="w-full h-48 md:h-full object-cover"
          />
        </div>
        <div className="p-4 md:w-3/4 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="block text-sm text-blue-600 font-medium">{product.brand}</span>
              <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
            </div>
            {renderRatingStars(product.rating)}
          </div>
          <div className="mb-2 flex-grow">
            <span className="text-gray-500">{product.description}</span>
            <div className="mt-2">
              <span className="text-sm text-gray-600">
                Availability: <span className="font-medium">{product.availability}</span>
              </span>
            </div>
            <div className="mt-1">
              <span className="text-sm text-gray-600">
                Release Date: <span className="font-medium">{new Date(product.releaseDate).toLocaleDateString()}</span>
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {product.features.map((feature, index) => (
                <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                  {feature}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-gray-400 line-through ml-2">${product.originalPrice.toFixed(2)}</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                onClick={handleAddToCart}
              >
                {showAddedMessage ? "Added to Cart!" : showIncreasedMessage ? "Quantity Increased!" : "Add to Cart"}
              </button>
              <button
                className={`border ${isWishlisted ? "border-red-500 text-red-500" : "border-gray-300 text-gray-500"} px-3 py-2 rounded-md hover:bg-gray-50`}
                onClick={onToggleWishlist}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                {isWishlisted ? (
                  <i className="fas fa-heart text-red-500"></i>
                ) : (
                  <i className="far fa-heart text-gray-500"></i>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

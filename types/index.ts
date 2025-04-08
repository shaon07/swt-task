export interface Product {
  id: number
  name: string
  brand: string
  category: string
  price: number
  originalPrice: number
  rating: number
  reviewCount: number
  description: string
  tags: string[]
  features: string[]
  availability: string
  releaseDate: string
  image: string
}

export interface FilterState {
  categories: string[]
  brands: string[]
  priceRanges: string[]
  ratings: string[]
  features: string[]
  availability: string[]
  releaseDates: string[]
}

export type SortOption = "relevance" | "price-asc" | "price-desc" | "newest" | "rating" | "popularity"

export type ViewType = "grid" | "list"

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function Header() {
  const [cartCount, setCartCount] = useState(0)

  // Listen for cart updates from localStorage
  useEffect(() => {
    const getCartCount = () => {
      const cart = localStorage.getItem("cart")
      console.log("Header: Getting cart count from localStorage", cart)
      if (cart) {
        try {
          const cartItems = JSON.parse(cart)
          // Change from summing quantities to counting unique items
          const count = cartItems.length
          console.log("Header: Cart count calculated (unique items):", count)
          setCartCount(count)
        } catch (e) {
          console.error("Error parsing cart data", e)
          setCartCount(0)
        }
      } else {
        setCartCount(0)
      }
    }

    // Initial load
    getCartCount()

    // Listen for storage events (for cross-tab updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cart") {
        console.log("Header: Storage event detected for cart")
        getCartCount()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Custom event for same-tab updates
    const handleCartUpdate = () => {
      console.log("Header: Cart update event received")
      getCartCount()
    }

    window.addEventListener("cartUpdate", handleCartUpdate)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("cartUpdate", handleCartUpdate)
    }
  }, [])

  return (
    <header className="bg-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold">
              TechGear
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className="hover:text-blue-200">
              Home
            </Link>
            <Link href="/" className="hover:text-blue-200">
              Shop
            </Link>
            <Link href="/" className="hover:text-blue-200">
              Categories
            </Link>
            <Link href="/" className="hover:text-blue-200">
              Deals
            </Link>
            <Link href="/" className="hover:text-blue-200">
              Contact
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <button className="hover:text-blue-200">
              <i className="fas fa-search"></i>
            </button>
            <div className="relative group">
              <Link href="/cart" className="hover:text-blue-200 relative inline-block">
                <i className="fas fa-shopping-cart"></i>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-2 z-10 hidden group-hover:block">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="font-semibold text-gray-800">Shopping Cart ({cartCount} items)</p>
                </div>
                <div className="px-4 py-2">
                  <Link
                    href="/cart"
                    className="block w-full text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                  >
                    View Cart
                  </Link>
                </div>
              </div>
            </div>
            <button className="hover:text-blue-200">
              <i className="fas fa-user"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

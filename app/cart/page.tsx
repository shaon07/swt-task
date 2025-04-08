"use client";

import type { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface CartItem {
  product: Product;
  quantity: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load cart from localStorage
    const loadCart = () => {
      const savedCart = localStorage.getItem("cart");
      console.log("Loading cart from localStorage:", savedCart);
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          console.log("Parsed cart:", parsedCart);
          setCartItems(parsedCart);
        } catch (e) {
          console.error("Error loading cart from localStorage", e);
        }
      }
      setIsLoading(false);
    };

    loadCart();

    // Listen for cart updates
    const handleCartUpdate = (event: Event) => {
      console.log("Cart update event received", event);
      // Check if we have detail information about the update
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        console.log("Cart update details:", customEvent.detail);
      }
      loadCart();
    };

    window.addEventListener("cartUpdate", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdate", handleCartUpdate);
    };
  }, []);

  // Modify the updateQuantity function to not dispatch the event immediately
  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    const updatedCart = cartItems.map((item) =>
      item.product.id === productId ? { ...item, quantity: newQuantity } : item
    );

    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    // Use setTimeout to ensure this happens after the render
    setTimeout(() => {
      window.dispatchEvent(new Event("cartUpdate"));
    }, 0);
  };

  // Modify the removeItem function to not dispatch the event immediately
  const removeItem = (productId: number) => {
    const updatedCart = cartItems.filter(
      (item) => item.product.id !== productId
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    // Use setTimeout to ensure this happens after the render
    setTimeout(() => {
      window.dispatchEvent(new Event("cartUpdate"));
    }, 0);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-xl">Loading cart...</p>
        </div>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">
                Cart Items ({cartItems.length})
              </h2>
            </div>

            <div className="divide-y">
              {cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="p-4 flex flex-col sm:flex-row gap-4"
                >
                  <div className="sm:w-1/4">
                    <Image
                      src={item.product.image || "/placeholder.svg"}
                      alt={item.product.name}
                      width={200}
                      height={200}
                      className="w-full h-auto object-cover rounded-md"
                    />
                  </div>

                  <div className="sm:w-3/4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.product.brand}
                      </p>
                      <p className="text-gray-700 mb-4">
                        ${item.product.price.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center border rounded-md">
                        <button
                          className="px-3 py-1 border-r"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                        >
                          -
                        </button>

                        <span className="px-4 py-1">{item.quantity}</span>
                        <button
                          className="px-3 py-1 border-l"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <i className="fas fa-trash"></i> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${(calculateSubtotal() * 0.1).toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 font-semibold flex justify-between">
                <span>Total</span>
                <span>${(calculateSubtotal() * 1.1).toFixed(2)}</span>
              </div>
            </div>

            <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200 mb-3">
              Proceed to Checkout
            </button>
            <Link
              href="/"
              className="block text-center text-blue-600 hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

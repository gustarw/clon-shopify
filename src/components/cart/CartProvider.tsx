"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";

export interface CartItem {
  productId: number;
  name: string;
  slug: string;
  image: string;
  priceCents: number;
  quantity: number;
  stock: number;
  categoryName?: string;
}

export interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "add"; item: Omit<CartItem, "quantity">; quantity?: number }
  | { type: "set"; productId: number; quantity: number }
  | { type: "remove"; productId: number }
  | { type: "clear" }
  | { type: "hydrate"; items: CartItem[] };

const STORAGE_KEY = "clon-shopify.cart";

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add": {
      const qty = action.quantity ?? 1;
      const existing = state.items.find((i) => i.productId === action.item.productId);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === action.item.productId
              ? { ...i, quantity: Math.min(i.stock, i.quantity + qty) }
              : i
          ),
        };
      }
      return {
        items: [...state.items, { ...action.item, quantity: Math.min(action.item.stock, qty) }],
      };
    }
    case "set": {
      if (action.quantity <= 0) {
        return { items: state.items.filter((i) => i.productId !== action.productId) };
      }
      return {
        items: state.items.map((i) =>
          i.productId === action.productId ? { ...i, quantity: Math.min(i.stock, action.quantity) } : i
        ),
      };
    }
    case "remove":
      return { items: state.items.filter((i) => i.productId !== action.productId) };
    case "clear":
      return { items: [] };
    case "hydrate":
      return { items: action.items };
    default:
      return state;
  }
}

import { useState } from "react";

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotalCents: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  add: (item: Omit<CartItem, "quantity">, quantity?: number, openDrawer?: boolean) => void;
  setQuantity: (productId: number, quantity: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
  isReady: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });
  const [isReady, setIsReady] = useReducer(() => false, false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.items)) dispatch({ type: "hydrate", items: parsed.items });
      }
    } catch {
      // Corrupt storage — start fresh.
    }
    setIsReady();
  }, []);

  useEffect(() => {
    if (!isReady) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, isReady]);

  const value = useMemo<CartContextValue>(() => {
    const count = state.items.reduce((n, i) => n + i.quantity, 0);
    const subtotalCents = state.items.reduce((n, i) => n + i.priceCents * i.quantity, 0);
    return {
      items: state.items,
      count,
      subtotalCents,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      toggleCart: () => setIsOpen((v) => !v),
      isReady,
      add: (item, quantity, openDrawer = true) => {
        dispatch({ type: "add", item, quantity });
        if (openDrawer) setIsOpen(true);
      },
      setQuantity: (productId, quantity) => dispatch({ type: "set", productId, quantity }),
      remove: (productId) => dispatch({ type: "remove", productId }),
      clear: () => dispatch({ type: "clear" }),
    };
  }, [state, isReady, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

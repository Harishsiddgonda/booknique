import React from "react";
import {
  ShoppingBag,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  Package
} from "lucide-react";
import { formatINR } from "../utils/api";

export default function ProductCard({
  item,
  onQuickView,
  onAddToCart,
  onInstantRent,
  isInCart = false
}) {
  const isAvailable = item.rental_status === "Available" && item.available_quantity > 0;
  const isBook = item.type === "Book";

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-400/60 transition-all duration-300 flex flex-col justify-between">
      
      {/* Top Media & Badges */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={
            item.image_url ||
            (isBook
              ? "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
              : "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=600&q=80")
          }
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Type Badge (Top Left) */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-bold shadow-md">
          {isBook ? <BookOpen className="w-3.5 h-3.5 text-amber-400" /> : <Package className="w-3.5 h-3.5 text-amber-400" />}
          <span>{item.type}</span>
        </div>

        {/* Availability Badge (Top Right) */}
        <div className="absolute top-3 right-3">
          {isAvailable ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider shadow">
              <CheckCircle2 className="w-3 h-3" />
              <span>Available</span>
            </span>
          ) : item.rental_status === "Maintenance" ? (
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/90 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider shadow">
              Maintenance
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/95 backdrop-blur-md text-slate-950 text-[10px] font-black uppercase tracking-wider shadow">
              <Clock className="w-3 h-3" />
              <span>Rented</span>
            </span>
          )}
        </div>

        {/* Quick View Floating Action */}
        <button
          onClick={() => onQuickView(item)}
          className="absolute bottom-3 right-3 p-2 rounded-xl bg-white/90 hover:bg-white text-slate-900 shadow-md backdrop-blur-md transition-all hover:scale-110"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Body Information */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Age Group Tags */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-500 mb-1.5">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
              {item.category_name || "General"}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-amber-700 font-bold">
              {item.age_group || "All ages"}
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onQuickView(item)}
            className="font-bold text-slate-900 text-sm leading-snug hover:text-amber-600 cursor-pointer line-clamp-1 transition-colors"
          >
            {item.title}
          </h3>

          {/* Author or Brand */}
          <p className="text-xs text-slate-500 truncate mt-0.5">
            By {item.author_or_brand || "Curated Edition"}
          </p>
        </div>

        {/* Pricing in INR */}
        <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Monthly Rental</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-slate-900 font-display">
                {formatINR(item.monthly_rental_fee)}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">/mo</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-medium block">Deposit (Refundable)</span>
            <span className="text-xs font-bold text-slate-700">
              {formatINR(item.security_deposit || 0)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => onQuickView(item)}
            className="py-2 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
          >
            Details
          </button>

          <button
            disabled={!isAvailable}
            onClick={() => onAddToCart(item)}
            className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm ${
              !isAvailable
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                : isInCart
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isInCart ? "In Bag" : "Rent Now"}</span>
          </button>
        </div>

      </div>

    </div>
  );
}

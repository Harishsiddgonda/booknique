import React from "react";
import {
  X,
  ShoppingBag,
  BookOpen,
  Package,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  MapPin,
  Tag
} from "lucide-react";
import { formatINR } from "../utils/api";

export default function ProductQuickView({
  item,
  onClose,
  onAddToCart,
  isInCart = false
}) {
  if (!item) return null;

  const isAvailable = item.rental_status === "Available" && item.available_quantity > 0;
  const isBook = item.type === "Book";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      />

      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Left Cover Image */}
            <div className="relative h-64 md:h-full min-h-[300px] bg-slate-900">
              <img
                src={
                  item.image_url ||
                  (isBook
                    ? "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
                    : "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=600&q=80")
                }
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                    {item.type}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-semibold">
                    Code: {item.item_code}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Location: <span className="text-white font-semibold">{item.shelf_location || "Store Display"}</span>
                </p>
              </div>
            </div>

            {/* Right Information */}
            <div className="p-6 flex flex-col justify-between space-y-4">
              <div>
                {/* Category & Age Group Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
                    {item.category_name}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                    Age: {item.age_group}
                  </span>
                </div>

                <h2 className="text-xl font-black text-slate-900 font-display leading-tight">
                  {item.title}
                </h2>
                
                <p className="text-xs text-slate-500 mt-1">
                  By <span className="font-semibold text-slate-700">{item.author_or_brand}</span>
                  {item.isbn_or_model && ` • ISBN/Model: ${item.isbn_or_model}`}
                </p>

                {/* Description */}
                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {item.description || "Premium quality item maintained according to BookNique safety and hygiene standards. Sanitized before and after every rental."}
                </p>

                {/* Specs Box */}
                <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Physical Condition</span>
                    <span className="font-bold text-slate-800">{item.condition_status || "Excellent"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Stock Availability</span>
                    <span className={`font-bold ${isAvailable ? "text-emerald-700" : "text-amber-700"}`}>
                      {isAvailable ? `${item.available_quantity} Unit(s) Ready` : "Currently Checked Out"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pricing & CTA */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Monthly Rental</span>
                    <span className="text-2xl font-black text-slate-900 font-display">
                      {formatINR(item.monthly_rental_fee)}
                    </span>
                    <span className="text-xs text-slate-500"> /month</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-medium block">Security Deposit</span>
                    <span className="text-sm font-bold text-slate-700">
                      {formatINR(item.security_deposit || 0)}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold block">100% Refundable</span>
                  </div>
                </div>

                <button
                  disabled={!isAvailable}
                  onClick={() => {
                    onAddToCart(item);
                    onClose();
                  }}
                  className={`w-full py-3 px-4 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-md ${
                    !isAvailable
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : isInCart
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20"
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isInCart ? "Already in Rental Bag" : "Add to Rental Bag"}</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

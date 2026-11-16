import React from "react";
import {
  Sparkles,
  Search,
  BookOpen,
  Package,
  Truck,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle2,
  Tag
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import { formatINR } from "../utils/api";

export default function HomeDashboardView({
  customer,
  inventory = [],
  activeBorrowCount = 0,
  cart = [],
  onAddToCart,
  onQuickView,
  onNavigate,
  onSearchFocus
}) {
  const books = inventory.filter(i => i.type === "Book");
  const toys = inventory.filter(i => i.type === "Toy");
  const maxAllowed = customer?.max_items_allowed || 4;

  const categories = [
    { name: "Board Books", type: "Book", icon: BookOpen, count: 4, color: "from-amber-500 to-amber-600" },
    { name: "Picture Books", type: "Book", icon: Sparkles, count: 3, color: "from-emerald-500 to-teal-600" },
    { name: "Building Blocks", type: "Toy", icon: Package, count: 3, color: "from-blue-500 to-indigo-600" },
    { name: "STEM & Science", type: "Toy", icon: TrendingUp, count: 2, color: "from-purple-500 to-violet-600" },
    { name: "Playsets / Trains", type: "Toy", icon: Truck, count: 2, color: "from-rose-500 to-pink-600" }
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Top Welcome & Search */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-500 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bengaluru • Electronic City</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-display text-slate-900 mt-0.5">
              Welcome, {customer?.full_name?.split(" ")[0] || "Member"}! 👋
            </h1>
          </div>

          {/* Quota Mini Badge */}
          <div
            onClick={() => onNavigate("customer_rentals")}
            className="p-2 sm:px-3 sm:py-1.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-amber-700 font-bold block uppercase">Quota</span>
              <span className="text-xs font-black text-slate-900">{activeBorrowCount}/{maxAllowed} Items</span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
              {activeBorrowCount}
            </div>
          </div>
        </div>

        {/* Quick Search Tap Bar */}
        <div
          onClick={onSearchFocus}
          className="relative flex items-center p-3 rounded-2xl bg-white border border-slate-200 text-slate-400 text-xs shadow-xs cursor-pointer hover:border-amber-400 transition-all"
        >
          <Search className="w-4 h-4 text-slate-400 mr-2.5" />
          <span>Search 500+ storybooks, Lego sets, STEM kits...</span>
        </div>
      </div>

      {/* Hero Offer Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-5 sm:p-7 shadow-xl border border-slate-800">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-md">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-400/30">
            <Tag className="w-3 h-3" />
            <span>Neeladri Road Store Special</span>
          </div>

          <h2 className="text-lg sm:text-2xl font-black font-display text-white leading-tight">
            Unlimited Reading & Play <br />
            <span className="text-amber-400">Delivered To Your Doorstep</span>
          </h2>

          <p className="text-[11px] text-slate-300">
            Free doorstep delivery & sanitation across Electronic City Phase 1 & 2. Zero deposit stress.
          </p>

          <div className="pt-2">
            <button
              onClick={() => onNavigate("customer_catalog")}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Horizontal Quick Grid */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-sm text-slate-900">Explore by Category</h3>
          <button
            onClick={() => onNavigate("customer_catalog")}
            className="text-xs font-bold text-amber-600 hover:text-amber-700"
          >
            See All
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                onClick={() => onNavigate("customer_catalog")}
                className="p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-400 shadow-xs cursor-pointer transition-all flex items-center gap-3"
              >
                <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${cat.color} text-white shadow-xs`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 text-xs truncate">{cat.name}</h4>
                  <span className="text-[10px] text-slate-400">{cat.type}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Popular Children's Books Shelf */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="font-bold text-base text-slate-900 font-display">Popular Children's Books</h3>
            <p className="text-[11px] text-slate-500">Board books & illustrated classics from ₹149/mo</p>
          </div>
          <button
            onClick={() => onNavigate("customer_catalog")}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-0.5"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {books.slice(0, 4).map(item => (
            <ProductCard
              key={item.id}
              item={item}
              isInCart={cart.some(c => c.id === item.id)}
              onQuickView={onQuickView}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>

      {/* Trending Educational Toys & STEM */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="font-bold text-base text-slate-900 font-display">STEM & Building Toys</h3>
            <p className="text-[11px] text-slate-500">Lego bricks, wooden trains, and robotics sets</p>
          </div>
          <button
            onClick={() => onNavigate("customer_catalog")}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-0.5"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {toys.slice(0, 4).map(item => (
            <ProductCard
              key={item.id}
              item={item}
              isInCart={cart.some(c => c.id === item.id)}
              onQuickView={onQuickView}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>

    </div>
  );
}

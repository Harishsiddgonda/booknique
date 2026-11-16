import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  BookOpen,
  Package,
  Sparkles,
  MapPin,
  ShieldCheck,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  ShoppingBag
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import ProductQuickView from "../components/ProductQuickView";
import { formatINR } from "../utils/api";

export default function CustomerCatalogView({
  inventory,
  customer,
  cart,
  onAddToCart,
  search,
  setSearch,
  typeFilter,
  setTypeFilter,
  ageFilter,
  setAgeFilter,
  onNavigate
}) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [quickViewItem, setQuickViewItem] = useState(null);

  // Available categories
  const categories = [
    "All",
    "Board Book",
    "Picture Book",
    "Fantasy Fiction",
    "Building Blocks",
    "Playsets / Trains",
    "Infant Development",
    "STEM & Science",
    "Puzzles & Brainteasers"
  ];

  const ageGroups = ["All", "0-3 years", "4-8 years", "7-12 years", "9-12 years", "All ages"];

  // Filter logic
  const filtered = useMemo(() => {
    return inventory.filter(item => {
      // Type filter
      if (typeFilter !== "All" && item.type !== typeFilter) return false;
      // Category filter
      if (selectedCategory !== "All" && item.category_name !== selectedCategory) return false;
      // Age group filter
      if (ageFilter !== "All" && item.age_group !== ageFilter) return false;
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchAuthor = item.author_or_brand?.toLowerCase().includes(q);
        const matchCat = item.category_name?.toLowerCase().includes(q);
        const matchCode = item.item_code?.toLowerCase().includes(q);
        if (!matchTitle && !matchAuthor && !matchCat && !matchCode) return false;
      }
      return true;
    });
  }, [inventory, typeFilter, selectedCategory, ageFilter, search]);

  const bookCount = inventory.filter(i => i.type === "Book").length;
  const toyCount = inventory.filter(i => i.type === "Toy").length;

  return (
    <div className="space-y-8 pb-12">
      
      {/* Hero Marketplace Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-10 border border-slate-800 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Neeladri Road • Electronic City Phase 1, Bengaluru</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white leading-tight">
            Curated Books & Toys <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200">
              Delivered To Your Door
            </span>
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Borrow award-winning children's storybooks, board books, Lego construction sets, and STEM toys.
            Save money, cut clutter, and ignite your child's curiosity with zero deposit hassle.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Doorstep Delivery Across ECITY & South Bengaluru</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>UV-C Sanitized Before Every Dispatch</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Filter & Navigation Strip */}
      <div className="space-y-4">
        
        {/* Type Selector (All, Books, Toys) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setTypeFilter("All")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                typeFilter === "All"
                  ? "bg-slate-900 text-white shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Items ({inventory.length})
            </button>
            <button
              onClick={() => setTypeFilter("Book")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                typeFilter === "Book"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Books Only ({bookCount})</span>
            </button>
            <button
              onClick={() => setTypeFilter("Toy")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                typeFilter === "Toy"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Toys & STEM ({toyCount})</span>
            </button>
          </div>

          {/* Age Group Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 hidden sm:inline">Age:</span>
            <select
              value={ageFilter}
              onChange={e => setAgeFilter(e.target.value)}
              className="text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {ageGroups.map(age => (
                <option key={age} value={age}>
                  {age === "All" ? "All Age Groups" : `Age: ${age}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results Count & Active Filters Indicator */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Showing <strong className="text-slate-900">{filtered.length}</strong> items available for rental
          </span>
          {(typeFilter !== "All" || selectedCategory !== "All" || ageFilter !== "All" || search) && (
            <button
              onClick={() => {
                setTypeFilter("All");
                setSelectedCategory("All");
                setAgeFilter("All");
                setSearch("");
              }}
              className="text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No matching items found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keyword or switching category and age filters.
          </p>
          <button
            onClick={() => {
              setTypeFilter("All");
              setSelectedCategory("All");
              setAgeFilter("All");
              setSearch("");
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(item => (
            <ProductCard
              key={item.id}
              item={item}
              isInCart={cart.some(c => c.id === item.id)}
              onQuickView={i => setQuickViewItem(i)}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewItem && (
        <ProductQuickView
          item={quickViewItem}
          isInCart={cart.some(c => c.id === quickViewItem.id)}
          onClose={() => setQuickViewItem(null)}
          onAddToCart={onAddToCart}
        />
      )}

    </div>
  );
}

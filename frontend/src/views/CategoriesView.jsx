import React, { useState, useEffect } from "react";
import { BookOpen, Package, ChevronRight, Layers, Sparkles } from "lucide-react";
import { request } from "../utils/api";

export default function CategoriesView({ onSelectCategory }) {
  const [categories, setCategories] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All"); // 'All', 'Book', 'Toy'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await request("/api/categories");
        setCategories(data);
      } catch (err) {
        console.error("Categories error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  const filtered = categories.filter(c => {
    if (activeFilter === "All") return true;
    return c.type === activeFilter;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display">Explore Categories</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse our curated collections of children's books and developmental STEM toys.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl">
          {["All", "Book", "Toy"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeFilter === tab ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab === "All" ? "All Categories" : tab === "Book" ? "Books Only" : "Toys Only"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading categories...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filtered.map(cat => {
            const isBook = cat.type === "Book";
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory && onSelectCategory(cat.name, cat.type)}
                className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-amber-400/80 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isBook ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"
                    }`}>
                      {isBook ? <BookOpen className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {cat.item_count} items
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors mb-1.5">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {cat.description || `Curated collection of ${cat.name.toLowerCase()} for all age groups.`}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
                  <span>Browse Category</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

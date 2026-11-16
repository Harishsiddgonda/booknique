import React from "react";
import {
  Boxes,
  Plus,
  Download,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BookOpen,
  Package
} from "lucide-react";
import { formatINR, exportToCSV } from "../utils/api";

export default function InventoryView({
  items = [],
  search,
  setSearch,
  typeFilter,
  setTypeFilter,
  ageFilter,
  setAgeFilter,
  statusFilter,
  setStatusFilter,
  onAdd,
  onEdit,
  onDelete
}) {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-display text-slate-900">
            Inventory & Catalog Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Physical stock allocation, pricing in Indian Rupees (₹), shelf locations, and condition status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV("booknique_inventory", items)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onAdd}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search title, author, brand or code..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none"
          >
            <option value="All">All Types</option>
            <option value="Book">Books Only</option>
            <option value="Toy">Toys Only</option>
          </select>

          <select
            value={ageFilter}
            onChange={e => setAgeFilter(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none"
          >
            <option value="All">All Ages</option>
            <option value="0-3 years">0-3 years</option>
            <option value="4-8 years">4-8 years</option>
            <option value="7-12 years">7-12 years</option>
            <option value="9-12 years">9-12 years</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Rented">Rented</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>

      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Item Code</th>
                <th className="py-3 px-4">Title & Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Age Group</th>
                <th className="py-3 px-4">Monthly Fee (₹)</th>
                <th className="py-3 px-4">Deposit (₹)</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{item.item_code}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.image_url || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=100&q=80"}
                        alt={item.title}
                        className="w-9 h-11 rounded-lg object-cover border border-slate-100 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate max-w-xs">{item.title}</p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {item.author_or_brand || item.type}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">{item.category_name}</td>
                  <td className="py-3 px-4 text-slate-600 font-medium">{item.age_group}</td>
                  <td className="py-3 px-4 font-black text-slate-900">
                    {formatINR(item.monthly_rental_fee)}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {formatINR(item.security_deposit || 0)}
                  </td>
                  <td className="py-3 px-4 font-bold">
                    <span className={item.available_quantity > 0 ? "text-emerald-700" : "text-rose-600"}>
                      {item.available_quantity}
                    </span>
                    <span className="text-slate-400 font-normal"> / {item.total_quantity}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.rental_status === "Available"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.rental_status === "Maintenance"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {item.rental_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {item.shelf_location || "A-1"}
                  </td>
                  <td className="py-3 px-4 text-right space-x-1">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                      title="Edit Item"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

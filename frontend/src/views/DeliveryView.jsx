import React from "react";
import { Truck, Package, CheckCircle2, Clock, MapPin, User } from "lucide-react";
import { formatINR } from "../utils/api";

export default function DeliveryView({ rentals = [], onUpdateDelivery }) {
  const stages = [
    { key: "Order Placed", label: "1. Order Placed", color: "border-slate-300 text-slate-700 bg-slate-50" },
    { key: "Packed", label: "2. Packed & Sanitized", color: "border-blue-300 text-blue-700 bg-blue-50" },
    { key: "Out for Delivery", label: "3. Out for Delivery", color: "border-amber-300 text-amber-700 bg-amber-50" },
    { key: "Delivered", label: "4. Delivered to Member", color: "border-emerald-300 text-emerald-700 bg-emerald-50" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black font-display text-slate-900">
          Doorstep Delivery & Dispatch Pipeline
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time fulfillment tracking for Bengaluru Electronic City Phase 1 & 2 doorstep routes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map(stage => {
          const list = rentals.filter(r => (r.delivery_status || "Delivered") === stage.key);

          return (
            <div key={stage.key} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center justify-between ${stage.color}`}>
                <span>{stage.label}</span>
                <span className="font-black">{list.length}</span>
              </div>

              <div className="space-y-3 min-h-[300px]">
                {list.length === 0 ? (
                  <div className="py-12 text-center text-[11px] text-slate-400">
                    No orders in this stage
                  </div>
                ) : (
                  list.map(r => (
                    <div
                      key={r.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-all text-xs space-y-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900">{r.rental_code}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{r.rent_date}</span>
                      </div>

                      <div>
                        <p className="font-bold text-slate-900 truncate">{r.item_title}</p>
                        <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{r.customer_name} ({r.member_code})</span>
                        </p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-amber-500" />
                          <span className="truncate">Neeladri Road, ECITY-1</span>
                        </p>
                      </div>

                      {/* Advance Stage Selector */}
                      <div className="pt-2 border-t border-slate-200/80">
                        <select
                          value={r.delivery_status || "Delivered"}
                          onChange={e => onUpdateDelivery(r.id, e.target.value)}
                          className="w-full py-1 px-2 rounded-lg border border-slate-300 bg-white font-semibold text-[11px] focus:outline-none"
                        >
                          <option value="Order Placed">Stage: Order Placed</option>
                          <option value="Packed">Stage: Packed</option>
                          <option value="Out for Delivery">Stage: Out for Delivery</option>
                          <option value="Delivered">Stage: Delivered</option>
                          <option value="Returned to Store">Stage: Returned</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

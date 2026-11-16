import React from "react";
import { Building2, Package, Check, Clock, Plus, Phone, MapPin } from "lucide-react";
import { formatINR } from "../utils/api";

export default function ProcurementView({
  procurements = [],
  suppliers = [],
  onReceiveOrder
}) {
  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black font-display text-slate-900">
          Suppliers & Procurement Restock
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Wholesale purchase orders, vendor contracts, and automated inventory intake in Indian Rupees (₹).
        </p>
      </div>

      {/* Procurement Orders Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm space-y-3 p-5">
        <h3 className="font-bold text-sm text-slate-900">Restock Purchase Orders</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-4">Notes / Batch</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">PO Total (₹)</th>
                <th className="py-3 px-4 text-right">Intake Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {procurements.map(po => (
                <tr key={po.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-900">{po.order_number}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{po.supplier_name || "Official Distributor"}</td>
                  <td className="py-3 px-4 text-slate-600">{po.order_date}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{po.notes}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        po.status === "Received"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {po.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-black text-slate-900">
                    {formatINR(po.total_amount)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {po.status !== "Received" ? (
                      <button
                        onClick={() => onReceiveOrder(po.id)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[11px] shadow-sm transition-all"
                      >
                        Mark Received (+Stock)
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-700 font-bold flex items-center justify-end gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Stock Incremented</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Directory */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-slate-900">Authorized Publishers & Toy Distributors</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {suppliers.map(s => (
            <div
              key={s.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3"
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Vendor #{s.id}</span>
                <h4 className="font-bold text-slate-900 text-sm mt-0.5">{s.name}</h4>
                <p className="text-xs text-slate-500 mt-1">Contact: {s.contact_person}</p>
              </div>

              <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{s.phone}</span>
                </p>
                <p className="flex items-center gap-1.5 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{s.address}</span>
                </p>
              </div>

              <div className="text-[11px] font-semibold text-amber-700 bg-amber-50 p-2 rounded-xl">
                {s.items_supplied}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

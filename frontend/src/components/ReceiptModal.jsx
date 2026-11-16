import React from "react";
import { X, Printer, CheckCircle2, BookOpen, MapPin, Phone } from "lucide-react";
import { formatINR } from "../utils/api";

export default function ReceiptModal({ receipt, onClose }) {
  if (!receipt) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      />

      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          
          {/* Action Bar (Not Printed) */}
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between no-print">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Tax Invoice & Receipt
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Receipt Body */}
          <div className="p-8 space-y-6 printable-receipt text-slate-900">
            
            {/* Header */}
            <div className="border-b border-slate-200 pb-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl font-black font-display tracking-wider text-slate-900">
                    BOOK<span className="text-amber-600">NIQUE</span>
                  </h2>
                </div>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">
                  The Book & Toy Store
                </p>
                <div className="text-[10px] text-slate-500 mt-2 space-y-0.5">
                  <p className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-600" />
                    <span>4th Floor, Above Titan Eye Plus, Neeladri Road, ECITY-1</span>
                  </p>
                  <p>Bengaluru, Karnataka - 560100</p>
                  <p className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-amber-600" />
                    <span>Helpline: +91 9000357691 / 9731597313</span>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider mb-2">
                  PAID
                </span>
                <p className="text-xs font-bold text-slate-900">
                  {receipt.invoice_number || `INV-${receipt.rental_code || "8001"}`}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Date: {receipt.payment_date || receipt.rent_date || new Date().toISOString().slice(0, 10)}
                </p>
              </div>
            </div>

            {/* Bill To Info */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Billed To
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  {receipt.customer_name || receipt.customer || "Registered Member"}
                </p>
                <p className="text-slate-500 mt-0.5">
                  Member ID: {receipt.member_code || receipt.member_id || "M101"}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Payment Mode
                </span>
                <p className="font-bold text-slate-900">
                  {receipt.payment_method || "UPI / Card"}
                </p>
                <p className="text-slate-500 text-[10px] mt-0.5">
                  Ref: {receipt.transaction_ref || "TXN-AUTO-VERIFIED"}
                </p>
              </div>
            </div>

            {/* Itemized Table */}
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                  <th className="py-2 text-left font-bold">Item Description</th>
                  <th className="py-2 text-center font-bold">Type</th>
                  <th className="py-2 text-right font-bold">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3">
                    <p className="font-bold text-slate-900">
                      {receipt.item_title || receipt.item || "Rental Subscription / Item Checkout"}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {receipt.notes || "Monthly rental charge with doorstep logistics"}
                    </p>
                  </td>
                  <td className="py-3 text-center text-slate-600">Rental</td>
                  <td className="py-3 text-right font-black text-slate-900">
                    {formatINR(receipt.amount || receipt.monthly_fee || 0)}
                  </td>
                </tr>

                {Number(receipt.late_fee_charged || 0) > 0 && (
                  <tr>
                    <td className="py-3">
                      <p className="font-bold text-rose-700">Overdue Late Fee</p>
                      <p className="text-[10px] text-rose-500">Standard rate of ₹50.00 / day</p>
                    </td>
                    <td className="py-3 text-center text-rose-600">Late Fee</td>
                    <td className="py-3 text-right font-black text-rose-700">
                      {formatINR(receipt.late_fee_charged)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Total Summary */}
            <div className="border-t-2 border-slate-900 pt-3 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatINR(Number(receipt.amount || receipt.monthly_fee || 0) + Number(receipt.late_fee_charged || 0))}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (0% Educational Exemption):</span>
                <span>₹0.00</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount Paid:</span>
                <span className="text-amber-600 font-display">
                  {formatINR(Number(receipt.amount || receipt.monthly_fee || 0) + Number(receipt.late_fee_charged || 0))}
                </span>
              </div>
            </div>

            {/* Terms Footer */}
            <div className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-4 leading-relaxed">
              <p>Thank you for choosing BookNique! Please keep all items clean and dry.</p>
              <p className="font-semibold text-slate-500">
                "Books • Knowledge • A Brighter Tomorrow"
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

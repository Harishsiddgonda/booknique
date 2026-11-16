import React, { useState } from "react";
import {
  X,
  Trash2,
  ShoppingBag,
  ShieldCheck,
  Truck,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { formatINR } from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onRemoveFromCart,
  onClearCart,
  activeBorrowCount = 0,
  onCheckoutSuccess
}) {
  const { customer, user } = useAuth();
  const [duration, setDuration] = useState(30); // 15 or 30 days
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const maxAllowed = customer?.max_items_allowed || 2;
  const currentTotal = activeBorrowCount + cart.length;
  const isOverQuota = currentTotal > maxAllowed;

  // Financial Calculations
  const subtotalRentalFee = cart.reduce((sum, item) => sum + Number(item.monthly_rental_fee || 0), 0);
  const subtotalDeposit = cart.reduce((sum, item) => sum + Number(item.security_deposit || 0), 0);
  const grandTotal = subtotalRentalFee + subtotalDeposit;

  async function handleCheckout() {
    setErrorMsg("");
    if (!customer) {
      setErrorMsg("Please switch to or log in as a customer account to place rentals.");
      return;
    }
    if (customer.status === "Suspended") {
      setErrorMsg("Your account is currently Suspended due to unpaid dues. Borrowing is blocked.");
      return;
    }
    if (cart.length === 0) {
      setErrorMsg("Your rental bag is empty.");
      return;
    }
    if (isOverQuota) {
      setErrorMsg(`Quota exceeded. Your plan allows ${maxAllowed} simultaneous items. You already have ${activeBorrowCount} active item(s).`);
      return;
    }

    setIsSubmitting(true);
    try {
      // Issue rentals sequentially for all cart items
      for (const item of cart) {
        const today = new Date();
        const dueDate = new Date();
        dueDate.setDate(today.getDate() + Number(duration));

        const res = await fetch("/api/rentals", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("rsr_token") || ""}`
          },
          body: JSON.stringify({
            customer_id: customer.id,
            item_id: item.id,
            rent_date: today.toISOString().slice(0, 10),
            due_date: dueDate.toISOString().slice(0, 10),
            amount: item.monthly_rental_fee,
            payment_method: paymentMethod,
            notes: `Online bag checkout (${duration}-day rental, ${paymentMethod})`
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `Failed to checkout item "${item.title}".`);
        }
      }

      onClearCart();
      onClose();
      if (onCheckoutSuccess) {
        onCheckoutSuccess(cart.length);
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to complete rental checkout.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500 rounded-lg text-slate-950">
                <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-extrabold text-base font-display">Your Rental Bag</h3>
                <p className="text-xs text-slate-400">
                  {cart.length} {cart.length === 1 ? "item" : "items"} selected
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quota Progress Bar */}
          <div className="px-5 py-3 bg-amber-50/80 border-b border-amber-200/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-700">Member Borrowing Quota:</span>
              <span className={`font-black ${isOverQuota ? "text-rose-600" : "text-amber-800"}`}>
                {currentTotal} / {maxAllowed} Items
              </span>
            </div>
            <div className="w-full bg-amber-200/60 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isOverQuota ? "bg-rose-500" : "bg-amber-500"
                }`}
                style={{ width: `${Math.min(100, (currentTotal / maxAllowed) * 100)}%` }}
              />
            </div>
            {isOverQuota && (
              <p className="text-[11px] text-rose-600 font-semibold mt-1">
                ⚠️ Plan limit reached. Remove {currentTotal - maxAllowed} item(s) to proceed.
              </p>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-700 text-sm">Your rental bag is empty</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Explore our curated books and toys catalog and click "Add to Bag" to rent.
                </p>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="flex gap-3.5 p-3 rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-slate-300 transition-all"
                >
                  <img
                    src={item.image_url || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80"}
                    alt={item.title}
                    className="w-16 h-20 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <span className="text-[10px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {item.type}
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs truncate mt-1">
                          {item.title}
                        </h4>
                      </div>
                      <button
                        onClick={() => onRemoveFromCart(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-black text-slate-900">
                          {formatINR(item.monthly_rental_fee)}
                        </span>
                        <span className="text-[10px] text-slate-500"> /month</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Deposit: {formatINR(item.security_deposit || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Controls */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3.5">
              
              {/* Duration Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Rental Duration</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDuration(15)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      duration === 15
                        ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    15 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setDuration(30)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      duration === 30
                        ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    30 Days (Standard)
                  </button>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full text-xs font-medium py-2 px-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="Credit Card">Credit / Debit Card</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Cash">Cash on Doorstep Delivery</option>
                </select>
              </div>

              {/* Delivery Address Reminder */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-[11px] text-slate-600">
                  <span className="font-bold text-slate-900 block">Delivering to:</span>
                  {customer?.address || "Neeladri Road, Electronic City Phase 1, Bengaluru"}
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-1 text-xs border-t border-slate-200 pt-2.5">
                <div className="flex justify-between text-slate-600">
                  <span>Rental Fees:</span>
                  <span>{formatINR(subtotalRentalFee)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Refundable Deposit:</span>
                  <span>{formatINR(subtotalDeposit)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Doorstep Delivery:</span>
                  </span>
                  <span>FREE</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
                  <span>Grand Total:</span>
                  <span className="text-amber-600 font-display text-base">
                    {formatINR(grandTotal)}
                  </span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Checkout Action Button */}
              <button
                type="button"
                disabled={isSubmitting || isOverQuota}
                onClick={handleCheckout}
                className="w-full py-3 px-4 rounded-xl font-extrabold text-xs text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <span>Processing Rental Order...</span>
                ) : (
                  <>
                    <span>Confirm & Rent ({formatINR(grandTotal)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

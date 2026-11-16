import React from "react";
import { Check, CreditCard, Sparkles, ShieldCheck, ArrowRight, BookOpen, Package } from "lucide-react";
import { formatINR } from "../utils/api";

export default function CustomerSubscriptionView({ customer, plans = [], activeCount = 0 }) {
  const currentPlan = plans.find(p => p.id === customer?.subscription_plan_id) || plans[1] || {
    name: "Premium (Books + Toys)",
    price: 999.00,
    max_total_items: 4,
    description: "Balanced combination of 2 books and 2 toys with free doorstep collection."
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black font-display text-slate-900">
          Membership Plans & Subscriptions
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Flexible monthly plans with doorstep delivery, zero deposit stress, and unlimited swaps.
        </p>
      </div>

      {/* Current Active Plan Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-950 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/15 text-slate-950 text-[10px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Current Active Plan</span>
          </div>
          <h2 className="text-2xl font-black font-display text-slate-950">
            {currentPlan.name}
          </h2>
          <p className="text-xs text-slate-900 leading-relaxed font-medium">
            {currentPlan.description}
          </p>
          <div className="flex items-center gap-4 text-xs font-bold pt-1">
            <span>Quota: {customer?.max_items_allowed || currentPlan.max_total_items || 4} simultaneous items</span>
            <span>•</span>
            <span>Currently in use: {activeCount} item(s)</span>
          </div>
        </div>

        <div className="text-left md:text-right bg-slate-950/10 p-5 rounded-2xl md:min-w-[180px]">
          <span className="text-[10px] uppercase font-bold text-slate-800 block">Subscription Fee</span>
          <div className="text-3xl font-black text-slate-950 font-display">
            {formatINR(currentPlan.price)}
          </div>
          <span className="text-xs font-bold text-slate-800">per month (Billed monthly)</span>
        </div>
      </div>

      {/* Available Plans Grid */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
          Explore All BookNique Membership Tiers
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map(p => {
            const isCurrent = p.id === customer?.subscription_plan_id || p.name === currentPlan.name;

            return (
              <div
                key={p.id}
                className={`p-6 rounded-3xl bg-white border flex flex-col justify-between transition-all ${
                  isCurrent
                    ? "border-amber-400 ring-2 ring-amber-400/30 shadow-lg"
                    : "border-slate-200 hover:border-slate-300 shadow-sm"
                }`}
              >
                <div>
                  {isCurrent && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase mb-2">
                      Active Plan
                    </span>
                  )}
                  <h4 className="font-bold text-slate-900 text-base">{p.name}</h4>
                  
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 font-display">
                      {formatINR(p.price)}
                    </span>
                    <span className="text-xs text-slate-500">/mo</span>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {p.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Check className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span>{p.max_total_items} items at a time</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Check className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span>Free doorstep swap in Bengaluru</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Check className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span>Sanitized & inspected packaging</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-4">
                  <button
                    disabled={isCurrent}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isCurrent
                        ? "bg-slate-100 text-slate-400 cursor-default"
                        : "bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                    }`}
                  >
                    {isCurrent ? "Current Enrolled Plan" : "Switch Plan"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

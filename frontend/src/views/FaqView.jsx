import React, { useState } from "react";
import { ChevronDown, HelpCircle, ShieldCheck, Truck, RefreshCcw, CreditCard } from "lucide-react";

export default function FaqView() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      category: "Rentals & Borrowing",
      icon: RefreshCcw,
      q: "How does borrowing books and toys work with Booknique?",
      a: "Select your books and toys from our catalog, choose either a 15-day or 30-day rental period, and checkout. We deliver sanitized items in sealed eco-totes straight to your doorstep in Bengaluru Electronic City. When you finish, request an exchange through the app, and our courier delivers your next batch while picking up the returned items simultaneously."
    },
    {
      category: "Sanitization & Hygiene",
      icon: ShieldCheck,
      q: "Are the toys safe and hygienic for toddlers who mouth toys?",
      a: "Yes, 100%! We strictly follow pediatric-grade sterilization standards. Every plastic, silicone, or wooden toy is first washed with food-grade botanical detergent, ultrasonically scrubbed, and then sterilized inside our medical UVC radiation chamber before being vacuum-sealed for delivery."
    },
    {
      category: "Doorstep Delivery",
      icon: Truck,
      q: "Which areas in Bengaluru do you deliver to?",
      a: "We provide dedicated doorstep delivery and pickup across Electronic City Phase 1 & 2, Neeladri Road, Doddathoguru, Neo Town, Hulimangala, Shikaripalya, Bettadasanapura, and adjoining tech corridors. Delivery is 100% free for active monthly subscribers."
    },
    {
      category: "Security Deposit & Returns",
      icon: CreditCard,
      q: "When is my security deposit refunded?",
      a: "Security deposits are held in escrow for high-value items (such as 790-piece Lego kits or electronic train sets). As soon as the returned toy passes standard completeness inspection at our store desk, your security deposit is released instantly back to your UPI or payment account within 24 hours."
    },
    {
      category: "Missing Pieces & Wear",
      icon: HelpCircle,
      q: "What happens if my child loses a puzzle piece or tears a book page?",
      a: "Normal reading wear and tear is completely covered! For infant board books, slight nibbles or crinkles are expected. If a piece from a 50+ piece Lego set or puzzle is lost, we check our spare-parts bin first. Moderate damages incur only direct replacement costs without arbitrary penalties."
    },
    {
      category: "Late Fees",
      icon: RefreshCcw,
      q: "What is the late fee policy if I forget to return on the due date?",
      a: "We send WhatsApp and in-app reminders 3 days before your due date. You can extend your rental period anytime through the app with 1 tap. Overdue items without an extension incur a standard ₹30 per day charge until returned or renewed."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display">Frequently Asked Questions</h1>
        <p className="text-xs text-slate-500 mt-1">
          Everything you need to know about Booknique subscriptions, toy hygiene, delivery, and returns.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          const Icon = faq.icon;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isOpen ? "bg-white border-amber-400/50 shadow-md ring-1 ring-amber-400/20" : "bg-white/80 border-slate-200 hover:border-slate-300"
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isOpen ? "bg-amber-500 text-slate-950 font-bold" : "bg-slate-100 text-slate-500"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block mb-0.5">
                      {faq.category}
                    </span>
                    <h3 className="text-xs md:text-sm font-bold text-slate-900">
                      {faq.q}
                    </h3>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180 text-amber-500" : ""}`} />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

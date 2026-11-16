import React, { useState } from "react";
import { ShieldCheck, FileText, Lock, CheckCircle2 } from "lucide-react";

export default function TermsPrivacyView() {
  const [activeTab, setActiveTab] = useState("terms"); // 'terms' or 'privacy'

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display">
            {activeTab === "terms" ? "Terms & Rental Agreement" : "Privacy Policy"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Last updated: November 2026 • BOOKNIQUE Store Operations
          </p>
        </div>

        <div className="inline-flex p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab("terms")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "terms" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Terms & Conditions
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "privacy" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Privacy Policy
          </button>
        </div>
      </div>

      {activeTab === "terms" ? (
        <div className="space-y-6 text-xs text-slate-700 leading-relaxed bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">1. Acceptance of Rental Agreement</h3>
            <p>
              By accessing the BOOKNIQUE website or installing the BOOKNIQUE Android mobile application, you agree to enter into a legally binding rental and subscription agreement with Booknique, headquartered at Neeladri Road, Electronic City Phase 1, Bengaluru - 560100.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">2. Rental Period, Due Dates & Renewals</h3>
            <p>
              Items are rented for the specified duration (15 days or 30 days) selected during checkout. The due date is clearly visible in the "My Rentals" screen. Customers may extend their rental period at any time before the due date subject to availability.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">3. Late Returns & Daily Charges</h3>
            <p>
              If an item is not returned by the due date and no renewal has been requested, a standard late fee of ₹30 per day per item will be automatically computed and debited from the customer account or held deposit upon final check-in.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">4. Item Condition & Security Deposits</h3>
            <p>
              Normal play and reading wear is anticipated. However, in cases of severe deliberate damage (e.g., submersion in water, torn covers, missing electronic modules), the repair or replacement cost will be deducted from the security deposit held. Any excess deposit will be promptly refunded via UPI within 24 hours.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">5. Sanitization Commitment</h3>
            <p>
              Booknique certifies that all items dispatched undergo medical UVC chamber disinfection and non-toxic surface cleaning before delivery. Customers are requested to treat the items with care and maintain basic cleanliness.
            </p>
          </section>
        </div>
      ) : (
        <div className="space-y-6 text-xs text-slate-700 leading-relaxed bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">1. Information We Collect</h3>
            <p>
              We collect information necessary to fulfill doorstep deliveries and maintain user accounts in Bengaluru: your full name, phone number, delivery address, email address, rental transaction history, and device identifiers.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">2. Payment Security (Razorpay)</h3>
            <p>
              We do not store your credit card numbers, debit card PINs, or UPI passwords on our servers. All financial transactions are securely handled through authorized Indian payment gateways conforming to RBI and PCI-DSS standards.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">3. Shared Web and Mobile Session Storage</h3>
            <p>
              To provide a continuous experience between our website and Android mobile app, authenticated session tokens (JWT) are stored locally in your browser/device storage. You can revoke this anytime by tapping "Sign Out" or clearing the application cache.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">4. Contact Our Data Protection Officer</h3>
            <p>
              For any queries regarding your data, address deletion, or rental record history, write to us at <span className="font-semibold text-amber-600">privacy@booknique.com</span> or call <span className="font-semibold text-amber-600">+91 9000357691</span>.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}

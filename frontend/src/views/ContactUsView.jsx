import React, { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from "lucide-react";

export default function ContactUsView() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Rental Inquiry",
    message: ""
  });

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", phone: "", subject: "Rental Inquiry", message: "" });
    }, 4000);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display">Contact & Visit Booknique</h1>
        <p className="text-xs text-slate-500 mt-1">
          Have a question about subscriptions, sanitized delivery, or looking for a specific toy? We are here for you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info Card */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
              Store Location
            </span>
            <div className="flex items-start gap-3 text-xs text-slate-300">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>4th Floor, Above Titan Eye Plus, Neeladri Road, Electronic City Phase 1, Bengaluru - 560100</p>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
              Customer Support Helpline
            </span>
            <div className="space-y-1 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <a href="tel:+919000357691" className="hover:text-amber-300">+91 9000357691</a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <a href="tel:+919731597313" className="hover:text-amber-300">+91 9731597313</a>
              </div>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
              Email Desk
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>support@booknique.com</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
              Operating Hours
            </span>
            <div className="flex items-start gap-2 text-xs text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Tuesday – Sunday: 10:00 AM – 8:30 PM</p>
                <p className="text-slate-400 text-[11px]">Mondays: Sanitization & Restock Day</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="md:col-span-2 p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Thank You for Reaching Out!</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Your message has been received by our Electronic City customer desk. An executive will call or WhatsApp you within 2 business hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <h3 className="text-base font-bold text-slate-900 mb-2">Send us a Message</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sundaram"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98450 12345"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Inquiry Topic</label>
                <select
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="Rental Inquiry">Rental Inquiry & Book Availability</option>
                  <option value="Delivery Schedule">Doorstep Delivery in Bengaluru</option>
                  <option value="Membership Plans">Membership Subscription Plans</option>
                  <option value="Toy Request">Requesting a Special STEM Toy</option>
                  <option value="Other">Other Questions</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Message *</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Tell us what books or toys you are looking for..."
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Send className="w-4 h-4" />
                Submit Inquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

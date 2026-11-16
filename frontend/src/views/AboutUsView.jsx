import React from "react";
import { BookOpen, Sparkles, Heart, ShieldCheck, MapPin, Phone, Award, Users, RefreshCw } from "lucide-react";

export default function AboutUsView({ onNavigate }) {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white p-8 md:p-12 shadow-xl border border-amber-500/20">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Electronic City, Bengaluru
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold font-display leading-tight mb-4">
            Curating Joy, Knowledge & Curiosity for Every Child.
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
            Welcome to <strong className="text-white">BOOKNIQUE</strong>, Bengaluru’s premier books and educational toys rental sanctuary. Located on Neeladri Road, Electronic City, we bring sustainable learning, world-class board books, fantasy novels, and STEM construction toys directly to your doorstep.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate("customer_catalog")}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/25 transition-all"
            >
              Explore Our Collection
            </button>
            <button
              onClick={() => onNavigate("contact_us")}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all"
            >
              Visit Our Store
            </button>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">Curated Reading Journeys</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            From touch-and-feel infant board books to award-winning Sudha Murty adventures and J.K. Rowling fantasy series, our library expands with your child's age.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">Hospital-Grade Sanitization</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every toy and book undergoes a 3-tier non-toxic ultraviolet sterilization and ultrasonic wipe-down process between rentals. Guaranteed safe for oral-stage infants.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">Eco-Conscious & Decluttered</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Kids outgrow toys in weeks. By sharing and rotating premium playthings like Lego sets and wooden train tables, parents save up to 80% and minimize plastic waste.
          </p>
        </div>
      </div>

      {/* Physical Store Presence */}
      <div className="p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
            Flagship Experience Center
          </span>
          <h2 className="text-2xl font-bold font-display mb-2">
            Visit Booknique Electronic City
          </h2>
          <p className="text-xs text-slate-400 max-w-lg mb-4">
            Browse shelves in person, let children participate in weekend storytelling circles, or pickup your pre-ordered bags directly.
          </p>
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>4th Floor, Above Titan Eye Plus, Neeladri Road, ECITY-1, Bengaluru - 560100</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400" />
              <span>+91 9000357691 / 9731597313</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate("customer_subscription")}
          className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs whitespace-nowrap shadow-md transition-all"
        >
          View Membership Plans
        </button>
      </div>
    </div>
  );
}

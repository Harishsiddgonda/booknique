import React, { useState } from "react";
import { BookOpen, Package, Truck, ArrowRight, Check } from "lucide-react";

export default function OnboardingModal({ onComplete }) {
  const [slide, setSlide] = useState(0);

  const slides = [
    {
      icon: BookOpen,
      badge: "Curated Children's Books",
      title: "Discover Stories That Inspire",
      desc: "Borrow classic board books, fairy tales, award-winning picture books, and fantasy adventures for all age groups.",
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
      color: "from-amber-500 to-yellow-400"
    },
    {
      icon: Package,
      badge: "STEM & Construction Sets",
      title: "Play, Build, Learn & Grow",
      desc: "Explore Lego classic boxes, wooden railways, sensory baby gym mats, and robotics kits with zero storage clutter.",
      image: "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=600&q=80",
      color: "from-blue-500 to-indigo-500"
    },
    {
      icon: Truck,
      badge: "Doorstep Delivery in Bengaluru",
      title: "Sanitized & Delivered To You",
      desc: "Enjoy doorstep drop-off and pickup across Electronic City & South Bengaluru. Fully sanitized before every dispatch.",
      image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80",
      color: "from-emerald-500 to-teal-400"
    }
  ];

  function handleNext() {
    if (slide < slides.length - 1) {
      setSlide(slide + 1);
    } else {
      localStorage.setItem("booknique_onboarded", "true");
      onComplete();
    }
  }

  function handleSkip() {
    localStorage.setItem("booknique_onboarded", "true");
    onComplete();
  }

  const current = slides[slide];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
        
        {/* Top Image Banner */}
        <div className="relative h-56 bg-slate-900 overflow-hidden">
          <img
            src={current.image}
            alt={current.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
          
          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 px-3 py-1 rounded-full bg-slate-900/60 backdrop-blur-md text-white text-[11px] font-bold"
          >
            Skip
          </button>

          {/* Badge */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <div className={`p-2 rounded-xl bg-gradient-to-tr ${current.color} text-slate-950 shadow-md`}>
              <Icon className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-xs font-bold text-white tracking-wide">
              {current.badge}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-black font-display text-slate-900 leading-snug">
            {current.title}
          </h2>

          <p className="text-xs text-slate-600 leading-relaxed">
            {current.desc}
          </p>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5 pt-2">
            {slides.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  slide === idx ? "w-6 bg-amber-500" : "w-2 bg-slate-200"
                }`}
              />
            ))}
          </div>

          {/* Bottom Button */}
          <button
            onClick={handleNext}
            className="w-full py-3 px-4 rounded-xl font-extrabold text-xs text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all mt-4"
          >
            <span>{slide === slides.length - 1 ? "Get Started" : "Continue"}</span>
            {slide === slides.length - 1 ? (
              <Check className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

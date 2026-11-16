import React, { useEffect, useState } from "react";
import { BookOpen, Sparkles } from "lucide-react";

export default function SplashScreen({ onFinish }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        onFinish();
      }, 400);
    }, 1800);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center p-6 text-white transition-opacity duration-400 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background glow circle */}
      <div className="absolute w-72 h-72 bg-amber-500/15 rounded-full blur-3xl animate-pulse" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-4">
        {/* Animated Brand Emblem */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center shadow-2xl shadow-amber-500/30 animate-bounce duration-1000">
            <BookOpen className="w-10 h-10 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Brand Name */}
        <div>
          <h1 className="text-3xl font-black tracking-wider font-display text-white">
            BOOK<span className="text-amber-400">NIQUE</span>
          </h1>
          <p className="text-[11px] uppercase tracking-widest text-amber-300/90 font-bold mt-1">
            The Book & Toy Store
          </p>
        </div>

        {/* Tagline */}
        <p className="text-xs text-slate-400 max-w-xs font-medium">
          "Books • Knowledge • A Brighter Tomorrow"
        </p>

        {/* Loading Spinner */}
        <div className="pt-8 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping delay-150" />
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping delay-300" />
        </div>

        <p className="text-[10px] text-slate-500 font-mono pt-2">
          Electronic City Phase 1 • Bengaluru
        </p>
      </div>
    </div>
  );
}

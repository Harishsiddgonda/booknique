import React from "react";
import { Home, Compass, ShoppingBag, BookOpen, User, Repeat2 } from "lucide-react";

export default function MobileBottomNav({
  activeTab,
  onNavigate,
  cartCount = 0,
  activeRentalsCount = 0
}) {
  const tabs = [
    { id: "customer_home", label: "Home", icon: Home },
    { id: "customer_catalog", label: "Explore", icon: Compass },
    { id: "customer_rentals", label: "My Rentals", icon: Repeat2, badge: activeRentalsCount },
    { id: "cart_drawer", label: "Bag", icon: ShoppingBag, badge: cartCount },
    { id: "customer_profile", label: "Profile", icon: User }
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 text-slate-400 py-2 px-3 md:hidden safe-area-bottom shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive =
            activeTab === tab.id ||
            (tab.id === "customer_catalog" && activeTab === "explore") ||
            (tab.id === "customer_home" && activeTab === "dashboard");

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? "text-amber-400 font-bold scale-105"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
                {tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center shadow">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium tracking-tight">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

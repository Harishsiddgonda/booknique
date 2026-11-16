import React, { useState } from "react";
import {
  Search,
  ShoppingBag,
  Bell,
  Menu,
  X,
  User,
  LogOut,
  Sparkles,
  BookOpen,
  Check,
  ShieldCheck,
  MapPin
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Header({
  search,
  setSearch,
  cartCount,
  onOpenCart,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onToggleSidebar,
  onOpenAuth,
  activeTab,
  onNavigate
}) {
  const { user, customer, role, switchDemo, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left: Mobile Toggle & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={() => onNavigate(role === "customer" ? "customer_catalog" : "dashboard")}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-wider text-white font-display">
                    BOOK<span className="text-amber-400">NIQUE</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 hidden sm:inline-block">
                    The Book & Toy Store
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <MapPin className="w-3 h-3 text-amber-400/80" />
                  <span>Neeladri Road, ECITY-1, Bengaluru</span>
                </div>
              </div>
            </button>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search books, toys, age group, or authors..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right: Role Switcher, Cart, Notifications & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Demo Role Switcher */}
            <div className="hidden sm:flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
              <button
                onClick={() => switchDemo("admin")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  role === "admin"
                    ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
                title="Switch to Admin Dashboard"
              >
                Admin
              </button>
              <button
                onClick={() => switchDemo("staff")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  role === "staff"
                    ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
                title="Switch to Staff Desk"
              >
                Staff
              </button>
              <button
                onClick={() => switchDemo("david.chen@example.com")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  role === "customer"
                    ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
                title="Switch to Customer Member View"
              >
                Customer
              </button>
            </div>

            {/* Cart / Bag Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-200 hover:text-amber-400 hover:border-amber-400/50 transition-all"
              title="View Rental Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-amber-500 text-slate-950 text-[11px] font-black rounded-full flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-200 hover:text-amber-400 hover:border-amber-400/50 transition-all"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                )}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full" />
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={onMarkAllNotificationsRead}
                        className="text-xs text-amber-600 hover:text-amber-700 font-semibold"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 6).map(n => (
                        <div
                          key={n.id}
                          onClick={() => onMarkNotificationRead(n.id)}
                          className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors text-xs flex items-start gap-2.5 ${
                            !n.is_read ? "bg-amber-50/50" : ""
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                              n.type === "danger"
                                ? "bg-rose-500"
                                : n.type === "warning"
                                ? "bg-amber-500"
                                : "bg-blue-500"
                            }`}
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">{n.title}</p>
                            <p className="text-slate-600 mt-0.5">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 font-bold flex items-center justify-center text-xs shadow">
                    {user.name?.charAt(0) || "U"}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-xs font-bold leading-tight truncate max-w-[110px]">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-amber-400 uppercase font-bold tracking-wider leading-none mt-0.5">
                      {role}
                    </p>
                  </div>
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase font-extrabold px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                        {role} account
                      </span>
                    </div>

                    {role === "customer" && (
                      <>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onNavigate("customer_profile");
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span>My Account & Delivery Info</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onNavigate("customer_rentals");
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <ShoppingBag className="w-4 h-4 text-slate-400" />
                          <span>My Borrowed Items</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-all shadow-md"
              >
                Sign In
              </button>
            )}

          </div>
        </div>
      </div>
    </header>
  );
}

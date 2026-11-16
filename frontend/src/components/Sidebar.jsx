import React from "react";
import {
  LayoutDashboard,
  Home,
  Boxes,
  Users,
  Repeat2,
  Truck,
  CreditCard,
  Building2,
  BarChart3,
  Database,
  BookOpen,
  Package,
  ShoppingBag,
  Receipt,
  User,
  ShieldCheck,
  X,
  PhoneCall,
  RotateCcw,
  Wrench,
  Tag,
  Settings,
  ShieldAlert,
  HelpCircle,
  Info,
  Layers,
  FileText
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({
  activeTab,
  onNavigate,
  isOpen,
  onClose
}) {
  const { role, user } = useAuth();

  // Navigation Items per Role
  const adminNav = [
    { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
    { id: "inventory", label: "Inventory Catalog", icon: Boxes },
    { id: "categories", label: "Categories Manager", icon: Layers },
    { id: "members", label: "Members Management", icon: Users },
    { id: "rentals", label: "Rental Orders", icon: Repeat2 },
    { id: "returns_admin", label: "Returns & Late Fees", icon: RotateCcw },
    { id: "damages_admin", label: "Damages & Repairs", icon: Wrench },
    { id: "delivery", label: "Delivery Tracking", icon: Truck },
    { id: "plans", label: "Membership Plans", icon: CreditCard },
    { id: "payments", label: "Invoices & Payments", icon: Receipt },
    { id: "discounts_admin", label: "Coupons & Discounts", icon: Tag },
    { id: "users_admin", label: "User Accounts & Roles", icon: ShieldCheck },
    { id: "procurement", label: "Procurement & Restock", icon: Building2 },
    { id: "reports", label: "Revenue & Reports", icon: BarChart3 },
    { id: "settings_admin", label: "Store & Cloud Settings", icon: Settings },
    { id: "audit_logs_admin", label: "System Audit Logs", icon: ShieldAlert },
    { id: "sql_relational", label: "SQL Relational Explorer", icon: Database }
  ];

  const staffNav = [
    { id: "dashboard", label: "Operations Desk", icon: LayoutDashboard },
    { id: "inventory", label: "Stock & Condition", icon: Boxes },
    { id: "rentals", label: "Issue & Rental Orders", icon: Repeat2 },
    { id: "returns_admin", label: "Return Desk (Check-In)", icon: RotateCcw },
    { id: "damages_admin", label: "Damage Logs", icon: Wrench },
    { id: "delivery", label: "Dispatch & Delivery", icon: Truck },
    { id: "members", label: "Member Verification", icon: Users }
  ];

  const customerNav = [
    { id: "customer_home", label: "Home Dashboard", icon: Home },
    { id: "customer_catalog", label: "Browse Books & Toys", icon: BookOpen },
    { id: "categories", label: "Explore Categories", icon: Layers },
    { id: "customer_rentals", label: "My Borrowed Items", icon: ShoppingBag },
    { id: "customer_subscription", label: "My Subscription Plan", icon: CreditCard },
    { id: "customer_invoices", label: "Invoices & Receipts", icon: Receipt },
    { id: "customer_profile", label: "Account & Settings", icon: User },
    { id: "about_us", label: "About Booknique", icon: Info },
    { id: "faq", label: "FAQs & Guidelines", icon: HelpCircle },
    { id: "contact_us", label: "Contact Store Desk", icon: PhoneCall },
    { id: "terms_privacy", label: "Terms & Privacy Policy", icon: FileText }
  ];

  const items = role === "admin" ? adminNav : role === "staff" ? staffNav : customerNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 md:top-16 z-50 md:z-20 h-screen md:h-[calc(100vh-4rem)] w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex-1 overflow-y-auto py-5 px-3">
          
          {/* Mobile Header with Close Button */}
          <div className="md:hidden flex items-center justify-between pb-4 mb-4 border-b border-slate-800 px-2">
            <span className="font-extrabold text-white text-base tracking-wider font-display">
              BOOK<span className="text-amber-400">NIQUE</span>
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Mode Badge */}
          <div className="px-3 py-2 mb-4 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <div className="flex-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Workspace
              </span>
              <span className="text-xs font-bold text-white capitalize">
                {role === "admin" ? "Admin Control Center" : role === "staff" ? "Staff Operations Desk" : "Member Portal"}
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="space-y-1">
            {items.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                    isActive
                      ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-slate-950" : "text-amber-400/90"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Store Contact Box */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 text-[11px] space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>BookNique Helpline</span>
            </div>
            <p className="text-slate-400">9000357691 / 9731597313</p>
            <p className="text-[10px] text-slate-500">ECITY-1, Bengaluru 560100</p>
          </div>
        </div>
      </aside>
    </>
  );
}

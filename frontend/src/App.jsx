import React, { useEffect, useState, useMemo } from "react";
import {
  Boxes,
  Users,
  Repeat2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  X,
  CreditCard,
  Plus,
  Truck,
  BookOpen,
  Package,
  Calendar,
  Sparkles
} from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { request, formatINR, formatMoney } from "./utils/api";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import CartDrawer from "./components/CartDrawer";
import ReceiptModal from "./components/ReceiptModal";
import AuthModal from "./components/AuthModal";
import SplashScreen from "./components/SplashScreen";
import OnboardingModal from "./components/OnboardingModal";
import MobileBottomNav from "./components/MobileBottomNav";
import ProductQuickView from "./components/ProductQuickView";

import DashboardView from "./views/DashboardView";
import InventoryView from "./views/InventoryView";
import MembersView from "./views/MembersView";
import RentalsView from "./views/RentalsView";
import DeliveryView from "./views/DeliveryView";
import PlansView from "./views/PlansView";
import PaymentsView from "./views/PaymentsView";
import ProcurementView from "./views/ProcurementView";
import ReportsView from "./views/ReportsView";
import SqlRelationalView from "./views/SqlRelationalView";

import HomeDashboardView from "./views/HomeDashboardView";
import CustomerCatalogView from "./views/CustomerCatalogView";
import CustomerRentalsView from "./views/CustomerRentalsView";
import CustomerSubscriptionView from "./views/CustomerSubscriptionView";
import CustomerInvoicesView from "./views/CustomerInvoicesView";
import CustomerProfileView from "./views/CustomerProfileView";

import AboutUsView from "./views/AboutUsView";
import ContactUsView from "./views/ContactUsView";
import FaqView from "./views/FaqView";
import TermsPrivacyView from "./views/TermsPrivacyView";
import CategoriesView from "./views/CategoriesView";

import UsersAdminView from "./views/UsersAdminView";
import ReturnsAdminView from "./views/ReturnsAdminView";
import DamageAdminView from "./views/DamageAdminView";
import DiscountsAdminView from "./views/DiscountsAdminView";
import SettingsAdminView from "./views/SettingsAdminView";
import AuditLogsAdminView from "./views/AuditLogsAdminView";

export default function AppWrapper() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

function MainApp() {
  const { user, customer, role, switchDemo, logout } = useAuth();

  // Navigation states
  const [activeTab, setActiveTab] = useState(role === "customer" ? "customer_home" : "dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [quickViewItem, setQuickViewItem] = useState(null);

  // Check onboarding status
  useEffect(() => {
    const onboarded = localStorage.getItem("booknique_onboarded");
    if (onboarded !== "true") {
      setShowOnboarding(true);
    }
  }, []);

  // Native Android Back Button & Status Bar Handling
  useEffect(() => {
    let backHandler = null;
    import("@capacitor/app").then(({ App }) => {
      backHandler = App.addListener("backButton", () => {
        if (quickViewItem) {
          setQuickViewItem(null);
        } else if (cartOpen) {
          setCartOpen(false);
        } else if (modalType) {
          setModalType("");
        } else if (selectedReceipt) {
          setSelectedReceipt(null);
        } else if (authModalOpen) {
          setAuthModalOpen(false);
        } else if (activeTab !== "customer_home" && activeTab !== "dashboard") {
          setActiveTab(role === "customer" ? "customer_home" : "dashboard");
        } else {
          App.exitApp();
        }
      });
    }).catch(() => {});

    // Status bar styling
    import("@capacitor/status-bar").then(({ StatusBar, Style }) => {
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      StatusBar.setBackgroundColor({ color: "#0F172A" }).catch(() => {});
    }).catch(() => {});

    return () => {
      if (backHandler && backHandler.remove) {
        backHandler.remove();
      }
    };
  }, [quickViewItem, cartOpen, modalType, selectedReceipt, authModalOpen, activeTab, role]);

  // Global search & filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [ageFilter, setAgeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sqlPreset, setSqlPreset] = useState("full_join");

  // Rental Bag (Cart) State
  const [cart, setCart] = useState([]);

  // Toast Notification state
  const [toast, setToast] = useState(null);

  // Core Data States (Fetched directly from MySQL)
  const [dashboardData, setDashboardData] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [plans, setPlans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [procurements, setProcurements] = useState([]);
  const [reports, setReports] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [relationalData, setRelationalData] = useState([]);

  // Modals & Active item state
  const [modalType, setModalType] = useState(""); // 'item', 'member', 'issue', 'return', 'plan'
  const [formData, setFormData] = useState({});
  const [editingItem, setEditingItem] = useState(null);
  const [activeRentalForReturn, setActiveRentalForReturn] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  // Switch default tab on role switch
  useEffect(() => {
    if (role === "customer") {
      setActiveTab("customer_home");
    } else {
      setActiveTab("dashboard");
    }
  }, [role]);

  // Master Data Fetcher
  async function refreshAll() {
    try {
      const [
        dashRes,
        invRes,
        custRes,
        rentRes,
        planRes,
        payRes,
        suppRes,
        procRes,
        notifRes,
        sqlRes
      ] = await Promise.allSettled([
        request("/api/dashboard"),
        request("/api/inventory"),
        request("/api/customers"),
        request("/api/rentals"),
        request("/api/plans"),
        request("/api/payments"),
        request("/api/suppliers"),
        request("/api/procurement"),
        request("/api/notifications"),
        request("/api/query/relational")
      ]);

      if (dashRes.status === "fulfilled") setDashboardData(dashRes.value);
      if (invRes.status === "fulfilled") setInventory(invRes.value);
      if (custRes.status === "fulfilled") setCustomers(custRes.value);
      if (rentRes.status === "fulfilled") setRentals(rentRes.value);
      if (planRes.status === "fulfilled") setPlans(planRes.value);
      if (payRes.status === "fulfilled") setPayments(payRes.value);
      if (suppRes.status === "fulfilled") setSuppliers(suppRes.value);
      if (procRes.status === "fulfilled") setProcurements(procRes.value);
      if (notifRes.status === "fulfilled") setNotifications(notifRes.value);
      if (sqlRes.status === "fulfilled") setRelationalData(sqlRes.value);

      if (activeTab === "reports") {
        const rep = await request("/api/reports/summary").catch(() => null);
        if (rep) setReports(rep);
      }
    } catch (err) {
      console.error("Refresh error:", err);
    }
  }

  useEffect(() => {
    refreshAll();
  }, [activeTab]);

  // Active Member identification
  const currentCustomer = useMemo(() => {
    if (customer) return customer;
    if (user?.role === "customer") {
      return customers.find(c => c.user_id === user.id || c.email === user.email) || customers[1];
    }
    return customers[1] || null; // David Chen fallback
  }, [customer, user, customers]);

  const memberActiveRentals = useMemo(() => {
    if (!currentCustomer) return [];
    return rentals.filter(
      r =>
        (r.customer_id === currentCustomer.id || r.member_code === currentCustomer.member_code) &&
        ["Active", "Due Soon", "Overdue"].includes(r.status)
    );
  }, [rentals, currentCustomer]);

  const memberRentalHistory = useMemo(() => {
    if (!currentCustomer) return [];
    return rentals.filter(
      r =>
        (r.customer_id === currentCustomer.id || r.member_code === currentCustomer.member_code) &&
        r.status === "Returned"
    );
  }, [rentals, currentCustomer]);

  // Cart operations
  function handleAddToCart(item) {
    if (cart.some(c => c.id === item.id)) {
      showToast(`"${item.title}" is already in your rental bag.`, "warning");
      setCartOpen(true);
      return;
    }
    setCart(prev => [...prev, item]);
    showToast(`Added "${item.title}" to your rental bag!`);
    setCartOpen(true);
  }

  function handleRemoveFromCart(itemId) {
    setCart(prev => prev.filter(i => i.id !== itemId));
    showToast("Item removed from rental bag.");
  }

  function handleClearCart() {
    setCart([]);
  }

  function handleCheckoutSuccess(itemCount) {
    showToast(`Successfully placed rental order for ${itemCount} item(s)!`);
    refreshAll();
    setActiveTab("customer_rentals");
  }

  // Delivery status update handler
  async function handleUpdateDelivery(rentalId, deliveryStatus) {
    try {
      await request(`/api/rentals/${rentalId}/delivery`, {
        method: "PATCH",
        body: JSON.stringify({ delivery_status: deliveryStatus })
      });
      showToast(`Delivery stage updated to "${deliveryStatus}".`);
      refreshAll();
    } catch (err) {
      showToast(err.message, "danger");
    }
  }

  // Procurement order intake handler
  async function handleReceiveProcurement(orderId) {
    try {
      await request(`/api/procurement/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "Received" })
      });
      showToast("Order marked as received! Catalog stock incremented in MySQL.");
      refreshAll();
    } catch (err) {
      showToast(err.message, "danger");
    }
  }

  // Notification read handlers
  async function handleMarkNotificationRead(id) {
    try {
      await request(`/api/notifications/${id}/read`, { method: "PATCH" });
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, is_read: 1 } : n)));
    } catch (err) {
      console.warn("Notification error:", err);
    }
  }

  async function handleMarkAllNotificationsRead() {
    try {
      await request("/api/notifications/mark-all-read", { method: "POST" });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      showToast("All notifications marked as read.");
    } catch (err) {
      console.warn("Notification error:", err);
    }
  }

  // Form Submissions (Add / Edit Modals)
  async function handleFormSubmit(e) {
    e.preventDefault();
    try {
      if (modalType === "item") {
        if (editingItem) {
          await request(`/api/inventory/${editingItem.id}`, {
            method: "PUT",
            body: JSON.stringify(formData)
          });
          showToast(`Item "${formData.title || editingItem.title}" updated.`);
        } else {
          await request("/api/inventory", {
            method: "POST",
            body: JSON.stringify(formData)
          });
          showToast(`Item "${formData.title}" added to inventory.`);
        }
      } else if (modalType === "member") {
        if (editingItem) {
          await request(`/api/customers/${editingItem.id}`, {
            method: "PUT",
            body: JSON.stringify(formData)
          });
          showToast(`Member "${formData.full_name || editingItem.full_name}" updated.`);
        } else {
          await request("/api/customers", {
            method: "POST",
            body: JSON.stringify(formData)
          });
          showToast(`Member "${formData.full_name}" registered.`);
        }
      } else if (modalType === "issue") {
        await request("/api/rentals", {
          method: "POST",
          body: JSON.stringify(formData)
        });
        showToast("Rental order issued successfully.");
      } else if (modalType === "return") {
        if (activeRentalForReturn) {
          const res = await request(`/api/rentals/${activeRentalForReturn.id}/return`, {
            method: "PATCH",
            body: JSON.stringify(formData)
          });
          showToast(res.message || "Item return recorded successfully.");
        }
      } else if (modalType === "plan") {
        if (editingItem) {
          await request(`/api/plans/${editingItem.id}`, {
            method: "PUT",
            body: JSON.stringify(formData)
          });
          showToast(`Plan "${formData.name}" updated.`);
        } else {
          await request("/api/plans", {
            method: "POST",
            body: JSON.stringify(formData)
          });
          showToast(`Membership plan "${formData.name}" created.`);
        }
      }

      setModalType("");
      setEditingItem(null);
      setFormData({});
      refreshAll();
    } catch (err) {
      showToast(err.message, "danger");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold text-white transition-all transform animate-in fade-in slide-in-from-bottom-5 ${
            toast.type === "danger"
              ? "bg-rose-600 shadow-rose-600/30"
              : toast.type === "warning"
              ? "bg-amber-600 shadow-amber-600/30"
              : "bg-slate-900 shadow-slate-900/30"
          }`}
        >
          {toast.type === "danger" ? (
            <AlertTriangle className="w-4 h-4 text-white" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <Header
        search={search}
        setSearch={setSearch}
        cartCount={cart.length}
        onOpenCart={() => setCartOpen(true)}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenAuth={() => setAuthModalOpen(true)}
        activeTab={activeTab}
        onNavigate={setActiveTab}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Modern Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onNavigate={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          
          {/* CUSTOMER VIEWS */}
          {activeTab === "customer_home" && (
            <HomeDashboardView
              customer={currentCustomer}
              inventory={inventory}
              activeBorrowCount={memberActiveRentals.length}
              cart={cart}
              onAddToCart={handleAddToCart}
              onQuickView={item => setQuickViewItem(item)}
              onNavigate={setActiveTab}
              onSearchFocus={() => {
                setActiveTab("customer_catalog");
              }}
            />
          )}

          {activeTab === "customer_catalog" && (
            <CustomerCatalogView
              inventory={inventory}
              customer={currentCustomer}
              cart={cart}
              onAddToCart={handleAddToCart}
              search={search}
              setSearch={setSearch}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              ageFilter={ageFilter}
              setAgeFilter={setAgeFilter}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === "customer_rentals" && (
            <CustomerRentalsView
              activeRentals={memberActiveRentals}
              history={memberRentalHistory}
              onReturn={r => {
                setActiveRentalForReturn(r);
                setFormData({
                  condition: "Good (Inspected)",
                  return_date: new Date().toISOString().slice(0, 10)
                });
                setModalType("return");
              }}
              onViewReceipt={r => setSelectedReceipt(r)}
              onBrowseCatalog={() => setActiveTab("customer_catalog")}
            />
          )}

          {activeTab === "customer_subscription" && (
            <CustomerSubscriptionView
              customer={currentCustomer}
              plans={plans}
              activeCount={memberActiveRentals.length}
            />
          )}

          {activeTab === "customer_invoices" && (
            <CustomerInvoicesView
              customer={currentCustomer}
              payments={payments.filter(
                p =>
                  p.customer_id === currentCustomer?.id ||
                  p.customer_name === currentCustomer?.full_name
              )}
              onViewReceipt={p => setSelectedReceipt(p)}
            />
          )}

          {activeTab === "customer_profile" && (
            <CustomerProfileView
              customer={currentCustomer}
              onRefresh={refreshAll}
            />
          )}

          {/* ADMIN & STAFF VIEWS */}
          {activeTab === "dashboard" && (
            <DashboardView
              data={dashboardData}
              inventory={inventory}
              rentals={rentals}
              customers={customers}
              onOpenModal={(type, initial = {}) => {
                setModalType(type);
                setFormData(initial);
              }}
              onNavigate={setActiveTab}
              onReturnRental={r => {
                setActiveRentalForReturn(r);
                setFormData({
                  condition: "Good (Inspected)",
                  return_date: new Date().toISOString().slice(0, 10)
                });
                setModalType("return");
              }}
              onViewReceipt={r => setSelectedReceipt(r)}
            />
          )}

          {activeTab === "inventory" && (
            <InventoryView
              items={inventory}
              search={search}
              setSearch={setSearch}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              ageFilter={ageFilter}
              setAgeFilter={setAgeFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              onAdd={() => {
                setEditingItem(null);
                setFormData({
                  type: "Book",
                  category_name: "Board Book",
                  condition_status: "Excellent",
                  rental_status: "Available",
                  monthly_rental_fee: 149.00,
                  security_deposit: 300.00,
                  replacement_cost: 650.00,
                  total_quantity: 2,
                  age_group: "0-3 years"
                });
                setModalType("item");
              }}
              onEdit={item => {
                setEditingItem(item);
                setFormData({ ...item });
                setModalType("item");
              }}
              onDelete={async id => {
                if (window.confirm("Are you sure you want to delete this inventory item?")) {
                  try {
                    await request(`/api/inventory/${id}`, { method: "DELETE" });
                    showToast("Item deleted from catalog.");
                    refreshAll();
                  } catch (err) {
                    showToast(err.message, "danger");
                  }
                }
              }}
            />
          )}

          {activeTab === "members" && (
            <MembersView
              customers={customers}
              plans={plans}
              search={search}
              setSearch={setSearch}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              onAdd={() => {
                setEditingItem(null);
                setFormData({
                  subscription_plan_id: plans[0]?.id || 1,
                  status: "Active",
                  max_items_allowed: 2,
                  city: "Bengaluru",
                  phone: "+91 98450 12345",
                  address: "Neeladri Road, ECITY-1"
                });
                setModalType("member");
              }}
              onEdit={cust => {
                setEditingItem(cust);
                setFormData({ ...cust });
                setModalType("member");
              }}
              onToggleStatus={async (id, currentStatus) => {
                const newStatus = currentStatus === "Active" ? "Suspended" : "Active";
                try {
                  await request(`/api/customers/${id}/status`, {
                    method: "PATCH",
                    body: JSON.stringify({ status: newStatus })
                  });
                  showToast(`Member status updated to ${newStatus}.`);
                  refreshAll();
                } catch (err) {
                  showToast(err.message, "danger");
                }
              }}
              onDelete={async id => {
                if (window.confirm("Are you sure you want to delete this member?")) {
                  try {
                    await request(`/api/customers/${id}`, { method: "DELETE" });
                    showToast("Member record deleted.");
                    refreshAll();
                  } catch (err) {
                    showToast(err.message, "danger");
                  }
                }
              }}
            />
          )}

          {activeTab === "rentals" && (
            <RentalsView
              rentals={rentals}
              search={search}
              setSearch={setSearch}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              onOpenIssue={() => {
                setFormData({
                  customer_id: customers[0]?.id || 1,
                  item_id: inventory[0]?.id || 1,
                  monthly_fee: inventory[0]?.monthly_rental_fee || 149.00
                });
                setModalType("issue");
              }}
              onProcessReturn={r => {
                setActiveRentalForReturn(r);
                setFormData({
                  condition: "Good (Inspected)",
                  return_date: new Date().toISOString().slice(0, 10)
                });
                setModalType("return");
              }}
              onViewReceipt={r => setSelectedReceipt(r)}
              onUpdateDelivery={handleUpdateDelivery}
            />
          )}

          {activeTab === "delivery" && (
            <DeliveryView
              rentals={rentals}
              onUpdateDelivery={handleUpdateDelivery}
            />
          )}

          {activeTab === "plans" && (
            <PlansView
              plans={plans}
              onAdd={() => {
                setEditingItem(null);
                setFormData({
                  code: `PLAN-${Math.floor(Math.random() * 899 + 100)}`,
                  name: "New Tier",
                  price: 599.00,
                  duration_days: 30,
                  max_books: 2,
                  max_toys: 1,
                  max_total_items: 3,
                  status: "Active"
                });
                setModalType("plan");
              }}
              onEdit={plan => {
                setEditingItem(plan);
                setFormData({ ...plan });
                setModalType("plan");
              }}
              onDelete={async id => {
                if (window.confirm("Are you sure you want to delete this membership plan?")) {
                  try {
                    await request(`/api/plans/${id}`, { method: "DELETE" });
                    showToast("Plan deleted.");
                    refreshAll();
                  } catch (err) {
                    showToast(err.message, "danger");
                  }
                }
              }}
            />
          )}

          {activeTab === "payments" && (
            <PaymentsView
              payments={payments}
              search={search}
              setSearch={setSearch}
              onViewReceipt={p => setSelectedReceipt(p)}
            />
          )}

          {activeTab === "procurement" && (
            <ProcurementView
              procurements={procurements}
              suppliers={suppliers}
              onReceiveOrder={handleReceiveProcurement}
            />
          )}

          {activeTab === "reports" && (
            <ReportsView
              reports={reports}
              dashboardData={dashboardData}
            />
          )}

          {activeTab === "categories" && (
            <CategoriesView
              onSelectCategory={(catName, type) => {
                setTypeFilter(type || "All");
                setSearch(catName);
                setActiveTab("customer_catalog");
              }}
            />
          )}

          {activeTab === "about_us" && (
            <AboutUsView onNavigate={setActiveTab} />
          )}

          {activeTab === "contact_us" && (
            <ContactUsView />
          )}

          {activeTab === "faq" && (
            <FaqView />
          )}

          {activeTab === "terms_privacy" && (
            <TermsPrivacyView />
          )}

          {/* ADMIN SUB-MODULES */}
          {activeTab === "returns_admin" && (
            <ReturnsAdminView
              showToast={showToast}
              onReturnSuccess={refreshAll}
            />
          )}

          {activeTab === "damages_admin" && (
            <DamageAdminView
              showToast={showToast}
            />
          )}

          {activeTab === "discounts_admin" && (
            <DiscountsAdminView
              showToast={showToast}
            />
          )}

          {activeTab === "users_admin" && (
            <UsersAdminView
              showToast={showToast}
            />
          )}

          {activeTab === "settings_admin" && (
            <SettingsAdminView
              showToast={showToast}
            />
          )}

          {activeTab === "audit_logs_admin" && (
            <AuditLogsAdminView
              showToast={showToast}
            />
          )}

          {activeTab === "sql_relational" && (
            <SqlRelationalView
              relationalData={relationalData}
              sqlPreset={sqlPreset}
              setSqlPreset={setSqlPreset}
            />
          )}

        </main>
      </div>

      {/* Cart / Rental Bag Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onRemoveFromCart={handleRemoveFromCart}
        onClearCart={handleClearCart}
        activeBorrowCount={memberActiveRentals.length}
        onCheckoutSuccess={handleCheckoutSuccess}
      />

      {/* Tax Invoice & Printable Receipt Modal */}
      <ReceiptModal
        receipt={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />

      {/* Sign In & Registration Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onNavigate={id => {
          if (id === "cart_drawer") {
            setCartOpen(true);
          } else {
            setActiveTab(id);
          }
        }}
        cartCount={cart.length}
        activeRentalsCount={memberActiveRentals.length}
      />

      {/* Product Quick View Modal */}
      {quickViewItem && (
        <ProductQuickView
          item={quickViewItem}
          isInCart={cart.some(c => c.id === quickViewItem.id)}
          onClose={() => setQuickViewItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Onboarding Carousel Modal */}
      {showOnboarding && (
        <OnboardingModal onComplete={() => setShowOnboarding(false)} />
      )}

      {/* Native Splash Screen */}
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}

      {/* ============================================================ */}
      {/* ACTION DIALOGS (ITEM, MEMBER, ISSUE, RETURN, PLAN)           */}
      {/* ============================================================ */}

      {/* ADD / EDIT ITEM MODAL */}
      {modalType === "item" && (
        <ModalWrapper
          title={editingItem ? "Edit Inventory Item" : "Add Book or Toy to Catalog"}
          onClose={() => setModalType("")}
        >
          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title || ""}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Type *</label>
                <select
                  value={formData.type || "Book"}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white focus:outline-none"
                >
                  <option value="Book">Book</option>
                  <option value="Toy">Toy</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category_name || ""}
                  onChange={e => setFormData({ ...formData, category_name: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Age Group</label>
                <input
                  type="text"
                  value={formData.age_group || "All ages"}
                  onChange={e => setFormData({ ...formData, age_group: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Monthly Fee (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.monthly_rental_fee ?? 149.00}
                  onChange={e => setFormData({ ...formData, monthly_rental_fee: parseFloat(e.target.value) })}
                  className="w-full p-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Deposit (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.security_deposit ?? 300.00}
                  onChange={e => setFormData({ ...formData, security_deposit: parseFloat(e.target.value) })}
                  className="w-full p-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Stock Units</label>
                <input
                  type="number"
                  value={formData.total_quantity ?? 2}
                  onChange={e => setFormData({ ...formData, total_quantity: parseInt(e.target.value) })}
                  className="w-full p-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Cover Image URL</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={formData.image_url || ""}
                onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full p-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setModalType("")}
                className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 font-extrabold text-slate-950 shadow"
              >
                Save Item
              </button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* ADD / EDIT MEMBER MODAL */}
      {modalType === "member" && (
        <ModalWrapper
          title={editingItem ? "Edit Member Account" : "Register New Subscriber"}
          onClose={() => setModalType("")}
        >
          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.full_name || ""}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full p-2 rounded-xl border border-slate-300 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email || ""}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-300 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number (Bengaluru) *</label>
                <input
                  type="text"
                  required
                  value={formData.phone || ""}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-300 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Doorstep Address</label>
              <input
                type="text"
                value={formData.address || ""}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2 rounded-xl border border-slate-300 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Subscription Plan</label>
                <select
                  value={formData.subscription_plan_id || 1}
                  onChange={e => setFormData({ ...formData, subscription_plan_id: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white focus:outline-none"
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatINR(p.price)}/mo)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Max Borrow Quota</label>
                <input
                  type="number"
                  value={formData.max_items_allowed || 2}
                  onChange={e => setFormData({ ...formData, max_items_allowed: parseInt(e.target.value) })}
                  className="w-full p-2 rounded-xl border border-slate-300 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setModalType("")}
                className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 font-extrabold text-slate-950 shadow"
              >
                Save Member
              </button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* ISSUE RENTAL MODAL (STAFF / ADMIN) */}
      {modalType === "issue" && (
        <ModalWrapper
          title="Issue New Book or Toy Rental"
          onClose={() => setModalType("")}
        >
          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Member *</label>
              <select
                value={formData.customer_id || ""}
                onChange={e => setFormData({ ...formData, customer_id: e.target.value })}
                className="w-full p-2 rounded-xl border border-slate-300 bg-white focus:outline-none"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.member_code} - {c.full_name} ({c.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Catalog Item *</label>
              <select
                value={formData.item_id || ""}
                onChange={e => {
                  const itm = inventory.find(i => String(i.id) === e.target.value);
                  setFormData({
                    ...formData,
                    item_id: e.target.value,
                    monthly_fee: itm?.monthly_rental_fee || 149.00
                  });
                }}
                className="w-full p-2 rounded-xl border border-slate-300 bg-white focus:outline-none"
              >
                {inventory.map(i => (
                  <option key={i.id} value={i.id} disabled={i.available_quantity < 1}>
                    {i.item_code} - {i.title} ({formatINR(i.monthly_rental_fee)}/mo) {i.available_quantity < 1 ? "[Out of Stock]" : `[${i.available_quantity} available]`}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Rental Checkout Fee (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.monthly_fee ?? 149.00}
                  onChange={e => setFormData({ ...formData, monthly_fee: parseFloat(e.target.value) })}
                  className="w-full p-2 rounded-xl border border-slate-300 font-bold focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.due_date || ""}
                  onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-300 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setModalType("")}
                className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 font-extrabold text-slate-950 shadow"
              >
                Confirm Issue
              </button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* PROCESS RETURN MODAL */}
      {modalType === "return" && (
        <ModalWrapper
          title={`Process Return: ${activeRentalForReturn?.item_title || ""}`}
          onClose={() => setModalType("")}
        >
          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Order Code:</span>
                <strong className="text-slate-900">{activeRentalForReturn?.rental_code}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <strong className="text-slate-900">{activeRentalForReturn?.customer_name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Due Date:</span>
                <strong className="text-slate-900">{activeRentalForReturn?.due_date}</strong>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
              <p className="font-bold flex items-center gap-1.5 mb-1">
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span>Automatic Late Fee Calculation</span>
              </p>
              <p className="text-[11px] leading-relaxed">
                Overdue items are automatically charged at <b>₹50.00/day</b> past the due date. The inventory item stock will be restored to <em>Available</em> in MySQL.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Return Date</label>
              <input
                type="date"
                required
                value={formData.return_date || new Date().toISOString().slice(0, 10)}
                onChange={e => setFormData({ ...formData, return_date: e.target.value })}
                className="w-full p-2 rounded-xl border border-slate-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Inspected Condition on Return</label>
              <select
                value={formData.condition || "Good (Inspected)"}
                onChange={e => setFormData({ ...formData, condition: e.target.value })}
                className="w-full p-2 rounded-xl border border-slate-300 bg-white focus:outline-none"
              >
                <option value="Excellent">Excellent (No defects)</option>
                <option value="Good (Inspected)">Good (Slight normal wear)</option>
                <option value="Needs Cleaning">Needs Cleaning / Sanitization</option>
                <option value="Damaged">Damaged (Charge repair fee)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setModalType("")}
                className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 font-extrabold text-slate-950 shadow"
              >
                Confirm Return & Restore Stock
              </button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* ADD / EDIT PLAN MODAL */}
      {modalType === "plan" && (
        <ModalWrapper
          title={editingItem ? "Edit Membership Plan" : "Create Membership Plan"}
          onClose={() => setModalType("")}
        >
          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Plan Name *</label>
              <input
                type="text"
                required
                value={formData.name || ""}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 rounded-xl border border-slate-300 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Monthly Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price ?? 499.00}
                  onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full p-2 rounded-xl border border-slate-300 font-bold focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Max Total Items</label>
                <input
                  type="number"
                  required
                  value={formData.max_total_items ?? 3}
                  onChange={e => setFormData({ ...formData, max_total_items: parseInt(e.target.value) })}
                  className="w-full p-2 rounded-xl border border-slate-300 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Plan Description</label>
              <textarea
                rows={2}
                value={formData.description || ""}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 rounded-xl border border-slate-300 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setModalType("")}
                className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 font-extrabold text-slate-950 shadow"
              >
                Save Plan
              </button>
            </div>
          </form>
        </ModalWrapper>
      )}

    </div>
  );
}

// Reusable Modal Wrapper
function ModalWrapper({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      />
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <h3 className="font-bold text-sm font-display text-white">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

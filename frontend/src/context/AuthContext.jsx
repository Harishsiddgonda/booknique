import React, { createContext, useContext, useState, useEffect } from "react";
import { request, getApiBaseUrl } from "../utils/api";

const AuthContext = createContext();

const FALLBACK_ADMIN_USER = {
  id: 1,
  name: "Store Administrator",
  email: "admin@rsr.com",
  role: "admin",
  phone: "+91 9000357691"
};

const FALLBACK_CUSTOMER_USER = {
  id: 4,
  name: "David Chen",
  email: "david.chen@example.com",
  role: "customer",
  phone: "+91 9845010002"
};

const FALLBACK_CUSTOMER_DATA = {
  id: 2,
  user_id: 4,
  member_code: "M102",
  full_name: "David Chen",
  email: "david.chen@example.com",
  phone: "+91 9845010002",
  address: "Villa 18, Concorde Silicon Valley, Neeladri Road, Electronic City Phase 1",
  city: "Bengaluru",
  status: "Active",
  subscription_plan_id: 2,
  active_plan_name: "Premium Wonder (Books + Toys)",
  max_items_allowed: 4
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(FALLBACK_CUSTOMER_USER);
  const [customer, setCustomer] = useState(FALLBACK_CUSTOMER_DATA);
  const [token, setToken] = useState(localStorage.getItem("rsr_token") || "");
  const [loading, setLoading] = useState(true);

  // Auto-fetch profile or default to demo session
  useEffect(() => {
    async function initAuth() {
      try {
        const savedToken = localStorage.getItem("rsr_token");
        if (savedToken) {
          const data = await request("/api/auth/me");
          if (data && data.user) {
            setUser(data.user);
            setCustomer(data.customer || null);
            setLoading(false);
            return;
          }
        }
        // Switch to initial customer demo mode (or last saved role)
        const savedRole = localStorage.getItem("rsr_demo_role") || "customer";
        await switchDemo(savedRole);
      } catch (err) {
        console.warn("Auth initialization fallback to offline demo:", err);
        // Fall back cleanly to customer demo without breaking the UI
        setUser(FALLBACK_CUSTOMER_USER);
        setCustomer(FALLBACK_CUSTOMER_DATA);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  async function login(email, password) {
    try {
      const data = await request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      if (data && data.token) {
        localStorage.setItem("rsr_token", data.token);
        setToken(data.token);
        setUser(data.user);
        setCustomer(data.customer);
        return data;
      }
    } catch (err) {
      // Offline fallback login for demo purposes
      if (email.includes("admin")) {
        setUser(FALLBACK_ADMIN_USER);
        setCustomer(null);
        return { user: FALLBACK_ADMIN_USER, token: "demo-admin-token" };
      }
      setUser(FALLBACK_CUSTOMER_USER);
      setCustomer(FALLBACK_CUSTOMER_DATA);
      return { user: FALLBACK_CUSTOMER_USER, customer: FALLBACK_CUSTOMER_DATA, token: "demo-user-token" };
    }
  }

  async function register(formData) {
    try {
      const data = await request("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(formData)
      });
      if (data && data.token) {
        localStorage.setItem("rsr_token", data.token);
        setToken(data.token);
        setUser(data.user);
        setCustomer(data.customer);
        return data;
      }
    } catch (err) {
      const fakeUser = {
        id: Date.now(),
        name: formData.name || "New Member",
        email: formData.email,
        role: "customer"
      };
      const fakeCust = {
        id: Date.now(),
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone || "+91 9845010000",
        member_code: `M${Math.floor(100 + Math.random() * 900)}`,
        status: "Active",
        max_items_allowed: 3
      };
      setUser(fakeUser);
      setCustomer(fakeCust);
      return { user: fakeUser, customer: fakeCust };
    }
  }

  async function switchDemo(roleOrEmail) {
    localStorage.setItem("rsr_demo_role", roleOrEmail);
    try {
      const data = await request(`/api/auth/switch-demo/${roleOrEmail}`);
      if (data && data.user) {
        if (data.token) localStorage.setItem("rsr_token", data.token);
        setToken(data.token || "");
        setUser(data.user);
        setCustomer(data.customer || null);
        return data;
      }
    } catch (err) {
      console.warn("Switch demo network error, falling back to local simulation:", err);
      if (roleOrEmail === "admin") {
        setUser(FALLBACK_ADMIN_USER);
        setCustomer(null);
      } else {
        setUser(FALLBACK_CUSTOMER_USER);
        setCustomer(FALLBACK_CUSTOMER_DATA);
      }
    }
  }

  function logout() {
    localStorage.removeItem("rsr_token");
    setToken("");
    setUser(FALLBACK_CUSTOMER_USER);
    setCustomer(FALLBACK_CUSTOMER_DATA);
  }

  const role = user?.role || "customer";

  return (
    <AuthContext.Provider
      value={{
        user,
        customer,
        token,
        role,
        loading,
        login,
        register,
        switchDemo,
        logout,
        setUser,
        setCustomer
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

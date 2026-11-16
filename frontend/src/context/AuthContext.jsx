import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("rsr_token") || "");
  const [loading, setLoading] = useState(true);

  // Auto-fetch profile or default to admin demo session
  useEffect(() => {
    async function initAuth() {
      try {
        const savedToken = localStorage.getItem("rsr_token");
        if (savedToken) {
          const res = await fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${savedToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            setCustomer(data.customer);
            setLoading(false);
            return;
          }
        }
        // If no token or invalid, switch to default admin demo
        await switchDemo("admin");
      } catch (err) {
        console.warn("Auth initialization fallback:", err);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  async function login(email, password) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    localStorage.setItem("rsr_token", data.token);
    setToken(data.token);
    setUser(data.user);
    setCustomer(data.customer);
    return data;
  }

  async function register(formData) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");

    localStorage.setItem("rsr_token", data.token);
    setToken(data.token);
    setUser(data.user);
    setCustomer(data.customer);
    return data;
  }

  async function switchDemo(roleOrEmail) {
    try {
      const res = await fetch(`/api/auth/switch-demo/${roleOrEmail}`);
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("rsr_token", data.token);
        setToken(data.token);
        setUser(data.user);
        setCustomer(data.customer);
        return data;
      }
    } catch (err) {
      console.error("Switch demo error:", err);
    }
  }

  function logout() {
    localStorage.removeItem("rsr_token");
    setToken("");
    setUser(null);
    setCustomer(null);
  }

  const role = user?.role || "admin";

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

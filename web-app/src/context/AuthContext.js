import React, { createContext, useContext, useState, useCallback } from "react";
import API from "../api/axios";
import { supabase } from "../config/supabaseClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("resumeai_user")); }
    catch { return null; }
  });

  const login = useCallback(async (email, password, expectedRole) => {
    const { data } = await API.post("/api/auth/login", { email, password, expectedRole });
    if (data.token) {
      localStorage.setItem("resumeai_token", data.token);
    }
    localStorage.setItem("resumeai_user", JSON.stringify(data.user));
    setUser(data.user);
    return data; // includes roleRedirect
  }, []);

  const loginWithGoogle = useCallback(async (expectedRole = "user") => {
    try {
      localStorage.setItem("resumeai_oauth_expected_role", expectedRole);
      const redirectUrl = `${window.location.origin}/auth/callback?role=${expectedRole}`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) throw new Error(error.message || "Google OAuth failed");
      return data;
    } catch (err) {
      console.error("Google OAuth Initialization Error:", err.message);
      throw err instanceof Error ? err : new Error(err?.message || "Google OAuth initialization failed");
    }
  }, []);

  const signup = useCallback(async (payload) => {
    const { data } = await API.post("/api/auth/signup", payload);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await API.post("/api/auth/logout");
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Logout request error:", err);
    } finally {
      localStorage.removeItem("resumeai_token");
      localStorage.removeItem("resumeai_user");
      localStorage.removeItem("resumeai_oauth_expected_role");
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUserState: setUser, login, loginWithGoogle, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../config/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUserState } = useAuth();
  const [error, setError] = useState("");
  const [loadingMsg, setLoadingMsg] = useState("Authenticating with Google...");

  useEffect(() => {
    let isMounted = true;

    async function handleOAuthCallback() {
      try {
        setLoadingMsg("Verifying session tokens...");
        
        // 1. Get session from Supabase client (handles hash and query parsing automatically)
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw new Error(sessionError.message || "Session verification failed");

        let accessToken = sessionData?.session?.access_token;

        // Fallback: Check hash params if session is not immediately hydrated
        if (!accessToken && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          accessToken = hashParams.get("access_token");
        }

        if (!accessToken) {
          // Listen to state change if implicit flow is processing
          const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.access_token && isMounted) {
              await processBackendExchange(session.access_token);
              authListener.subscription.unsubscribe();
            }
          });
          return;
        }

        await processBackendExchange(accessToken);
      } catch (err) {
        console.error("OAuth Callback Error:", err.message);
        let msg = err.response?.data?.message || err.message || "Failed to complete Google authentication.";
        if (msg.includes("provider is not enabled") || msg.includes("validation_failed")) {
          msg = "Google Authentication is disabled in your Supabase Dashboard. Enable Google under Authentication -> Providers.";
        }
        if (isMounted) {
          setError(msg);
        }
      }
    }

    async function processBackendExchange(accessToken) {
      setLoadingMsg("Synchronizing profile with database...");
      
      const expectedRole = searchParams.get("role") || localStorage.getItem("resumeai_oauth_expected_role") || "user";
      localStorage.removeItem("resumeai_oauth_expected_role");

      // 2. Exchange token with Express Backend API
      const { data } = await API.post("/api/auth/google-callback", {
        access_token: accessToken,
        expectedRole,
      });

      if (!isMounted) return;

      // 3. Update Auth Context & Local Storage
      if (data.token) {
        localStorage.setItem("resumeai_token", data.token);
      }
      localStorage.setItem("resumeai_user", JSON.stringify(data.user));
      
      if (setUserState) {
        setUserState(data.user);
      }

      // 4. Redirect user to destination dashboard
      const targetPath = data.roleRedirect || (data.user.role === "recruiter" ? "/dashboard/recruiter" : "/dashboard/user");
      navigate(targetPath, { replace: true });
    }

    handleOAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate, searchParams, setUserState]);

  return (
    <div style={styles.container}>
      <div style={styles.card} className="glass fade-up">
        {error ? (
          <>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>⚠️</div>
            <h2 style={styles.errorTitle}>Authentication Failed</h2>
            <p style={styles.errorMsg}>{error}</p>
            <button style={styles.btn} onClick={() => navigate("/", { replace: true })}>
              Return to Login
            </button>
          </>
        ) : (
          <>
            <div className="spinner" style={styles.spinner} />
            <h2 style={styles.title}>Completing Google Sign In</h2>
            <p style={styles.subtitle}>{loadingMsg}</p>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  card: {
    padding: "40px",
    borderRadius: "16px",
    textAlign: "center",
    maxWidth: "420px",
    width: "100%",
    background: "rgba(15, 23, 42, 0.85)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "4px solid rgba(139, 92, 246, 0.2)",
    borderTopColor: "#8b5cf6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 20px auto",
  },
  title: {
    fontSize: "1.3rem",
    fontWeight: 700,
    color: "#f8fafc",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "0.9rem",
    color: "#94a3b8",
  },
  errorTitle: {
    fontSize: "1.3rem",
    fontWeight: 700,
    color: "#f87171",
    marginBottom: "8px",
  },
  errorMsg: {
    fontSize: "0.9rem",
    color: "#cbd5e1",
    marginBottom: "20px",
  },
  btn: {
    padding: "10px 20px",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    border: "none",
    fontWeight: 600,
    cursor: "pointer",
  },
};

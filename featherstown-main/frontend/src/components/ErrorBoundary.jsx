import React from "react";
import { logClientError } from "../utils/errorMonitoring";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logClientError({
      message: error?.message || "React Component Render Error",
      stack: errorInfo?.componentStack || error?.stack,
      source: window.location.href,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            background: "#0B0F14",
            fontFamily: "Outfit, system-ui, sans-serif",
            color: "#F8FAFC",
          }}
        >
          <div
            style={{
              maxWidth: 480,
              width: "100%",
              background: "#10161E",
              borderRadius: 24,
              padding: "40px 32px",
              textAlign: "center",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.5)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "rgba(22, 163, 74, 0.1)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 34,
                marginBottom: 20,
              }}
            >
              🦜
            </div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#FFFFFF",
                marginBottom: 10,
                letterSpacing: "-0.01em",
              }}
            >
              Something went slightly off course
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "#94A3B8",
                lineHeight: 1.6,
                marginBottom: 28,
              }}
            >
              We encountered an unexpected display hiccup, but don't worry — your cart and data are safe.
            </p>
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={this.handleReload}
                style={{
                  background: "linear-gradient(135deg, #10B981, #059669)",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: 999,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
                }}
              >
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                style={{
                  background: "#161D27",
                  color: "#F8FAFC",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  padding: "12px 24px",
                  borderRadius: 999,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

import React from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🚨 ErrorBoundary caught fatal UI error:", error, errorInfo);
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
          style={{
            minHeight: "100vh",
            background: "#F7F5F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            fontFamily: "Outfit, system-ui, sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: 480,
              width: "100%",
              background: "#FFFFFF",
              borderRadius: 24,
              padding: "40px 32px",
              textAlign: "center",
              boxShadow: "0 12px 36px rgba(0, 0, 0, 0.06)",
              border: "1px solid #E2DDD3",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "#E7EFE8",
                color: "#1B3B22",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <AlertTriangle size={34} strokeWidth={2} />
            </div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: "#152B17",
                marginBottom: 10,
                letterSpacing: "-0.01em",
              }}
            >
              Something went slightly off course
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "#736B5E",
                lineHeight: 1.6,
                marginBottom: 20,
              }}
            >
              We encountered an unexpected display hiccup, but don't worry — your cart and data are safe.
            </p>

            {this.state.error && (
              <details
                style={{
                  marginBottom: 24,
                  textAlign: "left",
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 12,
                  color: "#991B1B",
                }}
              >
                <summary style={{ cursor: "pointer", fontWeight: 700, color: "#DC2626" }}>
                  View technical error details ({this.state.error?.name || "Error"})
                </summary>
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                    marginTop: 8,
                    fontSize: 11,
                    fontFamily: "monospace",
                    color: "#B91C1C",
                    maxHeight: 160,
                    overflowY: "auto",
                  }}
                >
                  {this.state.error?.stack || this.state.error?.message || String(this.state.error)}
                </pre>
              </details>
            )}

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
                  background: "#1B3B22",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: 999,
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                style={{
                  background: "#FAF8F5",
                  color: "#152B17",
                  border: "1.5px solid #E2DDD3",
                  padding: "12px 24px",
                  borderRadius: 999,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

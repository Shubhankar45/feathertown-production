import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.error("ErrorBoundary caught:", error, errorInfo);
    }
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

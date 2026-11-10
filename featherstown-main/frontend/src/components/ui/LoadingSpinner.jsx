export default function LoadingSpinner({
  size = 28,
  color = "#1B3B22",
  text = null,
  fullPage = false,
}) {
  const content = (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
      role="status"
      aria-live="polite"
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: `3px solid rgba(27, 59, 34, 0.15)`,
          borderTopColor: color,
          animation: "btnSpin 0.75s linear infinite",
        }}
      />
      {text && (
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#5A5348",
            fontFamily: "Outfit, system-ui, sans-serif",
          }}
        >
          {text}
        </span>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (fullPage) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          background: "#F7F5F0",
        }}
      >
        {content}
      </div>
    );
  }

  return content;
}


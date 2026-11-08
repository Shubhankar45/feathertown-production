/**
 * ShinyText from React Bits
 * Metallic sweep light across text or badges
 */
export default function ShinyText({
  text,
  disabled = false,
  speed = 4,
  className = "",
  style = {},
}) {
  const animationDuration = `${speed}s`;

  return (
    <span
      className={`inline-block bg-clip-text text-transparent ${
        disabled ? "" : "animate-shine"
      } ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(120deg, rgba(22, 163, 74, 0.95) 0%, rgba(249, 115, 22, 1) 40%, rgba(22, 163, 74, 0.95) 80%)",
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        animationDuration,
        ...style,
      }}
    >
      {text}
    </span>
  );
}


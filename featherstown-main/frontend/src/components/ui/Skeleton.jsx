export function Skeleton({ width = "100%", height = 20, borderRadius = 8, style = {}, className = "" }) {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 20,
        border: "1px solid #E2DDD3",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <Skeleton width="100%" height={200} borderRadius={14} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Skeleton width="60%" height={22} />
        <Skeleton width="25%" height={22} />
      </div>
      <Skeleton width="85%" height={16} />
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <Skeleton width="30%" height={28} borderRadius={6} />
        <Skeleton width="30%" height={28} borderRadius={6} />
        <Skeleton width="30%" height={28} borderRadius={6} />
      </div>
      <Skeleton width="100%" height={40} borderRadius={10} style={{ marginTop: 6 }} />
    </div>
  );
}

export default Skeleton;


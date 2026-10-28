import { getAvatarPath } from "../../config/birdAvatars";

export default function Avatar({ name = "", avatar = "", size = 44, border = true }) {
  const avatarSrc = getAvatarPath(avatar, name);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        overflow: "hidden",
        boxShadow: border ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
        border: border ? "2px solid rgba(255,255,255,0.8)" : "none",
        background: "#0F172A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      title={name || "Bird Parent"}
    >
      <img
        src={avatarSrc}
        alt={name || "Parrot Avatar"}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
        onError={(e) => {
          // Fallback to initial if image fails
          e.currentTarget.style.display = "none";
          if (e.currentTarget.parentElement) {
            e.currentTarget.parentElement.innerText = (name?.[0] || "🦜").toUpperCase();
            e.currentTarget.parentElement.style.color = "#FFFFFF";
            e.currentTarget.parentElement.style.fontWeight = "800";
            e.currentTarget.parentElement.style.fontSize = `${size * 0.45}px`;
          }
        }}
      />
    </div>
  );
}

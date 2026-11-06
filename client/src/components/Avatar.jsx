import React from "react";

export default function Avatar({
  name = "User",
  size = 32,
  className = "",
  style = {},
}) {
  const colors = ["var(--red)", "var(--blue)", "var(--ink)"];

  const bg = React.useMemo(() => {
    let hash = 0;
    const str = name || "User";
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }, [name]);

  const initial = (name ? name.trim().charAt(0) : "?").toUpperCase();

  return (
    <div
      className={`pop-avatar ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        backgroundColor: bg,
        color: "#ffffff",
        border: "2px solid var(--ink)",
        fontFamily: "var(--font-display)",
        fontSize: `${Math.round(size * 0.44)}px`,
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        userSelect: "none",
        ...style,
      }}
      title={name}
      aria-label={`Avatar for ${name}`}
    >
      {initial}
    </div>
  );
}

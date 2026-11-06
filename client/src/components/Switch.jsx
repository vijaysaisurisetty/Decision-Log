import React from "react";

export default function Switch({
  checked = false,
  onChange,
  variant = "blue",
  disabled = false,
  ariaLabel = "Toggle switch",
  id,
}) {
  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleToggle();
    }
  };

  const trackBg = checked
    ? variant === "red"
      ? "var(--red)"
      : "var(--blue)"
    : "var(--white)";

  const thumbBg = checked ? "#ffffff" : "var(--ink)";
  const thumbLeft = checked ? "26px" : "3px";

  return (
    <div
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      tabIndex={disabled ? -1 : 0}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      style={{
        width: "56px",
        height: "32px",
        borderRadius: "var(--radius-pill)",
        border: "3px solid var(--ink)",
        backgroundColor: trackBg,
        position: "relative",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "background-color var(--ease)",
        flexShrink: 0,
        userSelect: "none",
        boxSizing: "border-box",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "3px",
          left: thumbLeft,
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: thumbBg,
          border: "2px solid var(--ink)",
          transition: "left var(--ease), background-color var(--ease)",
          display: "block",
        }}
      />
    </div>
  );
}


import React from "react";
import { DARK, PINK } from "../constants";

const sizes = {
  default: { mark: 44, text: 28, gap: 12, tagline: 12 },
  compact: { mark: 34, text: 18, gap: 10, tagline: 11 },
  small: { mark: 28, text: 16, gap: 8, tagline: 10 },
};

const LOGO_SRC = "/vulatrade-logo.svg";

export default function Logo({
  size = "default",
  iconOnly = false,
  tagline = false,
  href,
  className = "",
  style = {},
}) {
  const cfg = sizes[size] || sizes.default;
  const content = (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: tagline ? "flex-start" : "center",
        gap: cfg.gap,
        textDecoration: "none",
        ...style,
      }}
    >
      <span
        style={{
          width: cfg.mark,
          height: cfg.mark,
          borderRadius: "50%",
          background: "#fff",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 10px 28px rgba(234,76,137,0.22)",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        <img
          src={LOGO_SRC}
          alt={iconOnly ? "VulaTrade" : ""}
          aria-hidden={iconOnly ? undefined : "true"}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      </span>

      {!iconOnly && (
        <span style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1 }}>
          <span
            style={{
              fontSize: cfg.text,
              fontWeight: 950,
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ color: DARK }}>Vula</span>
            <span style={{ color: PINK }}>Trade</span>
          </span>
          {tagline && (
            <span
              style={{
                marginTop: 6,
                color: "#8a8f98",
                fontSize: cfg.tagline,
                fontWeight: 700,
                lineHeight: 1.35,
                whiteSpace: "normal",
              }}
            >
              Start local. Sell smarter. Grow stronger.
            </span>
          )}
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <a href={href} aria-label="VulaTrade home" style={{ textDecoration: "none", display: "inline-flex" }}>
      {content}
    </a>
  );
}

import React, { useState } from "react";

import "./Button.scss";
import { colors } from "../utils/common";

export default function Button({
  children,
  classes = "",
  disabled = false,
  id,
  onClick,
  primaryColor = colors.OD_PURPLE,
  secondary,
  secondaryColor = colors.WHITE,
}) {
  const [hover, setHover] = useState(false);

  return (
    <button
      type="button"
      className={`primary-btn ${classes}`}
      id={id}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      disabled={disabled}
      style={
        !hover
          ? {
              backgroundColor: secondary ? secondaryColor : primaryColor,
              borderColor: primaryColor,
              color: secondary ? primaryColor : secondaryColor,
            }
          : {
              backgroundColor: secondary ? primaryColor : secondaryColor,
              borderColor: primaryColor,
              color: secondary ? secondaryColor : primaryColor,
            }
      }
    >
      {children}
    </button>
  );
}

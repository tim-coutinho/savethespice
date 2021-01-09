import React, { useState } from "react";

import colors from "../utils/colors";

import "./Button.scss";

export default function Button({
  children,
  classes,
  id,
  onClick,
  primaryColor = colors.OD_PURPLE,
  secondary,
  secondaryColor = colors.WHITE
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className={`primary-btn ${classes}`}
      id={id}
      onClick={onClick}
      onMouseEnter={() => setHover(!hover)}
      onMouseLeave={() => setHover(!hover)}
      style={
        !hover
          ? {
              backgroundColor: primaryColor,
              borderColor: secondary ? secondaryColor : primaryColor,
              color: secondaryColor
            }
          : {
              backgroundColor: secondaryColor,
              borderColor: secondary ? secondaryColor : primaryColor,
              color: primaryColor
            }
      }
    >
      {children}
    </div>
  );
}

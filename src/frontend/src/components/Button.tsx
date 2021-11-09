import { MouseEventHandler, ReactChild, ReactElement, useState } from "react";
import { Color } from "../lib/common";

import "./Button.scss";

interface ButtonProps {
  children: ReactChild;
  classes?: string;
  disabled?: boolean;
  id?: string;
  onClick: MouseEventHandler;
  primaryColor?: Color;
  secondary?: boolean;
  secondaryColor?: Color;
}

export default ({
  children,
  classes = "",
  disabled = false,
  id,
  onClick,
  primaryColor = Color.OD_PURPLE,
  secondary,
  secondaryColor = Color.WHITE,
}: ButtonProps): ReactElement => {
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
};

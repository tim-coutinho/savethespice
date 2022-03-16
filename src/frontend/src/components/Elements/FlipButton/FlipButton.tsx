import { Button, ButtonProps, PolymorphicComponentProps } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { ElementType, ReactElement } from "react";

type FlipButtonProps<C extends ElementType = "button"> = PolymorphicComponentProps<
  C,
  ButtonProps<C>
> & {
  border?: boolean;
  hoverOverride?: boolean;
  length?: number;
  square?: boolean;
};

type FlipButtonComponent = <C extends ElementType = "button">(
  props: FlipButtonProps<C>,
) => ReactElement;

export const FlipButton: FlipButtonComponent = ({
  border,
  hoverOverride,
  length,
  square,
  ...props
}) => {
  const { hovered, ref } = useHover<HTMLButtonElement>();
  if (square && length === undefined) {
    throw new Error("FlipButton marked as square but length not provided");
  }

  return (
    <Button
      {...props}
      variant={hoverOverride ? "white" : hovered ? "white" : "filled"}
      ref={ref}
      sx={theme => ({
        ...(typeof props.sx === "function" ? props.sx(theme) : props.sx),
        border: border
          ? `2px solid ${
              theme.colors[props.color || theme.primaryColor][theme.colorScheme === "light" ? 6 : 8]
            }`
          : undefined,
        ...(length !== undefined ? { width: length, height: length, padding: 0 } : {}),
      })}
    />
  );
};

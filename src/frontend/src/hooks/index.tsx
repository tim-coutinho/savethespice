import { useEffect, useRef } from "react";

/**
 * Holds the previous value of any variable - props, state, etc.
 * @param value Any value that will change.
 */
export const usePrevious = <T,>(value: T): T | undefined => {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};
